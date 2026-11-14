(function () {
  "use strict";

  var STORAGE_KEY = "rico-cookie-choice";
  var currentLift = 0;
  var currentPanelLift = 0;
  var placing = false;

  function readChoice() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "all" || saved === "essential") return saved;
    } catch (error) {
      return "";
    }
    return "";
  }

  function storeChoice(choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch (error) {
      return false;
    }
    return true;
  }

  function createCookieIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("cookie-icon");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M12 2.75a9.25 9.25 0 1 0 6.4 15.9 1.05 1.05 0 0 0 .12-1.58 2.3 2.3 0 0 1-.5-2.5 2.15 2.15 0 0 1 2.05-3.2h.3a1.05 1.05 0 0 0 .95-1.58A9.25 9.25 0 0 0 12 2.75zM8.35 8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm1.4 4.5a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7zm4.3.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM8.1 15.65a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1z");
    svg.appendChild(path);
    return svg;
  }

  var choice = readChoice();
  var toggle = document.createElement("button");
  var panel = document.createElement("section");
  var status = document.createElement("p");

  function choiceLabel() {
    if (choice === "all") return "Escolha atual: cookies aceitos.";
    if (choice === "essential") return "Escolha atual: apenas o necessário.";
    return "Você ainda não confirmou esta preferência.";
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      status.textContent = choiceLabel();
      accept.focus();
    }
    window.requestAnimationFrame(place);
  }

  function closePanel() {
    if (panel.hidden) return;
    setOpen(false);
    toggle.focus();
  }

  function save(next) {
    choice = next;
    storeChoice(next);
    document.dispatchEvent(new CustomEvent("rico:cookie-choice", { detail: { choice: next } }));
    setOpen(false);
    toggle.focus();
  }

  toggle.type = "button";
  toggle.id = "cookie-preferences";
  toggle.className = "cookie-toggle";
  toggle.setAttribute("aria-label", "Preferências de cookies");
  toggle.setAttribute("aria-controls", "cookie-panel");
  toggle.setAttribute("aria-expanded", "false");
  toggle.appendChild(createCookieIcon());

  panel.id = "cookie-panel";
  panel.className = "cookie-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "cookie-title");
  panel.hidden = true;

  var title = document.createElement("h2");
  title.id = "cookie-title";
  title.className = "cookie-title";
  title.textContent = "Preferências de cookies";

  var text = document.createElement("p");
  text.textContent = "Guardamos a sua preferência neste navegador. A medição dos anúncios do Google só começa se você aceitar.";

  status.className = "cookie-status";
  status.textContent = choiceLabel();

  var actions = document.createElement("div");
  actions.className = "cookie-actions";

  var accept = document.createElement("button");
  accept.type = "button";
  accept.className = "btn btn-primary";
  accept.textContent = "Aceitar";

  var essential = document.createElement("button");
  essential.type = "button";
  essential.className = "btn btn-secondary";
  essential.textContent = "Apenas o necessário";

  var close = document.createElement("button");
  close.type = "button";
  close.className = "cookie-close";
  close.setAttribute("aria-label", "Fechar preferências de cookies");
  var closeMark = document.createElement("span");
  closeMark.setAttribute("aria-hidden", "true");
  closeMark.textContent = "×";
  close.appendChild(closeMark);

  accept.addEventListener("click", function () {
    save("all");
  });
  essential.addEventListener("click", function () {
    save("essential");
  });
  close.addEventListener("click", function () {
    closePanel();
  });
  toggle.addEventListener("click", function () {
    setOpen(panel.hidden);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || panel.hidden) return;
    event.preventDefault();
    closePanel();
  });

  var head = document.createElement("div");
  head.className = "cookie-head";
  head.appendChild(title);
  head.appendChild(close);

  var body = document.createElement("div");
  body.className = "cookie-body";
  body.appendChild(text);
  body.appendChild(status);

  actions.appendChild(accept);
  actions.appendChild(essential);
  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(actions);
  document.body.appendChild(panel);
  document.body.appendChild(toggle);
  document.body.classList.add("has-cookie-toggle");

  function boxOf(node, keepHidden) {
    if (!node || node.hidden) return null;
    if (node.closest && node.closest(".hp-field")) return null;
    var style = window.getComputedStyle(node);
    if (style.display === "none") return null;
    if (!keepHidden && style.visibility === "hidden") return null;
    var rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return null;
    if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    };
  }

  function obstacles() {
    var list = [];
    function add(node, keepHidden) {
      var rect = boxOf(node, keepHidden);
      if (rect) list.push(rect);
    }
    var header = document.querySelector(".site-header");
    add(header, false);
    Array.prototype.forEach.call(document.querySelectorAll("#consulta-form input, #consulta-form textarea, #consulta-form button, .header-cta"), function (node) {
      add(node, false);
    });
    add(document.querySelector(".whatsapp-float"), true);
    add(window.VLibrasWidget && window.VLibrasWidget.initBtn, false);
    return list;
  }

  function blockedSpans(x1, x2, boxes) {
    var spans = [];
    boxes.forEach(function (rect) {
      if (rect.right < x1 - 10 || rect.left > x2 + 10) return;
      spans.push([rect.top - 12, rect.bottom + 12]);
    });
    spans.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    spans.forEach(function (span) {
      if (!merged.length || span[0] > merged[merged.length - 1][1]) merged.push([span[0], span[1]]);
      else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], span[1]);
    });
    return merged;
  }

  function freeSlots(spans, top, bottom) {
    var slots = [];
    var cursor = top;
    spans.forEach(function (span) {
      var start = Math.max(span[0], top);
      var end = Math.min(span[1], bottom);
      if (start > cursor) slots.push([cursor, start]);
      if (end > cursor) cursor = end;
    });
    if (cursor < bottom) slots.push([cursor, bottom]);
    return slots;
  }

  function lowestFit(height, preferredBottom, slots) {
    var best = null;
    slots.forEach(function (slot) {
      if (slot[1] - slot[0] < height) return;
      var bottom = Math.min(preferredBottom, slot[1]);
      var top = bottom - height;
      if (top < slot[0]) {
        top = slot[0];
        bottom = top + height;
      }
      if (top < slot[0] || bottom > slot[1]) return;
      if (!best || bottom > best.bottom) best = { top: top, bottom: bottom };
    });
    return best;
  }

  function place() {
    var button = toggle.getBoundingClientRect();
    var base = {
      left: button.left,
      right: button.right,
      top: button.top + currentLift,
      bottom: button.bottom + currentLift,
      height: button.height || 48,
    };
    var boxes = obstacles();
    var viewTop = 8;
    var header = document.querySelector(".site-header");
    if (header) viewTop = Math.max(viewTop, header.getBoundingClientRect().bottom + 8);
    var viewBottom = Math.max(viewTop + base.height, base.bottom);
    var buttonFit = lowestFit(
      base.height,
      base.bottom,
      freeSlots(blockedSpans(base.left, base.right, boxes), viewTop, viewBottom)
    );
    var lift = buttonFit ? Math.max(0, Math.round(base.top - buttonFit.top)) : 0;
    var panelLift = 0;

    if (panel.hidden) {
      panel.style.maxHeight = "";
    } else {
      panel.style.maxHeight = "";
      var dialog = panel.getBoundingClientRect();
      var contentHeight = Math.min(panel.scrollHeight || dialog.height || 240, 360);
      var restingBottom = dialog.bottom + currentPanelLift;
      var buttonTop = base.top - lift;
      var panelBoxes = boxes.concat([{
        left: base.left - 8,
        right: base.right + 8,
        top: buttonTop - 8,
        bottom: buttonTop + base.height + 8,
      }]);
      var roomSlots = freeSlots(
        blockedSpans(dialog.left, dialog.right, panelBoxes),
        viewTop,
        window.innerHeight - 12
      );
      var chosen = null;
      roomSlots.forEach(function (slot) {
        var room = slot[1] - slot[0];
        if (room < contentHeight) return;
        var bottom = Math.min(buttonTop - 10, slot[1]);
        if (bottom - slot[0] < contentHeight) return;
        if (!chosen || bottom > chosen.bottom) chosen = { top: bottom - contentHeight, bottom: bottom };
      });
      if (!chosen) {
        roomSlots.forEach(function (slot) {
          var room = slot[1] - slot[0];
          if (room < 140) return;
          var bottom = Math.min(buttonTop - 10, slot[1]);
          if (bottom - slot[0] < 140) bottom = slot[1];
          var height = Math.min(contentHeight, bottom - slot[0]);
          if (height < 140) return;
          var top = bottom - height;
          if (top < slot[0]) return;
          if (!chosen || bottom > chosen.bottom) chosen = { top: top, bottom: bottom };
        });
      }
      if (chosen) {
        panel.style.maxHeight = Math.floor(chosen.bottom - chosen.top) + "px";
        panelLift = Math.max(0, Math.round(restingBottom - chosen.bottom));
      }
    }

    var moved = lift !== currentLift || panelLift !== currentPanelLift;
    currentLift = lift;
    currentPanelLift = panelLift;
    document.body.style.setProperty("--cookie-lift", lift + "px");
    document.body.style.setProperty("--cookie-panel-lift", panelLift + "px");
    if (moved && !placing) {
      placing = true;
      window.requestAnimationFrame(function () {
        placing = false;
        place();
      });
    }
  }

  if (!choice) setOpen(true);
  else place();

  window.addEventListener("scroll", place, { passive: true });
  window.addEventListener("resize", place);
  window.addEventListener("load", place);
  window.setTimeout(place, 700);
  window.setTimeout(place, 1800);

  window.RICO_COOKIES = {
    getChoice: function () {
      return choice;
    },
    allowsMeasurement: function () {
      return choice === "all";
    },
  };
})();
