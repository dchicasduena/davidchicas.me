export const HELP_COMMANDS = [
  'ls', 'pwd', 'cd', 'mkdir', 'mv', 'cp', 'rm', 'touch', 'ln', 'clear', 'cat', 'echo',
  'less', 'man', 'uname', 'whoami', 'tar', 'grep', 'head', 'tail', 'diff', 'cmp', 'comm',
  'sort', 'export', 'zip', 'unzip', 'ssh', 'service', 'ps', 'kill', 'killall', 'df', 'mount',
  'chmod', 'chown', 'ifconfig', 'traceroute', 'wget', 'ufw', 'iptables', 'apt', 'pacman',
  'yum', 'rpm', 'sudo', 'cal', 'alias', 'dd', 'whereis', 'whatis', 'top', 'useradd', 'usermod',
  'passwd', 'help', 'history', 'date', 'about', 'projects', 'contact', 'resume', 'nanofetch', 'forkbomb', 'shutdown',
];

const RESUME_URL = '/assets/resume.pdf';
const FORK_BOMB_SOURCE = ':(){:|:&};:';
const denied = (name) => () => ({ lines: [`${name}: permission denied`], isError: true });

const NANOFETCH_ART = [
  "     ____     ____",
  "    '###\\ \\ / /###'",
  "    ,\\\\\\\\\\ | /////,",
  " __  \\ .--. .--. /  __",
  "___\\/ '    |    ' \\/___",
  "-- _, !    |    ! ,_ --",
  "   / '!    |    !' \\",
  "  /'/ !    |    ! \\'\\",
  " 1# ! \\   0|0   / ! #1",
  " !# \\  '--; ;--'  / #!",
  " `  `\\    `-'    /`  `",
  "  \\## `--~' '~--` ##/",
  "    `-___________-`",
];

const NANOFETCH_INFO = [
  { label: 'terminal@davidchicas.me' },
  { value: '-------------------' },
  { label: 'OS:', value: ' Arch Linux x86_64' },
  { label: 'Host:', value: ' GitHub Pages' },
  { label: 'Kernel:', value: ' 6.8.0' },
  { label: 'Uptime:', value: ' 3 hours, 42 mins' },
  { label: 'Packages:', value: ' 1337 (npm)' },
  { label: 'Shell:', value: ' bash 5.2.21' },
  { label: 'Resolution:', value: ' 1920x1080' },
  { label: 'Terminal:', value: ' davidchicas.me' },
  { label: 'CPU:', value: ' Ryzen brain @ 4.2GHz' },
  { label: 'Memory:', value: ' 4096MiB / 16384MiB' },
];

const nanofetch = () => {
  const artWidth = Math.max(...NANOFETCH_ART.map((row) => row.length)) + 3;
  const rows = Math.max(NANOFETCH_ART.length, NANOFETCH_INFO.length);
  return {
    lines: Array.from({ length: rows }, (_, index) => {
      const { label, value = '' } = NANOFETCH_INFO[index] ?? {};
      const art = { text: (NANOFETCH_ART[index] ?? '').padEnd(artWidth), accent: true };
      return [art, ...(label ? [{ text: label, label: true }] : []), ...(value ? [value] : [])];
    }),
  };
};

const forkbomb = () => ({
  lines: [
    'bash: fork: retry: resource temporarily unavailable',
    'bash: fork: retry: resource temporarily unavailable',
    'bash: fork: retry: resource temporarily unavailable',
    'kernel: out of memory: killing process user',
    'kernel panic - not syncing: fork bomb detected',
  ],
  isError: true,
  crash: true,
});

const shutdown = () => ({
  lines: ['the system is going to poweroff now! bye bye'],
  powerOff: true,
});
const directories = new Map([
  ['about', [
    'currently working for strong data automation.',
    'interested in frontend and backend development, multimedia programming, and user interface design.',
  ]],
  ['projects', [
    '- thirty five mm: portfolio of photographs, mostly shot on 35mm film',
    '- genrify: spotify playlist generator that builds playlists',
    '- automata: discord bot ',
    '- sandwich repository: small place to collect and revisit recipes',
    '- card binder: deprecated, arrange a pokémon tcg binder',
  ]],
  ['contact', [
    '- discord: dech89',
    '- github: dchicasduena',
    '- email: contact@davidchicas.me',
  ]],
]);

const ROOT = '/home/user';
const files = new Map([
  ['about.txt', directories.get('about')],
  ['projects.txt', directories.get('projects')],
  ['contact.txt', directories.get('contact')],
]);

const resolvePath = (path, cwd = ROOT) => {
  const expandedPath = path === '~' ? ROOT : path.startsWith('~/') ? `${ROOT}${path.slice(1)}` : path;
  const parts = (expandedPath.startsWith('/') ? expandedPath : `${cwd}/${expandedPath}`).split('/');
  const resolved = [];
  const rootDepth = ROOT.split('/').filter(Boolean).length;
  parts.forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') {
      if (resolved.length > rootDepth) resolved.pop();
    }
    else resolved.push(part);
  });
  return `/${resolved.join('/')}`;
};

const directoryName = (path) => path === ROOT ? '' : path.slice(`${ROOT}/`.length);
const directoryExists = (path) => path === ROOT || directories.has(directoryName(path));

