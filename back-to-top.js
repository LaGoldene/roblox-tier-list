/* Bouton de retour en haut — navigation clavier et tactile. */
(function () {
  "use strict";
  var button = document.getElementById("back-to-top");
  if (!button) return;
  var visible = false;
  function update() {
    var next = window.scrollY > 480;
    if (next !== visible) {
      visible = next;
      button.hidden = !visible;
    }
  }
  window.addEventListener("scroll", update, { passive: true });
  update();
  button.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  });
})();
