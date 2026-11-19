"use client";;
import { cssColor, DitherShader } from "@/lib/dither";

const MASKS = {
  bottom: 3,
  center: 1,
  edges: 4,
  none: 0,
  top: 2
};

const VARIANTS = {
  contours: 2,
  marble: 3,
  ridges: 1,
  smoke: 0
};

const FIELD = `
const mat2 NF_ROTATE = mat2(0.8, -0.6, 0.6, 0.8);

float nf_fbm(vec2 p, float octaves) {
  float sum = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= octaves) {
      break;
    }
    sum += amp * snoise(p);
    norm += amp;
    p = NF_ROTATE * p * 2.02 + vec2(11.3, 4.7);
    amp *= 0.5;
  }
  return clamp(0.5 + 0.5 * sum / norm, 0.0, 1.0);
}

float nf_ridges(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= noiseDetail) {
      break;
    }
    float r = 1.0 - abs(snoise(p));
    sum += amp * r * r;
    norm += amp;
    p = NF_ROTATE * p * 2.02 + vec2(11.3, 4.7);
    amp *= 0.5;
  }
  return sum / norm;
}

float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * noiseScale;
  vec2 drift = vec2(cos(noiseAngle), sin(noiseAngle)) * t * 0.05 * noiseFlow;
  vec2 q = vec2(
    nf_fbm(p + vec2(0.0, t * 0.02) - drift, noiseDetail),
    nf_fbm(p + vec2(5.2, 1.3) - vec2(t * 0.015, 0.0) - drift * 0.8, noiseDetail)
  );
  vec2 w = p + noiseWarp * q - drift * 0.6;

  float n;
  if (noiseVariant > 2.5) {
    float s = sin(dot(w, vec2(0.35, 1.0)) * noiseBands * 2.4 + nf_fbm(w * 0.7, noiseDetail) * 2.5);
    n = pow(0.5 + 0.5 * s, 1.6);
  } else if (noiseVariant > 1.5) {
    // Lines need a smooth height, so the finest octaves stay out of it.
    float h = nf_fbm(p * 0.6 + noiseWarp * 0.3 * q - drift * 0.6, min(noiseDetail, 2.0));
    float d = abs(fract(h * noiseBands) - 0.5);
    n = max(smoothstep(0.38, 0.47, d), h * h * 0.2);
  } else if (noiseVariant > 0.5) {
    n = pow(nf_ridges(w), 1.4);
  } else {
    n = nf_fbm(w, noiseDetail);
  }

  if (noiseVariant < 1.5 || noiseVariant > 2.5) {
    // Smoke keeps a gentle slope so the folds stay a gradient, not plateaus.
    float slope = noiseVariant < 0.5 ? 1.0 : 1.5;
    n = clamp((n - 0.5 + noiseCoverage) * noiseContrast * slope + 0.5, 0.0, 1.0);
    n = n * n * (3.0 - 2.0 * n);
  } else {
    n = clamp(n + noiseCoverage, 0.0, 1.0);
  }
  if (noiseVariant < 0.5) {
    n = pow(n, 2.8);
  }
  if (noiseInvert > 0.5) {
    n = 1.0 - n;
  }

  float keep = 1.0;
  float size = noiseMaskSize;
  if (noiseMask > 3.5) {
    vec2 d = vec2((uv.x - 0.5) * 0.85, (uv.y - 0.5) * 1.7);
    float r = 0.2 + 0.45 * (1.0 - size);
    keep = 1.0 - smoothstep(r, r + 0.4, length(d));
  } else if (noiseMask > 2.5) {
    keep = smoothstep(size * 0.8, size * 0.8 + 0.55, uv.y);
  } else if (noiseMask > 1.5) {
    keep = smoothstep(size * 0.8, size * 0.8 + 0.55, 1.0 - uv.y);
  } else if (noiseMask > 0.5) {
    vec2 d = vec2((uv.x - 0.5) * 0.85, (uv.y - 0.5) * 1.7);
    float r = 0.36 * size;
    keep = smoothstep(r, r + 0.44, length(d));
  }
  return n * keep * noiseIntensity;
}
`;

const FALLBACK_MASKS = {
  bottom: "linear-gradient(to top, transparent 5%, black 60%)",
  center: "radial-gradient(ellipse 60% 45% at 50% 50%, transparent 30%, black)",
  edges: "radial-gradient(ellipse 60% 55% at 50% 50%, black 30%, transparent)",
  none: "none",
  top: "linear-gradient(to bottom, transparent 5%, black 60%)"
};

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

export const NoiseField = ({
  color = "--dither-ink",
  highlight,
  background = "--dither-paper",
  variant = "smoke",
  scale = 1.3,
  warp = 1.7,
  detail = 4,
  contrast = 1.2,
  coverage = 0,
  intensity = 0.9,
  bands = 8,
  angle = 90,
  flow = 1,
  invert = false,
  mask = "none",
  maskSize = 0.5,
  palette,
  matrix = "bayer8",
  ...props
}) => {
  const colors =
    palette ??
    (highlight === undefined
      ? [background, color]
      : [background, color, highlight]);
  const ink = cssColor(colors[1]);
  const fallbackMask = FALLBACK_MASKS[mask];

  return (
    <DitherShader
      {...props}
      field={FIELD}
      palette={colors}
      matrix={matrix}
      uniforms={{
        noiseAngle: (angle * Math.PI) / 180,
        noiseBands: clamp(bands, 1, 48),
        noiseContrast: Math.max(0, contrast),
        noiseCoverage: clamp(coverage, -1, 1),
        noiseDetail: clamp(Math.round(detail), 1, 6),
        noiseFlow: Math.max(0, flow),
        noiseIntensity: clamp(intensity, 0, 1),
        noiseInvert: invert ? 1 : 0,
        noiseMask: MASKS[mask],
        noiseMaskSize: clamp(maskSize, 0, 1),
        noiseScale: Math.max(0.1, scale),
        noiseVariant: VARIANTS[variant],
        noiseWarp: Math.max(0, warp),
      }}
      fallback={
        <div
          className="absolute inset-0"
          style={{ backgroundColor: cssColor(colors[0]) }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              WebkitMaskImage: fallbackMask,
              backgroundImage: `radial-gradient(circle at 25% 30%, ${ink}, transparent 45%), radial-gradient(circle at 75% 70%, ${ink}, transparent 40%)`,
              maskImage: fallbackMask,
            }}
          />
        </div>
      }
    />
  );
};
