/* Thème clair/sombre et raccourcis d'accès — sans dépendance externe. */
(function () {
  "use strict";
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  var meta = document.getElementById("theme-color-meta");
  if (!button) return;
  var saved = null;
  try { saved = localStorage.getItem("rtl-theme"); } catch (e) {}
  var theme = saved === "dark" ? "dark" : "light";
  function applyTheme(next, save) {
    theme = next === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    button.setAttribute("aria-label", theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre");
    var icon = button.querySelector(".theme-toggle-icon");
    var label = button.querySelector(".theme-toggle-label");
    if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
    if (label) label.textContent = theme === "dark" ? "Mode clair" : "Mode sombre";
    if (meta) meta.setAttribute("content", theme === "dark" ? "#11131b" : "#f7f8fc");
    if (save) { try { localStorage.setItem("rtl-theme", theme); } catch (e) {} }
  }
  applyTheme(theme, false);
  button.addEventListener("click", function () { applyTheme(theme === "dark" ? "light" : "dark", true); });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
    var target = event.target;
    if (target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable)) return;
    var search = document.getElementById("search-input");
    if (search && !document.getElementById("view-catalog").hidden) {
      event.preventDefault();
      search.focus();
    }
  });
})();
