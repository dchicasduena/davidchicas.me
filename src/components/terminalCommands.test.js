import { describe, expect, it } from 'vitest';
import { runCommand } from './terminalCommands';

describe('runCommand', () => {
  it('echoes its arguments', () => {
    expect(runCommand('echo hello  world').lines).toEqual(['hello world']);
  });

  it('answers whoami and pwd', () => {
    expect(runCommand('whoami').lines).toEqual(['user']);
    expect(runCommand('pwd').lines).toEqual(['/home/user']);
  });

  it('asks clear to wipe the log', () => {
    expect(runCommand('clear')).toEqual({ lines: [], clear: true });
  });

  it('lists every command in help, including the ones not implemented', () => {
    const [heading, ...rows] = runCommand('help').lines;
    const listed = rows.join(' ').split(/\s+/);

    expect(heading).toBe('available commands:');
    expect(listed).toEqual(expect.arrayContaining(['ls', 'wget', 'passwd', 'killall']));
  });

  it('lists the joke commands in help', () => {
    const listed = runCommand('help').lines.slice(1).join(' ').split(/\s+/);
    expect(listed).toEqual(expect.arrayContaining(['help', 'nanofetch', 'forkbomb', 'shutdown']));
  });

  it('shows a joke line in red for listed commands that are not implemented', () => {
    expect(runCommand('wget example.com')).toEqual({
      lines: ['wget: this is not a real terminal you know...'],
      isError: true,
    });
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

  it('shows information for the names listed by ls', () => {
    expect(runCommand('cd about').lines[0]).toMatch(/strong data automation/);
    expect(runCommand('cd projects').lines).toContain('- genrify: spotify playlist generator that builds playlists');
    expect(runCommand('cd contact').lines).toContain('- email: contact@davidchicas.me');
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
    expect(text(lines[0])).toContain('user@davidchicas.me');
    expect(text(lines[2])).toContain('OS: Arch Linux x86_64');
    expect(lines[0][0]).toEqual({ text: expect.stringContaining('____'), accent: true });
    expect(lines[0]).toContainEqual({ text: 'user@davidchicas.me', label: true });
    expect(lines[2]).toContainEqual({ text: 'OS:', label: true });
  });
});
