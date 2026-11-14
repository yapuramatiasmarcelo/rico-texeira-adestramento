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

    var currentLift = 0;

    function cookieDialogOpen() {
      var panel = document.getElementById("cookie-panel");
      if (!panel || panel.hidden) return false;
      var style = window.getComputedStyle(panel);
      return style.display !== "none" && style.visibility !== "hidden";
    }

    function controlVisible(node) {
      if (!node || node.hidden || node === link) return false;
      var style = window.getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden";
    }

    function overlaps(a, b, gap) {
      return a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
    }

    function pushClearance(rects, rect) {
      if (!rect || rect.width < 8 || rect.height < 8) return;
      rects.push(rect);
    }

    function clearance(baseRect) {
      var rects = [];
      Array.prototype.forEach.call(document.querySelectorAll(".short-frame"), function (frame) {
        if (!controlVisible(frame)) return;
        var bounds = frame.getBoundingClientRect();
        pushClearance(rects, {
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          bottom: Math.min(bounds.bottom, bounds.top + 52),
          width: bounds.width,
          height: Math.min(52, bounds.height),
        });
        pushClearance(rects, {
          left: bounds.left,
          right: bounds.right,
          top: Math.max(bounds.top, bounds.bottom - 76),
          bottom: bounds.bottom,
          width: bounds.width,
          height: Math.min(76, bounds.height),
        });
      });

      var controls = document.querySelectorAll([
        ".short-play",
        ".short-watch",
        ".faq-trigger",
        ".faq-cta .btn",
        ".faq-cta a",
        "a.btn-whatsapp",
        "#consulta-form input",
        "#consulta-form textarea",
        "#consulta-form .btn-consulta",
        ".contact-fallback .btn",
        ".contact-fallback a",
        ".footer-nav a",
        ".footer-contact a",
        ".footer-social a",
        "#cookie-preferences",
        ".credit-link",
      ].join(","));
      Array.prototype.forEach.call(controls, function (control) {
        if (!controlVisible(control)) return;
        if (control.closest && control.closest(".hp-field")) return;
        pushClearance(rects, control.getBoundingClientRect());
      });

      var limit = Math.max(0, window.innerHeight - baseRect.height - 96);
      var lift = 0;
      var pass = 0;
      for (pass = 0; pass < 8; pass += 1) {
        var moved = {
          left: baseRect.left,
          right: baseRect.right,
          top: baseRect.top - lift,
          bottom: baseRect.bottom - lift,
        };
        var next = lift;
        rects.forEach(function (rect) {
          if (!overlaps(moved, rect, 10)) return;
          var needed = baseRect.bottom - rect.top + 12;
          if (needed > limit) needed = limit;
          if (needed > next) next = needed;
        });
        if (next === lift) break;
        lift = next;
      }
      return Math.ceil(lift);
    }

    function setLift(next) {
      if (next === currentLift) return;
      currentLift = next;
      link.style.setProperty("--float-lift", next + "px");
    }

    function syncFloat() {
      var placed = link.getBoundingClientRect();
      var baseRect = {
        left: placed.left,
        right: placed.right,
        top: placed.top + currentLift,
        bottom: placed.bottom + currentLift,
        width: placed.width,
        height: placed.height,
      };
      setLift(clearance(baseRect));
      link.classList.toggle("is-resting", cookieDialogOpen());
    }

    syncFloat();
    window.addEventListener("scroll", syncFloat, { passive: true });
    window.addEventListener("resize", syncFloat);
    document.addEventListener("click", syncFloat);
    document.addEventListener("keydown", syncFloat);
    if (typeof MutationObserver === "function") {
      var floatObserver = new MutationObserver(syncFloat);
      var panel = document.getElementById("cookie-panel");
      if (panel) {
        floatObserver.observe(panel, { attributes: true, attributeFilter: ["hidden", "class", "style"] });
      }
      floatObserver.observe(document.body, { childList: true, subtree: true });
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
    setupShortPlayback();
    setupReviewCarousel();
    if (content.renderContactMeta) content.renderContactMeta(config);
    setupWhatsApp(config.whatsapp || {});
    setupFaq();
    setupHeaderOffset();
    setupCurrentSection();
    setupReveal();
    setupAboutMotion();
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
      var hint = field.input.getAttribute("data-hint");
      if (message) field.input.setAttribute("aria-describedby", hint ? hint + " " + field.error.id : field.error.id);
      else if (hint) field.input.setAttribute("aria-describedby", hint);
      else field.input.removeAttribute("aria-describedby");
    }

    function setStatus(state, message) {
      status.dataset.state = state;
      status.textContent = message;
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function phoneDigits(value) {
      var digits = String(value || "").replace(/\D/g, "");
      if (digits.slice(0, 2) === "55" && digits.length >= 12) digits = digits.slice(2);
      if (digits.charAt(0) === "0" && digits.length >= 11) digits = digits.slice(1);
      return digits.slice(0, 11);
    }

    function maskLocal(local) {
      var mobile = local.charAt(0) === "9";
      local = local.slice(0, mobile ? 9 : 8);
      if (!local) return "(41) ";
      var cut = mobile ? 5 : 4;
      var body = local.length > cut ? local.slice(0, cut) + "-" + local.slice(cut) : local;
      return "(41) " + body;
    }

    function maskWithDdd(digits) {
      var ddd = digits.slice(0, 2);
      var local = digits.slice(2);
      var mobile = local.charAt(0) === "9" || local.length > 8;
      local = local.slice(0, mobile ? 9 : 8);
      if (!local) return "(" + ddd + ") ";
      var cut = mobile ? 5 : 4;
      var body = local.length > cut ? local.slice(0, cut) + "-" + local.slice(cut) : local;
      return "(" + ddd + ") " + body;
    }

    function formatCuritibaPhone(value, typing) {
      var digits = phoneDigits(value);
      if (!digits) return "";
      if (digits.slice(0, 2) === "41") return maskLocal(digits.slice(2));
      if (digits.charAt(0) === "9") return maskLocal(digits);
      if (!typing && digits.length === 8 && /^[2-5]/.test(digits)) return maskLocal(digits);
      if (digits.length > 8) return maskWithDdd(digits);
      if (digits.length > 4) return digits.slice(0, 4) + "-" + digits.slice(4);
      return digits;
    }

    function parsedPhone(value) {
      var digits = phoneDigits(value);
      if (digits.slice(0, 2) === "41") return { ddd: "41", local: digits.slice(2) };
      if (digits.charAt(0) === "9" && digits.length <= 9) return { ddd: "41", local: digits };
      if (/^[2-5]\d{7}$/.test(digits)) return { ddd: "41", local: digits };
      return { ddd: digits.slice(0, 2), local: digits.slice(2), foreign: true };
    }

    function isFakeLocal(local) {
      if (/^(\d)\1+$/.test(local)) return true;
      var rising = true;
      var falling = true;
      var index;
      for (index = 1; index < local.length; index += 1) {
        var diff = Number(local.charAt(index)) - Number(local.charAt(index - 1));
        if (diff !== 1) rising = false;
        if (diff !== -1) falling = false;
      }
      return rising || falling;
    }

    function validCuritibaPhone(value) {
      var parts = parsedPhone(value);
      if (parts.foreign || parts.ddd !== "41") return false;
      var local = parts.local;
      var mobile = /^9\d{8}$/.test(local);
      var landline = /^[2-5]\d{7}$/.test(local);
      if (!mobile && !landline) return false;
      return !isFakeLocal(local);
    }

    function phoneMessage(value) {
      if (!String(value || "").trim()) return "Informe um telefone de Curitiba com DDD 41.";
      if (!validCuritibaPhone(value)) return "Use um número real de Curitiba, com DDD 41. Exemplo: (41) 99901-7892.";
      return "";
    }

    if (fields.telefone.input) {
      fields.telefone.input.addEventListener("input", function () {
        var formatted = formatCuritibaPhone(fields.telefone.input.value, true);
        if (fields.telefone.input.value !== formatted) {
          fields.telefone.input.value = formatted;
        }
      });
      fields.telefone.input.addEventListener("blur", function () {
        fields.telefone.input.value = formatCuritibaPhone(fields.telefone.input.value, false);
      });
    }

    function validate() {
      var nome = fields.nome.input.value.trim();
      var email = fields.email.input.value.trim();
      var telefone = formatCuritibaPhone(fields.telefone.input.value.trim(), false);
      var mensagem = fields.mensagem.input.value.trim();
      var ok = true;

      if (telefone) fields.telefone.input.value = telefone;
      setFieldError(fields.nome, nome.length >= 2 ? "" : "Informe seu nome.");
      setFieldError(fields.email, validEmail(email) ? "" : "Informe um e-mail válido.");
      setFieldError(fields.telefone, phoneMessage(telefone));
      setFieldError(fields.mensagem, mensagem.length >= 10 ? "" : "Escreva a consulta com pelo menos uma frase.");
      Object.keys(fields).forEach(function (key) {
        if (fields[key].error && !fields[key].error.hidden) ok = false;
      });
      return ok ? { nome: nome, email: email, telefone: telefone, mensagem: mensagem } : null;
    }

    function sendEndpoint() {
      var host = String(location.hostname || "").replace(/\.+$/, "").toLowerCase();
      if (host !== "preview.ricoteixeiraadestramento.com.br") return "";
      var endpoint = String(contact.endpoint || "").trim();
      try {
        var url = new URL(endpoint);
        if (url.protocol !== "https:") return "";
        if (url.hostname !== host) return "";
        if (url.pathname !== "/api/contact.php") return "";
        return url.origin + url.pathname;
      } catch (error) {
        return "";
      }
    }

    var pending = document.getElementById("consulta-pending");
    var button = form.querySelector(".btn-consulta");
    var fallback = document.getElementById("contact-fallback");
    var previewNotice = "O envio por e-mail será habilitado antes da publicação. Por enquanto, fale com o Rico pelo WhatsApp.";

    function showPreviewState(endpointReady) {
      form.hidden = false;
      if (fallback) fallback.hidden = true;
      if (button) button.disabled = !endpointReady;
      if (!pending) return;
      pending.hidden = endpointReady;
      if (!endpointReady) pending.textContent = previewNotice;
    }

    var sending = false;
    showPreviewState(Boolean(sendEndpoint()));

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;
      var endpoint = sendEndpoint();
      if (!endpoint) {
        showPreviewState(false);
        return;
      }

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
      body.append("empresa", trap ? trap.value : "");
      sending = true;
      if (button) button.disabled = true;
      setStatus("sending", "Enviando consulta…");
      fetch(endpoint, { method: "POST", body: body, headers: { Accept: "application/json" } })
        .then(function (response) {
          return response.json().then(function (payload) {
            if (!response.ok || !payload || payload.ok !== true) throw new Error("rejected");
          }, function () {
            throw new Error("rejected");
          });
        })
        .then(function () {
          form.reset();
          Object.keys(fields).forEach(function (key) { setFieldError(fields[key], ""); });
          setStatus("success", "Consulta enviada. Rico vai receber sua mensagem por e-mail.");
        })
        .catch(function () {
          setStatus("error", "Não foi possível enviar a mensagem. Tente de novo em instantes ou fale com Rico pelo WhatsApp.");
        })
        .then(function () {
          sending = false;
          if (button) button.disabled = !sendEndpoint();
        });
    });
  }

  function setupReviewCarousel() {
    var root = document.querySelector("[data-review-carousel]");
    if (!root) return;
    var track = root.querySelector(".review-track");
    var cards = track ? Array.prototype.slice.call(track.children) : [];
    if (cards.length < 2) return;

    var index = 0;
    var timer = 0;
    var paused = false;
    var offscreen = true;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var delay = 5000;
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-review-dot]"));

    function show(next) {
      index = (next + cards.length) % cards.length;
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      cards.forEach(function (card, itemIndex) {
        var active = itemIndex === index;
        card.setAttribute("aria-hidden", active ? "false" : "true");
        if (active) card.removeAttribute("inert");
        else card.setAttribute("inert", "");
      });
      dots.forEach(function (dot, itemIndex) {
        if (itemIndex === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
    }

    function start() {
      if (reduce || paused || offscreen || document.hidden || timer) return;
      timer = window.setInterval(function () {
        show(index + 1);
      }, delay);
    }

    function go(next) {
      show(next);
      stop();
      start();
    }

    var prev = root.querySelector("[data-review-prev]");
    var next = root.querySelector("[data-review-next]");
    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () { go(itemIndex); });
    });

    root.addEventListener("mouseenter", function () {
      paused = true;
      stop();
    });
    root.addEventListener("mouseleave", function () {
      paused = false;
      start();
    });
    root.addEventListener("focusin", function () {
      paused = true;
      stop();
    });
    root.addEventListener("focusout", function (event) {
      if (root.contains(event.relatedTarget)) return;
      paused = false;
      start();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    show(0);
    if (typeof IntersectionObserver === "function") {
      var observer = new IntersectionObserver(function (entries) {
        offscreen = !entries.some(function (entry) { return entry.isIntersecting; });
        if (offscreen) stop();
        else start();
      }, { threshold: 0.35 });
      observer.observe(root);
    } else {
      offscreen = false;
      start();
    }
  }

  function setupShortPlayback() {
    var frames = document.querySelectorAll(".short-frame iframe");
    Array.prototype.forEach.call(frames, function (iframe) {
      iframe.addEventListener("error", function () {
        var figure = iframe.closest(".quote-short");
        var status = figure ? figure.querySelector(".short-status") : null;
        if (status) status.hidden = false;
      });
    });
  }

  function setupAboutMotion() {
    var section = document.getElementById("sobre");
    if (!section) return;
    var nodes = section.querySelectorAll(".about-collage, .about-copy");
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
        Array.prototype.forEach.call(nodes, function (node) {
          node.classList.add("is-visible");
        });
        observer.disconnect();
      });
    }, { threshold: 0.18 });

    observer.observe(section);
  }

  function setupReveal() {
    var nodes = document.querySelectorAll(".card");
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
