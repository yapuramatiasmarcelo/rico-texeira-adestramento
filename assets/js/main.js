(function () {
  "use strict";

  var config = window.RICO_CONFIG || {};
  var content = window.RICO_CONTENT || {};
  var desktopNav = window.matchMedia("(min-width: 48rem)");

  function setYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function closeMenu(returnFocus) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      if (returnFocus) toggle.focus();
    }

    function openMenu() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") closeMenu(false);
      else openMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu(false);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    function syncDesktopNav(event) {
      if (event.matches) closeMenu(false);
    }

    if (typeof desktopNav.addEventListener === "function") {
      desktopNav.addEventListener("change", syncDesktopNav);
    } else if (typeof desktopNav.addListener === "function") {
      desktopNav.addListener(syncDesktopNav);
    }
  }

  function resolveWhatsAppNumber(raw) {
    var digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) digits = "55" + digits;
    if (!/^55\d{10,11}$/.test(digits)) return "";
    return digits;
  }

  function formatWhatsAppNumber(digits) {
    if (digits.length === 13) {
      return "+" + digits.slice(0, 2) + " " + digits.slice(2, 4) + " " + digits.slice(4, 9) + "-" + digits.slice(9);
    }
    if (digits.length === 12) {
      return "+" + digits.slice(0, 2) + " " + digits.slice(2, 4) + " " + digits.slice(4, 8) + "-" + digits.slice(8);
    }
    return "+" + digits;
  }

  function buildWhatsAppUrl(number, message) {
    var url = "https://wa.me/" + number;
    var text = String(message || "").trim();
    if (!text) return url;
    return url + "?text=" + encodeURIComponent(text);
  }

  /**
   * Ponto único para identificar cliques no WhatsApp.
   * GA4 e Google Ads continuam pendentes: não há IDs instalados.
   * Quando existirem, o disparo entra somente nesta função.
   */
  function trackWhatsAppClick(source) {
    document.dispatchEvent(new CustomEvent("rico:whatsapp-click", {
      detail: {
        source: source || "pagina",
        at: new Date().toISOString(),
      },
    }));
  }

  function createChatIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "26");
    svg.setAttribute("height", "26");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M12 3.8c-4.6 0-8.2 3.1-8.2 7 0 2.2 1.2 4.1 3.1 5.4l-.5 3.9 3.6-1.9c.6.2 1.3.3 2 .3 4.6 0 8.2-3.1 8.2-7s-3.6-7-8.2-7zm-3 8.2a.95.95 0 1 1 0-1.9.95.95 0 0 1 0 1.9zm3 0a.95.95 0 1 1 0-1.9.95.95 0 0 1 0 1.9zm3 0a.95.95 0 1 1 0-1.9.95.95 0 0 1 0 1.9z");
    svg.appendChild(path);
    return svg;
  }

  function bindWhatsAppLink(anchor, source) {
    anchor.addEventListener("click", function () {
      trackWhatsAppClick(source);
    });
  }

  function mountFloat(url) {
    if (document.querySelector(".whatsapp-float")) return;
    var link = document.createElement("a");
    link.className = "whatsapp-float";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.whatsappSource = "flutuante";
    link.setAttribute("aria-label", "Falar com Rico no WhatsApp (abre em uma nova aba)");
    link.appendChild(createChatIcon());
    bindWhatsAppLink(link, "flutuante");
    document.body.appendChild(link);
    document.body.classList.add("has-whatsapp-float");

    var contact = document.getElementById("contato");
    if (!contact) return;

    function syncFloat() {
      var rect = contact.getBoundingClientRect();
      var height = window.innerHeight || document.documentElement.clientHeight;
      var visible = rect.bottom > 72 && rect.top < height - 24;
      link.classList.toggle("is-resting", visible);
    }

    syncFloat();
    window.addEventListener("scroll", syncFloat, { passive: true });
    window.addEventListener("resize", syncFloat);
  }

  function setupWhatsApp(whatsapp) {
    var raw = String((whatsapp && whatsapp.number) || "");
    var number = resolveWhatsAppNumber(raw);
    var typed = raw.trim().length > 0;
    var url = number ? buildWhatsAppUrl(number, whatsapp && whatsapp.message) : "";
    var strip = document.getElementById("whatsapp-review-note");
    var invalidMessage = "O número de WhatsApp não está em um formato válido. Informe DDI 55, DDD e número, apenas com dígitos.";

    if (!url && typed) {
      if (strip) strip.textContent = invalidMessage;
      document.querySelectorAll(".whatsapp-inline-note").forEach(function (note) {
        note.hidden = false;
        note.textContent = invalidMessage;
      });
    }

    if (url) {
      if (strip) strip.hidden = true;
      document.querySelectorAll(".whatsapp-inline-note").forEach(function (note) {
        if (note.id === "whatsapp-number") return;
        note.hidden = true;
      });
      var numberNote = document.getElementById("whatsapp-number");
      if (numberNote) {
        numberNote.hidden = false;
        numberNote.replaceChildren();
        var numberLink = document.createElement("a");
        numberLink.href = url;
        numberLink.target = "_blank";
        numberLink.rel = "noopener noreferrer";
        numberLink.textContent = formatWhatsAppNumber(number);
        var numberHint = document.createElement("span");
        numberHint.className = "sr-only";
        numberHint.textContent = " (abre em uma nova aba)";
        numberLink.appendChild(numberHint);
        bindWhatsAppLink(numberLink, "numero");
        numberNote.appendChild(numberLink);
      }
    }

    document.querySelectorAll("[data-whatsapp]").forEach(function (control) {
      var source = control.getAttribute("data-whatsapp-source") || "pagina";
      if (!url) {
        control.disabled = true;
        control.setAttribute("aria-disabled", "true");
        if (strip) control.setAttribute("aria-describedby", "whatsapp-review-note");
        return;
      }

      var link = document.createElement("a");
      link.className = control.className;
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.dataset.whatsappSource = source;
      link.appendChild(document.createTextNode(control.textContent.trim()));
      var hint = document.createElement("span");
      hint.className = "sr-only";
      hint.textContent = " (abre em uma nova aba)";
      link.appendChild(hint);
      bindWhatsAppLink(link, source);
      control.replaceWith(link);
    });

    if (url) mountFloat(url);
  }

  function setupHeaderOffset() {
    var bar = document.querySelector(".header-bar");
    if (!bar) return;

    function sync() {
      var height = Math.ceil(bar.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-offset", height + 16 + "px");
    }

    sync();
    window.addEventListener("resize", sync);
    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(sync);
      observer.observe(bar);
    }
  }

  function setupCurrentSection() {
    var links = Array.prototype.slice.call(document.querySelectorAll('#site-nav a[href^="#"]'));
    if (!links.length || typeof IntersectionObserver !== "function") return;
    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(function (section) {
      return section && !section.hidden;
    });

    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + entry.target.id;
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function init() {
    setYear();
    setupMenu();
    if (content.renderAbout) content.renderAbout(config.about || {});
    if (content.renderMedia) content.renderMedia(config.media || {});
    if (content.renderServices) content.renderServices(config.services || []);
    if (content.renderTestimonials) content.renderTestimonials(config.testimonials || {});
    if (content.renderContactMeta) content.renderContactMeta(config);
    setupWhatsApp(config.whatsapp || {});
    setupHeaderOffset();
    setupCurrentSection();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
