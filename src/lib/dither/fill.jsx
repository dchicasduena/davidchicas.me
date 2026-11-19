import { DitherPattern } from "@/lib/dither/pattern";
import {
  bloomFilter,
  bloomLayerStyle,
  ditherRamp,
  fillTile,
} from "@/lib/dither/style";
import { cssColor } from "@/lib/dither/tokens";

/**
 * An SVG `<pattern>` for any fill variant. Place it inside `<defs>` and
 * fill shapes with `url(#id)`. To reuse one ramp at several positions (one
 * per bar), reference it with `<pattern id="b2" href="#id" y={top} />`.
 */
export const FillPattern = ({
  id,
  fill,
  color = "ink",
  cell = 3,
  level = 1,
  floor = 0.0625,
  matrix = "bayer4",
  ramp
}) => {
  const ink = { fill: cssColor(color) };
  if (fill === "solid") {
    return (
      <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse">
        <rect width={cell} height={cell} style={ink} />
      </pattern>
    );
  }
  if (fill === "dotted" || fill === "hatched") {
    const { size, path } = fillTile(fill);
    return (
      <pattern
        id={id}
        width={size * cell}
        height={size * cell}
        patternUnits="userSpaceOnUse"
        shapeRendering="crispEdges"
      >
        <path d={path} transform={`scale(${cell})`} style={ink} />
      </pattern>
    );
  }
  if (ramp === undefined) {
    return (
      <DitherPattern
        id={id}
        level={level}
        matrix={matrix}
        cell={cell}
        color={color}
      />
    );
  }
  const tile = ditherRamp({
    edge: ramp.edge,
    extent: (ramp.extent ?? ramp.length) / cell,
    from: level,
    length: ramp.length / cell,
    matrix,
    to: floor,
  });
  const width = tile.width * cell;
  const height = tile.height * cell;
  const origin = {
    bottom: { x: 0, y: ramp.at - height },
    left: { x: ramp.at, y: 0 },
    right: { x: ramp.at - width, y: 0 },
    top: { x: 0, y: ramp.at },
  }[ramp.edge];
  return (
    <pattern
      id={id}
      x={origin.x}
      y={origin.y}
      width={width}
      height={height}
      patternUnits="userSpaceOnUse"
      shapeRendering="crispEdges"
    >
      <path d={tile.path} transform={`scale(${cell})`} style={ink} />
    </pattern>
  );
};

/**
 * An SVG group drawn as a glow: put solid copies of your shapes inside
 * and render it before (under) the real fills. Renders nothing when off.
 */
export const BloomGroup = ({
  bloom,
  style,
  ...props
}) => {
  const layer = bloomLayerStyle(bloom);
  return layer === undefined ? null : (
    <g aria-hidden="true" {...props} style={{ ...layer, ...style }} />
  );
};

/**
 * A wrapper that glows around whatever it holds, in `color`. A CSS
 * drop-shadow, so it follows dithered cells and transparent gaps.
 */
export const BloomBox = ({
  color = "ink",
  bloom,
  style,
  ...props
}) => (
  <div {...props} style={{ filter: bloomFilter(color, bloom), ...style }} />
);
