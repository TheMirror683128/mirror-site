window.commandHandlers = {
  help: () => `\n[MIRROR OS — COMMAND INDEX]\n\n  help       show this list\n  start      guided entry path (5 readings, sequential)\n  notes      field notes — short transmissions\n  essays     long-form structural analysis\n  signal     subscribe to weekly transmission\n  about      orientation — what this is and is not\n  open <n>   open entry by index (e.g., 'open 3')\n  clear      clear terminal\n  source     credits\n`,
  start: () => window.START_CONTENT.index,
  notes: () => window.NOTES_CONTENT.index,
  essays: () => window.ESSAYS_CONTENT.index,
  about: () => window.ABOUT_TEXT,
  source: () => `\n[SOURCE]\nBuilt as a static terminal interface for Mirror.\nPrimary source material: PHILOSOPHY.md + ORIGINAL_CONTEXT.md by @lagonraj\n`,
  signal: () => {
    window.terminal.state.awaitingEmail = true;
    return `\n[SIGNAL CHANNEL]\n\n  frequency: 1x / week\n  payload:   collapse / emergence / action\n\nEnter email to subscribe:\nsignal:~$ `;
  },
  clear: () => {
    window.terminal.clear();
    return "";
  }
};

window.resolveOpen = (n) => {
  const num = Number(n);
  const item = window.START_CONTENT.items[num] || window.NOTES_CONTENT.items[num] || window.ESSAYS_CONTENT.items[num];
  if (!item) return null;
  const next = num + 1;
  return `${item}\n\n─────────────────────────────────────\n\n  [next]   open ${next}\n  [index]  start | notes | essays\n  [top]    clear\n`;
};