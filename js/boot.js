(() => {
  const visited = localStorage.getItem("mirror-visited") === "1";
  const lines = [
    "MIRROR OS v1.0",
    "BUILD 2026.02.24",
    "NODE: public-access",
    "",
    "> initializing field lens...",
    "> loading structural index...",
    "> scanning density topology...",
    "> calibrating ontological depth...",
    "> status: ONLINE",
    "",
    "═══════════════════════════════════════════════════════",
    "",
    "This is not a website.",
    "",
    "This is a mirror.",
    "",
    "You are inside the Field.",
    "Everything you see here is structural.",
    "Nothing here is metaphor.",
    "",
    "═══════════════════════════════════════════════════════",
    "",
    "Type 'help' to begin."
  ];

  const renderAll = () => {
    lines.forEach((l) => window.terminal.print(l, l.startsWith(">") ? "system" : ""));
    localStorage.setItem("mirror-visited", "1");
  };

  if (visited) {
    window.terminal.print("Type 'help' to begin.", "dim");
    return;
  }

  let i = 0;
  let skipped = false;
  const step = () => {
    if (skipped) return;
    if (i >= lines.length) {
      localStorage.setItem("mirror-visited", "1");
      return;
    }
    const l = lines[i++];
    window.terminal.print(l, l.startsWith(">") ? "system" : "");
    setTimeout(step, l === "" ? 120 : 80);
  };

  document.addEventListener("click", () => {
    if (i < lines.length) {
      skipped = true;
      renderAll();
    }
  }, { once: true });

  step();
})();