(function () {
  "use strict";

  var STORAGE_KEY = "rico-cookie-choice";

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
      var first = panel.querySelector("button");
      if (first) first.focus();
    }
  }

  function save(next) {
    choice = next;
    storeChoice(next);
    setOpen(false);
    toggle.focus();
  }

  toggle.type = "button";
  toggle.className = "cookie-toggle";
  toggle.setAttribute("aria-controls", "cookie-panel");
  toggle.setAttribute("aria-expanded", "false");
  toggle.textContent = "Cookies";

  panel.id = "cookie-panel";
  panel.className = "cookie-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "cookie-title");
  panel.hidden = true;

  var title = document.createElement("h2");
  title.id = "cookie-title";
  title.className = "cookie-title";
  title.textContent = "Cookies";

  var text = document.createElement("p");
  text.textContent = "Guardamos somente a sua preferência neste navegador. Este site não usa cookies de rastreamento nem de publicidade. Se a medição for ligada no futuro, ela só começa depois do seu aceite.";

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
  close.textContent = "Fechar";

  accept.addEventListener("click", function () {
    save("all");
  });
  essential.addEventListener("click", function () {
    save("essential");
  });
  close.addEventListener("click", function () {
    setOpen(false);
    toggle.focus();
  });
  toggle.addEventListener("click", function () {
    setOpen(panel.hidden);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  actions.appendChild(accept);
  actions.appendChild(essential);
  panel.appendChild(title);
  panel.appendChild(text);
  panel.appendChild(status);
  panel.appendChild(actions);
  panel.appendChild(close);
  document.body.appendChild(panel);
  document.body.appendChild(toggle);
  document.body.classList.add("has-cookie-toggle");

  if (!choice) setOpen(true);

  window.RICO_COOKIES = {
    getChoice: function () {
      return choice;
    },
    allowsMeasurement: function () {
      return choice === "all";
    },
  };
})();
