import { describe, expect, it } from 'vitest';
import { runCommand } from './terminalCommands';

describe('runCommand', () => {
  it('echoes its arguments', () => {
    expect(runCommand('echo hello  world').lines).toEqual(['hello world']);
  });

  it('answers whoami and pwd', () => {
    expect(runCommand('whoami').lines).toEqual(['david']);
    expect(runCommand('pwd').lines).toEqual(['/home/user']);
  });

  it('asks clear to wipe the log', () => {
    expect(runCommand('clear')).toEqual({ lines: [], clear: true });
  });

  it('lists commands with implemented or simulated behavior', () => {
    const [heading, ...rows] = runCommand('help').lines;
    const listed = rows.join(' ').split(/\s+/);

    expect(heading).toBe('available commands:');
    expect(listed).toEqual(expect.arrayContaining(['ls', 'cat', 'chmod', 'resume']));
    ['wget', 'passwd', 'killall', 'grep'].forEach((command) => {
      expect(listed).not.toContain(command);
    });
  });

  it('lists the implemented joke commands in help', () => {
    const listed = runCommand('help').lines.slice(1).join(' ').split(/\s+/);
    expect(listed).toEqual(expect.arrayContaining(['help', 'nanofetch', 'forkbomb', 'shutdown']));
  });

  it('keeps playful responses available for unsupported commands without advertising them', () => {
    expect(runCommand('wget example.com')).toEqual({
      lines: ['wget: this is not a real terminal you know...'],
      isError: true,
    });
    expect(runCommand('help').lines.join(' ')).not.toContain('wget');
  });

  it('reports unknown commands like a real terminal', () => {
    expect(runCommand('foo')).toEqual({ lines: ['foo: command not found'], isError: true });
  });

  it('does not mistake inherited object properties for commands', () => {
    expect(runCommand('constructor')).toEqual({
      lines: ['constructor: command not found'],
      isError: true,
    });
  });

  it('shows permission denied in red for simulated file commands', () => {
    expect(runCommand('rm notes.txt')).toEqual({
      lines: ['rm: permission denied'],
      isError: true,
    });
  });

  it('changes and reports the virtual working directory', () => {
    expect(runCommand('cd about')).toEqual({ lines: [], cwd: '/home/user/about' });
    expect(runCommand('pwd', { cwd: '/home/user/about' }).lines).toEqual(['/home/user/about']);
    expect(runCommand('cd ..', { cwd: '/home/user/projects' })).toEqual({
      lines: [],
      cwd: '/home/user',
    });
    expect(runCommand('cd ../../..', { cwd: '/home/user/projects' })).toEqual({
      lines: [],
      cwd: '/home/user',
    });
  });

  it('lists the virtual files and reads the portfolio content', () => {
    expect(runCommand('ls').lines).toEqual(['about/  contact/  projects/  resume.pdf']);
    expect(runCommand('ls /').lines).toEqual(['about/  contact/  projects/  resume.pdf']);
    expect(runCommand('cat projects.txt').lines).toContain(
      '- genrify: spotify playlist generator that builds playlists'
    );
    expect(runCommand('cat contact/contact.txt').lines).toContain('- email: contact@davidchicas.me');
    expect(runCommand('cat about.txt', { cwd: '/home/user/about' }).lines[0])
      .toMatch(/strong data automation/);
    expect(runCommand('cat ~/about.txt').lines[0]).toMatch(/strong data automation/);
  });

  it('parses quoted arguments and reports an unmatched quote', () => {
    expect(runCommand('echo "hello   there"')).toEqual({ lines: ['hello   there'] });
    expect(runCommand("echo 'hello there")).toEqual({
      lines: ['syntax error: unmatched quote'],
      isError: true,
    });
  });

  it('shows the command history', () => {
    expect(runCommand('history', { history: ['pwd', 'ls', 'history'] }).lines).toEqual([
      '1  pwd',
      '2  ls',
      '3  history',
    ]);
  });

  it('opens the resume in a new page instead of printing', () => {
    expect(runCommand('cd resume.pdf')).toEqual({ lines: [], openUrl: '/assets/resume.pdf' });
  });

  it('reports a missing directory in red', () => {
    expect(runCommand('cd nowhere')).toEqual({
      lines: ['cd: no such file or directory: nowhere'],
      isError: true,
    });
  });

  it('returns nothing for an empty line', () => {
    expect(runCommand('   ')).toEqual({ lines: [] });
  });

  it('builds a calendar with a weekday row', () => {
    const [[titleSegment], weekdays] = runCommand('cal').lines;
    expect(titleSegment.text.trim()).toMatch(/^[A-Za-z]+ \d{4}$/);
    expect(titleSegment.accent).toBe(true);
    expect(weekdays).toBe('Su Mo Tu We Th Fr Sa');
  });

  it('highlights only today in the calendar', () => {
    const today = String(new Date().getDate());
    const highlighted = runCommand('cal')
      .lines.slice(2)
      .flat()
      .filter((segment) => typeof segment === 'object');
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].text.trim()).toBe(today);
    expect(highlighted[0].highlight).toBe(true);
  });

  it('shuts the page down with a message', () => {
    expect(runCommand('shutdown')).toEqual({
      lines: ['the system is going to poweroff now! bye bye'],
      powerOff: true,
    });
  });

  it('simulates a crash for forkbomb in red without running anything', () => {
    const result = runCommand('forkbomb');
    expect(result.crash).toBe(true);
    expect(result.isError).toBe(true);
    expect(result.lines).toContain('kernel panic - not syncing: fork bomb detected');
  });

  it('simulates a crash when the classic fork bomb string is typed', () => {
    expect(runCommand(':(){ :|:& };:')).toEqual(runCommand('forkbomb'));
  });

  it('shows the nanofetch art beside fake system information', () => {
    const { lines } = runCommand('nanofetch');
    const text = (line) =>
      Array.isArray(line) ? line.map((segment) => (typeof segment === 'string' ? segment : segment.text)).join('') : line;

    expect(lines).toHaveLength(13);
    expect(text(lines[0])).toContain('____     ____');
    expect(text(lines[0])).toContain('terminal@davidchicas.me');
    expect(text(lines[2])).toContain('OS: Arch Linux x86_64');
    expect(lines[0][0]).toEqual({ text: expect.stringContaining('____'), accent: true });
    expect(lines[0]).toContainEqual({ text: 'terminal@davidchicas.me', label: true });
    expect(lines[2]).toContainEqual({ text: 'OS:', label: true });
  });
});
