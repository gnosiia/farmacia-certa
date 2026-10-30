/* Tema independente do login, salvo somente neste navegador. */
(function () {
  const KEY = "fcdf-theme";
  function stored() {
    try {
      return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }
  function set(mode) {
    const theme = mode === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme =
      theme === "dark" ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0b1623" : "#ffffff";
    document.querySelectorAll(".theme-toggle").forEach((b) => {
      b.innerHTML = theme === "dark"
        ? '<span aria-hidden="true">☀️</span><span class="theme-label"> Modo claro</span>'
        : '<span aria-hidden="true">🌙</span><span class="theme-label"> Modo noturno</span>';
      b.setAttribute("aria-pressed", String(theme === "dark"));
      b.setAttribute(
        "aria-label",
        theme === "dark" ? "Ativar modo claro" : "Ativar modo noturno",
      );
    });
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
  }
  const initial = stored();
  document.documentElement.dataset.theme = initial;
  document.documentElement.style.colorScheme = initial;
  function initialize() {
    set(initial);
    document.querySelectorAll(".theme-toggle").forEach((b) => {
      b.addEventListener("click", () => {
        set(
          document.documentElement.dataset.theme === "dark" ? "light" : "dark",
        );
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
