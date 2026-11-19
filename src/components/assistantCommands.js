export const ASSISTANT_COMMANDS = [
  'help',
  'ls',
  'pwd',
  'whoami',
  'cd',
  'cat',
  'about',
  'projects',
  'contact',
  'resume',
];

const ROOT = '/home/user';
const RESUME_URL = '/assets/resume.pdf';

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

const files = new Map([
  ['about.txt', directories.get('about')],
  ['projects.txt', directories.get('projects')],
  ['contact.txt', directories.get('contact')],
]);

const directoryName = (path) => path === ROOT ? '' : path.slice(`${ROOT}/`.length);
const directoryExists = (path) => path === ROOT || directories.has(directoryName(path));

const resolvePath = (path, cwd = ROOT) => {
  const expandedPath = path === '~'
    ? ROOT
    : path.startsWith('~/')
      ? `${ROOT}${path.slice(1)}`
      : path;
  const parts = (expandedPath.startsWith('/') ? expandedPath : `${cwd}/${expandedPath}`).split('/');
  const resolved = [];
  const rootDepth = ROOT.split('/').filter(Boolean).length;

  parts.forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') {
      if (resolved.length > rootDepth) resolved.pop();
    } else {
      resolved.push(part);
    }
  });

  return `/${resolved.join('/')}`;
};

const commandHelp = () => [
  'available commands:',
  ASSISTANT_COMMANDS.join('  '),
];

export const runAssistantCommand = (input, { cwd = ROOT } = {}) => {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return { lines: [] };

  if (!ASSISTANT_COMMANDS.includes(name)) {
    return {
      lines: [`${name}: not available. Type "help" to see portfolio commands.`],
      isError: true,
    };
  }

  switch (name) {
    case 'help':
      return { lines: commandHelp() };
    case 'whoami':
      return { lines: ['david'] };
    case 'about':
    case 'projects':
    case 'contact':
      return { lines: directories.get(name) };
    case 'pwd':
      return { lines: [cwd] };
    case 'ls': {
      const path = !args[0]
        ? cwd
        : args[0] === '/'
          ? ROOT
          : resolvePath(args[0], cwd);
      if (!directoryExists(path)) {
        return { lines: [`ls: no portfolio directory named '${args[0]}'`], isError: true };
      }
      const nameAtPath = directoryName(path);
      const contents = nameAtPath
        ? [`${nameAtPath}.txt`]
        : ['about/', 'contact/', 'projects/', 'resume.pdf'];
      return { lines: [contents.join('  ')] };
    }
    case 'cd': {
      const target = args[0] || ROOT;
      const path = target === '/' || target === '~' ? ROOT : resolvePath(target, cwd);
      if (path === `${ROOT}/resume.pdf`) {
        return { lines: ['Opening my resume in a new tab.'], openUrl: RESUME_URL };
      }
      if (!directoryExists(path)) {
        return { lines: [`cd: no portfolio directory named '${target}'`], isError: true };
      }
      return { lines: [], cwd: path };
    }
    case 'cat': {
      const target = args[0];
      if (!target) {
        return { lines: ['cat: enter a portfolio file, such as about.txt'], isError: true };
      }
      if (target === 'resume.pdf') {
        return { lines: ['Use "resume" to open the PDF.'], isError: true };
      }
      const path = resolvePath(target, cwd);
      const fileName = path.split('/').pop();
      const file = files.get(fileName);
      if (
        file &&
        (path === `${ROOT}/${fileName}` ||
          path === `${ROOT}/${fileName.replace('.txt', '')}/${fileName}`)
      ) {
        return { lines: file };
      }
      return { lines: [`cat: no portfolio file named '${target}'`], isError: true };
    }
    case 'resume':
      return { lines: ['Opening my resume in a new tab.'], openUrl: RESUME_URL };
    default:
      return { lines: commandHelp() };
  }
};
