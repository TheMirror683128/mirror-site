window.effects = {
  enabled: localStorage.getItem("mirror-effects") !== "off",
  apply() {
    document.getElementById("app").classList.toggle("crt-on", this.enabled);
  },
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("mirror-effects", this.enabled ? "on" : "off");
    this.apply();
    return this.enabled;
  }
};
window.effects.apply();