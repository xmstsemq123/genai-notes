// 生成式AI 課後筆記 · 全站共用腳本
// 只做兩件事：深淺色切換、筆記頁目錄跟著捲動標示目前段落
(function () {
  var root = document.documentElement;
  var KEY = "genai-notes-theme";

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* 無痕模式存不了也沒關係 */ }
  }
  function apply(v) {
    if (v === "light" || v === "dark") root.setAttribute("data-theme", v);
    else root.removeAttribute("data-theme");
  }
  function current() {
    var v = root.getAttribute("data-theme");
    if (v) return v;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  apply(read());

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      var label = function () { btn.textContent = current() === "dark" ? "淺色" : "深色"; };
      label();
      btn.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        apply(next);
        save(next);
        label();
      });
    }

    var links = document.querySelectorAll(".toc a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = map[en.target.id];
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  });
})();
