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

  function createWhatsAppLogo() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "whatsapp-logo");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M19.05 4.91A9.816 9.816 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zm-7.01 15.24h-.004a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z");
    svg.appendChild(path);
    return svg;
  }

  function boxesOverlap(a, b, gap) {
    return a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
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
    link.setAttribute("aria-label", "Conversar com Rico no WhatsApp (abre em uma nova aba)");
    link.appendChild(createWhatsAppLogo());
    bindWhatsAppLink(link, "flutuante");
    document.body.appendChild(link);
    document.body.classList.add("has-whatsapp-float");

    var contact = document.getElementById("contato");

    function syncFloat() {
      var height = window.innerHeight || document.documentElement.clientHeight;
      var blocked = false;
      if (contact) {
        var contactRect = contact.getBoundingClientRect();
        blocked = contactRect.bottom > 72 && contactRect.top < height - 24;
      }
      if (!blocked) {
        var floatRect = link.getBoundingClientRect();
        var obstacles = document.querySelectorAll(".quote-video video, .short-frame, #cookie-panel, #cookie-preferences, .faq-trigger");
        Array.prototype.forEach.call(obstacles, function (obstacle) {
          if (blocked || obstacle.hidden) return;
          var style = window.getComputedStyle(obstacle);
          if (style.display === "none" || style.visibility === "hidden") return;
          if (boxesOverlap(floatRect, obstacle.getBoundingClientRect(), 12)) blocked = true;
        });
      }
      link.classList.toggle("is-resting", blocked);
    }

    syncFloat();
    window.addEventListener("scroll", syncFloat, { passive: true });
    window.addEventListener("resize", syncFloat);
    document.addEventListener("click", syncFloat);
    document.addEventListener("keydown", syncFloat);
    if (typeof MutationObserver === "function") {
      var floatObserver = new MutationObserver(syncFloat);
      floatObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["hidden", "class", "style"],
      });
    }
  }

  function setupWhatsApp(whatsapp) {
    var raw = String((whatsapp && whatsapp.number) || "");
    var number = resolveWhatsAppNumber(raw);
    var typed = raw.trim().length > 0;
    var url = number ? buildWhatsAppUrl(number, whatsapp && whatsapp.message) : "";
    var strip = document.getElementById("whatsapp-review-note");
    var invalidMessage = "O número de WhatsApp não está em um formato válido. Informe DDI 55, DDD e número, apenas com dígitos.";

    if (!url && strip) strip.hidden = false;
    if (!url) {
      document.querySelectorAll(".whatsapp-inline-note").forEach(function (note) {
        if (note.id === "whatsapp-number") return;
        note.hidden = false;
      });
    }

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
      var footerPhone = document.getElementById("footer-phone");
      if (footerPhone) {
        footerPhone.hidden = false;
        footerPhone.replaceChildren();
        var footerKicker = document.createElement("span");
        footerKicker.className = "footer-kicker";
        footerKicker.textContent = "WhatsApp";
        var footerLink = document.createElement("a");
        footerLink.href = url;
        footerLink.target = "_blank";
        footerLink.rel = "noopener noreferrer";
        footerLink.textContent = formatWhatsAppNumber(number);
        var footerHint = document.createElement("span");
        footerHint.className = "sr-only";
        footerHint.textContent = " (abre em uma nova aba)";
        footerLink.appendChild(footerHint);
        bindWhatsAppLink(footerLink, "rodape");
        footerPhone.appendChild(footerKicker);
        footerPhone.appendChild(footerLink);
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
      link.className = control.className.replace(/\bbtn-primary\b/g, "btn-whatsapp");
      if (link.className.indexOf("btn-whatsapp") === -1) link.className += " btn-whatsapp";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.dataset.whatsappSource = source;
      link.appendChild(createWhatsAppLogo());
      link.appendChild(document.createTextNode("Conversar com Rico"));
      var hint = document.createElement("span");
      hint.className = "sr-only";
      hint.textContent = " (abre em uma nova aba)";
      link.appendChild(hint);
      bindWhatsAppLink(link, source);
      control.replaceWith(link);
    });

    if (url) mountFloat(url);
  }

  function setupFaq() {
    var items = document.querySelectorAll(".faq-item");
    Array.prototype.forEach.call(items, function (item) {
      var button = item.querySelector(".faq-trigger");
      var panel = item.querySelector(".faq-panel");
      if (!button || !panel) return;
      button.addEventListener("click", function () {
        var open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", open ? "false" : "true");
        panel.classList.toggle("is-open", !open);
        panel.setAttribute("aria-hidden", open ? "true" : "false");
      });
    });
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
    setupFaq();
    setupHeaderOffset();
    setupCurrentSection();
    setupReveal();
    setupConsultaForm(config.contact || {});
  }

  function setupConsultaForm(contact) {
    var form = document.getElementById("consulta-form");
    var status = document.getElementById("consulta-status");
    if (!form || !status) return;

    var fields = {
      nome: { input: document.getElementById("consulta-nome"), error: document.getElementById("consulta-nome-erro") },
      email: { input: document.getElementById("consulta-email"), error: document.getElementById("consulta-email-erro") },
      telefone: { input: document.getElementById("consulta-telefone"), error: document.getElementById("consulta-telefone-erro") },
      mensagem: { input: document.getElementById("consulta-mensagem"), error: document.getElementById("consulta-mensagem-erro") },
    };

    function setFieldError(field, message) {
      if (!field.input || !field.error) return;
      field.error.textContent = message;
      field.error.hidden = !message;
      field.input.setAttribute("aria-invalid", message ? "true" : "false");
      if (message) field.input.setAttribute("aria-describedby", field.error.id);
      else field.input.removeAttribute("aria-describedby");
    }

    function setStatus(state, message) {
      status.dataset.state = state;
      status.textContent = message;
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validPhone(value) {
      var digits = value.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11 || /^55\d{10,11}$/.test(digits);
    }

    function validate() {
      var nome = fields.nome.input.value.trim();
      var email = fields.email.input.value.trim();
      var telefone = fields.telefone.input.value.trim();
      var mensagem = fields.mensagem.input.value.trim();
      var ok = true;

      setFieldError(fields.nome, nome.length >= 2 ? "" : "Informe seu nome.");
      setFieldError(fields.email, validEmail(email) ? "" : "Informe um e-mail válido.");
      setFieldError(fields.telefone, !telefone || validPhone(telefone) ? "" : "Informe um telefone com DDD.");
      setFieldError(fields.mensagem, mensagem.length >= 10 ? "" : "Escreva a consulta com pelo menos uma frase.");
      Object.keys(fields).forEach(function (key) {
        if (fields[key].error && !fields[key].error.hidden) ok = false;
      });
      return ok ? { nome: nome, email: email, telefone: telefone, mensagem: mensagem } : null;
    }

    function sendEndpoint() {
      var endpoint = String(contact.endpoint || "").trim();
      try {
        var url = new URL(endpoint);
        return url.protocol === "https:" ? url.href : "";
      } catch (error) {
        return "";
      }
    }

    var pending = document.getElementById("consulta-pending");
    var button = form.querySelector(".btn-consulta");
    if (pending) pending.hidden = Boolean(sendEndpoint());
    if (button && sendEndpoint()) button.disabled = false;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var endpoint = sendEndpoint();
      if (!endpoint) return;

      setStatus("", "");
      var data = validate();
      if (!data) {
        setStatus("error", "Revise os campos destacados antes de enviar.");
        var firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var trap = document.getElementById("consulta-empresa");
      if (trap && trap.value.trim()) {
        setStatus("error", "Não foi possível enviar a mensagem. Tente de novo ou fale com Rico pelo WhatsApp.");
        return;
      }

      var body = new FormData();
      body.append("nome", data.nome);
      body.append("email", data.email);
      body.append("telefone", data.telefone);
      body.append("mensagem", data.mensagem);
      if (button) button.disabled = true;
      fetch(endpoint, { method: "POST", body: body, headers: { Accept: "application/json" } })
        .then(function (response) {
          if (!response.ok) throw new Error("rejected");
          form.reset();
          Object.keys(fields).forEach(function (key) { setFieldError(fields[key], ""); });
          setStatus("success", "Consulta enviada. Rico vai receber sua mensagem por e-mail.");
        })
        .catch(function () {
          setStatus("error", "Não foi possível enviar a mensagem. Tente de novo em instantes ou fale com Rico pelo WhatsApp.");
        })
        .then(function () {
          if (button) button.disabled = false;
        });
    });
  }

  function setupReveal() {
    var nodes = document.querySelectorAll(".card, .short-frame");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver !== "function") {
      Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });

    Array.prototype.forEach.call(nodes, function (node) {
      observer.observe(node);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