const changeDirectory = (args, cwd) => {
  const target = args[0] || ROOT;
  const path = target === '/' || target === '~' ? ROOT : resolvePath(target, cwd);
  if (path === `${ROOT}/resume.pdf`) return { lines: [], openUrl: RESUME_URL };
  if (!directoryExists(path)) {
    return { lines: [`cd: no such file or directory: ${target}`], isError: true };
  }
  return { lines: [], cwd: path };
};

const implemented = {
  echo: (args) => ({ lines: [args.join(' ')] }),
  clear: () => ({ lines: [], clear: true }),
  help: () => ({ lines: ['available commands:', ...commandColumns(AVAILABLE_COMMANDS)] }),
  whoami: () => ({ lines: ['david'] }),
  history: (_args, context) => ({ lines: context.history.map((command, index) => `${index + 1}  ${command}`) }),
  date: () => ({ lines: [new Date().toString()] }),
  about: () => ({ lines: directories.get('about') }),
  projects: () => ({ lines: directories.get('projects') }),
  contact: () => ({ lines: directories.get('contact') }),
  resume: () => ({ lines: [], openUrl: RESUME_URL }),
  uname: (args) => ({
    lines: [args.includes('-a') ? 'linux davidchicas.me 6.8.0 #1 SMP x86_64 GNU/Linux' : 'linux'],
  }),
  cal: () => ({ lines: calendarLines(new Date()) }),
  nanofetch,
  forkbomb,
  shutdown,
};

const simulated = {
  pwd: (_args, context) => ({ lines: [context.cwd] }),
  ls: (args, context) => {
    const path = !args[0]
      ? context.cwd
      : args[0] === '/'
        ? ROOT
        : resolvePath(args[0], context.cwd);
    if (!directoryExists(path)) {
      return { lines: [`ls: cannot access '${args[0]}': no such directory`], isError: true };
    }
    const name = directoryName(path);
    const contents = name
      ? [`${name}.txt`]
      : ['about/', 'contact/', 'projects/', 'resume.pdf'];
    return { lines: [contents.join('  ')] };
  },
  cd: (args, context) => changeDirectory(args, context.cwd),
  cat: (args, context) => {
    const target = args[0];
    if (!target || target === 'resume.pdf') {
      return target
        ? { lines: ['cat: resume.pdf is a PDF; use "resume" to open it'], isError: true }
        : { lines: ['cat: missing file operand'], isError: true };
    }
    const path = resolvePath(target, context.cwd);
    const name = path.split('/').pop();
    const file = files.get(name);
    if (file && (path === `${ROOT}/${name}` || path === `${ROOT}/${name.replace('.txt', '')}/${name}`)) {
      return { lines: file };
    }
    return { lines: [`cat: ${target}: no such file`], isError: true };
  },
  mkdir: denied('mkdir'),
  touch: denied('touch'),
  cp: denied('cp'),
  mv: denied('mv'),
  rm: denied('rm'),
  ln: denied('ln'),
  chmod: denied('chmod'),
  chown: denied('chown'),
};

const AVAILABLE_COMMANDS = HELP_COMMANDS.filter(
  (name) => Object.hasOwn(implemented, name) || Object.hasOwn(simulated, name)
);

const commandColumns = (names, perRow = 5) => {
  const rows = [];
  for (let i = 0; i < names.length; i += perRow) {
    rows.push(names.slice(i, i + perRow).map((name) => name.padEnd(11)).join('').trimEnd());
  }
  return rows;
};

const calendarLines = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = date.getDate();
  const title = `${date.toLocaleString('en-US', { month: 'long' })} ${year}`;
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7).map((day) => {
      if (day === null) return '  ';
      const text = String(day).padStart(2);
      return day === today ? { text, highlight: true } : text;
    });
    rows.push(week.flatMap((cell, index) => (index === 0 ? [cell] : [' ', cell])));
  }

  return [
    [{ text: title.padStart(Math.floor((20 + title.length) / 2)).padEnd(20), accent: true }],
    'Su Mo Tu We Th Fr Sa',
    ...rows,
  ];
};

const lookup = (table, name) => (Object.hasOwn(table, name) ? table[name] : undefined);

// returns { lines, isError?, clear?, openUrl?, crash?, powerOff? } for a line typed into the terminal.
export const runCommand = (input, context = {}) => {
  // classic fork bomb is only simulated here, never executed.
  if (input.replace(/\s/g, '') === FORK_BOMB_SOURCE) return forkbomb();

  const cwd = context.cwd || ROOT;
  const history = context.history || [];
  const tokens = [];
  let token = '';
  let quote = null;
  let escaped = false;

  for (const character of input.trim()) {
    if (escaped) {
      token += character;
      escaped = false;
    } else if (character === '\\' && quote !== "'") {
      escaped = true;
    } else if (quote) {
      if (character === quote) quote = null;
      else token += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (/\s/.test(character)) {
      if (token) tokens.push(token);
      token = '';
    } else {
      token += character;
    }
  }

  if (escaped) token += '\\';
  if (quote) return { lines: ['syntax error: unmatched quote'], isError: true };
  if (token) tokens.push(token);

  const [name, ...args] = tokens;
  if (!name) return { lines: [] };

  const run = lookup(implemented, name) ?? lookup(simulated, name);
  if (run) return run(args, { cwd, history });

  if (HELP_COMMANDS.includes(name)) return { lines: [`${name}: this is not a real terminal you know...`], isError: true };

  return { lines: [`${name}: command not found`], isError: true };
};
