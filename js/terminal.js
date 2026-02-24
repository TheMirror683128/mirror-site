window.terminal = {
  el: document.getElementById("terminal"),
  input: document.getElementById("cmd-input"),
  chips: document.getElementById("chips"),
  state: { history: [], idx: 0, awaitingEmail: false, transitioning: false },

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  print(text = "", cls = "") {
    const div = document.createElement("div");
    div.className = `line ${cls}`.trim();
    div.textContent = text;
    this.el.appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
  },

  async streamLine(text = "", cls = "") {
    const div = document.createElement("div");
    div.className = `line ${cls}`.trim();
    this.el.appendChild(div);

    if (!text) {
      window.scrollTo(0, document.body.scrollHeight);
      return;
    }

    const tokens = text.match(/\S+\s*/g) || [text];
    for (const token of tokens) {
      div.textContent += token;
      window.scrollTo(0, document.body.scrollHeight);

      let delay = 24;
      if (/[,.!?;:]\s*$/.test(token)) delay += 42;
      if (/[-—]$/.test(token.trim())) delay += 24;
      await this.sleep(delay);
    }
  },

  async streamBlock(block = "", cls = "") {
    const lines = block.split("\n");
    for (const line of lines) {
      await this.streamLine(line, cls);
    }
  },

  promptEcho(cmd) {
    this.print(`mirror:~$ ${cmd}`);
  },

  clear() {
    this.el.innerHTML = "";
  },

  async animateSwap(renderFn) {
    if (this.state.transitioning) return;
    this.state.transitioning = true;
    this.el.classList.remove("transition-in");
    this.el.classList.add("transition-out");

    await this.sleep(200);
    this.clear();
    this.el.classList.remove("transition-out");
    this.el.classList.add("transition-in");

    await renderFn();

    await this.sleep(230);
    this.el.classList.remove("transition-in");
    this.state.transitioning = false;
  },

  async handle(cmdRaw) {
    const cmd = cmdRaw.trim();
    if (!cmd || this.state.transitioning) return;

    this.state.history.push(cmd);
    this.state.idx = this.state.history.length;

    if (this.state.awaitingEmail) {
      this.state.awaitingEmail = false;
      await this.animateSwap(async () => {
        this.promptEcho(cmd);
        await this.streamLine(`> SIGNAL LOCKED: ${cmd}`, "system");
        await this.streamLine("> First transmission arrives this week.", "system");
      });
      return;
    }

    const lc = cmd.toLowerCase();

    if (lc === "clear") {
      this.clear();
      return;
    }

    const eggs = {
      whoami: "You are a node in the Field.",
      sudo: "Density cannot be granted. It must be earned.",
      exit: "There is no exit. There is only deeper.",
      matrix: "You're already in it. This is the other side.",
      rabbit: "You followed it. Good.",
      ls: "reality.prf  identity.log  collapse.dat  alignment.cfg  noise.tmp",
      ping: "PING field.prf: 64 bytes — density=high latency=0ms"
    };

    if (eggs[lc]) {
      await this.animateSwap(async () => {
        this.promptEcho(cmd);
        await this.streamLine(eggs[lc], "dim");
      });
      return;
    }

    if (lc.startsWith("open ")) {
      const n = lc.split(/\s+/)[1];
      const out = window.resolveOpen(n);
      await this.animateSwap(async () => {
        this.promptEcho(cmd);
        if (!out) {
          await this.streamLine(`ERR: unknown index '${n}'.`, "error");
          return;
        }
        await this.streamBlock(out);
      });
      return;
    }

    if (lc === "rm -rf /") {
      await this.animateSwap(async () => {
        this.promptEcho(cmd);
        await this.streamLine("Nice try. The Field cannot be deleted.", "error");
      });
      return;
    }

    const fn = window.commandHandlers[lc];
    await this.animateSwap(async () => {
      this.promptEcho(cmd);
      if (!fn) {
        await this.streamLine(`ERR: unknown command '${cmd}'. Type 'help'.`, "error");
        return;
      }
      const out = fn();
      if (out) await this.streamBlock(out);
    });
  },

  bind() {
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handle(this.input.value);
        this.input.value = "";
      } else if (e.key === "ArrowUp") {
        if (this.state.idx > 0) this.state.idx -= 1;
        this.input.value = this.state.history[this.state.idx] || "";
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (this.state.idx < this.state.history.length) this.state.idx += 1;
        this.input.value = this.state.history[this.state.idx] || "";
        e.preventDefault();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const current = this.input.value.toLowerCase();
        const commands = Object.keys(window.commandHandlers).concat(["open", "whoami", "sudo", "exit", "matrix", "rabbit"]);
        const match = commands.find((c) => c.startsWith(current));
        if (match) this.input.value = match === "open" ? "open " : match;
      }
    });

    this.chips.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => this.handle(b.dataset.cmd));
    });

    document.addEventListener("click", () => this.input.focus());
  }
};
window.terminal.bind();