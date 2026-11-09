(function () {
  "use strict";

  function fillAboutBlock(key, text) {
    var clean = String(text || "").trim();
    if (!clean) return;
    var slot = document.querySelector('[data-about="' + key + '"]');
    if (!slot) return;
    var parts = clean.split(/\n{2,}/).map(function (part) {
      return part.trim();
    }).filter(Boolean);
    var first = slot.querySelector("p");
    if (!first || !parts.length) return;
    first.textContent = parts[0];
    first.classList.remove("prep-copy");
    parts.slice(1).forEach(function (part) {
      var paragraph = document.createElement("p");
      paragraph.textContent = part;
      slot.appendChild(paragraph);
    });
    slot.dataset.ready = "true";
  }

  function renderAbout(about) {
    var source = about || {};
    fillAboutBlock("biography", source.biography);
    fillAboutBlock("approach", source.approach);
    var blocks = document.querySelectorAll("[data-about]");
    var ready = blocks.length > 0 && Array.prototype.every.call(blocks, function (block) {
      return block.dataset.ready === "true";
    });
    var flag = document.querySelector(".prep-flag");
    if (flag && ready) flag.hidden = true;
  }

  function isSafeImagePath(src) {
    if (!src || src.charAt(0) === "/" || src.indexOf("..") !== -1) return false;
    if (/^[a-z]+:/i.test(src) && !/^https:\/\//i.test(src)) return false;
    return true;
  }

  function createPlaceholder(label, ariaLabel) {
    var box = document.createElement("div");
    box.className = "placeholder";
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", ariaLabel);
    var kicker = document.createElement("span");
    kicker.className = "placeholder-kicker";
    kicker.textContent = "Fotografia em revisão";
    var title = document.createElement("strong");
    title.className = "placeholder-label";
    title.textContent = label;
    box.appendChild(kicker);
    box.appendChild(title);
    return box;
  }

  function mountImage(figure, media, priority) {
    var src = String((media && media.src) || "").trim();
    if (!isSafeImagePath(src)) return;
    var img = document.createElement("img");
    img.src = src;
    img.alt = String((media && media.alt) || "").trim() || "Fotografia de Rico Teixeira Adestramento";
    img.width = Number(media && media.width) || 1200;
    img.height = Number(media && media.height) || 900;
    img.decoding = "async";
    if (priority === "high") {
      img.loading = "eager";
      img.setAttribute("fetchpriority", "high");
    } else {
      img.loading = "lazy";
    }
    var placeholder = figure.querySelector(".placeholder");
    img.addEventListener("error", function () {
      img.remove();
      if (placeholder) placeholder.hidden = false;
      var caption = figure.querySelector("figcaption");
      if (caption) caption.hidden = false;
    });
    if (placeholder) placeholder.hidden = true;
    var captionOk = figure.querySelector("figcaption");
    if (captionOk) captionOk.hidden = true;
    figure.insertBefore(img, figure.firstChild);
  }

  function renderMedia(media) {
    var source = media || {};
    var hero = document.querySelector('[data-media="hero"]');
    var about = document.querySelector('[data-media="about"]');
    if (hero) mountImage(hero, source.hero, "high");
    if (about) mountImage(about, source.about, "low");
  }

  function renderServices(services) {
    var list = document.getElementById("services-list");
    if (!list) return;
    var items = Array.isArray(services) ? services : [];
    list.replaceChildren();

    var visible = items.filter(function (service) {
      return service && String(service.name || "").trim();
    });

    if (!visible.length) {
      var empty = document.createElement("p");
      empty.className = "review-note";
      empty.textContent = "Nenhum serviço confirmado nesta versão de revisão.";
      list.appendChild(empty);
      return;
    }

    visible.forEach(function (service) {
      var card = document.createElement("article");
      card.className = "card";
      if (service.provisional !== false) card.classList.add("is-provisional");

      var frame = document.createElement("div");
      frame.className = "card-media";
      var src = String(service.image || "").trim();
      var label = service.imageLabel || "Imagem do serviço";
      var description = "Fotografia em revisão. " + (service.imageLabel || service.name);
      if (isSafeImagePath(src)) {
        var img = document.createElement("img");
        img.src = src;
        img.alt = String(service.imageAlt || service.imageLabel || service.name).trim();
        img.width = Number(service.width) || 960;
        img.height = Number(service.height) || 640;
        img.loading = "lazy";
        img.decoding = "async";
        var fallback = createPlaceholder(label, description);
        img.addEventListener("error", function () {
          img.replaceWith(fallback);
        });
        frame.appendChild(img);
      } else {
        frame.appendChild(createPlaceholder(label, description));
      }

      var body = document.createElement("div");
      body.className = "card-body";
      if (service.provisional !== false) {
        var badge = document.createElement("p");
        badge.className = "provisional-badge";
        badge.textContent = "Conteúdo provisório de revisão";
        body.appendChild(badge);
      }
      var title = document.createElement("h3");
      title.textContent = String(service.name).trim();
      var copy = document.createElement("p");
      copy.textContent = String(service.description || "").trim();
      body.appendChild(title);
      body.appendChild(copy);
      card.appendChild(frame);
      card.appendChild(body);
      list.appendChild(card);
    });
  }

  function validTestimonial(item) {
    if (!item) return false;
    if (isSafeImagePath(String(item.video || "").trim())) return true;
    return Boolean(String(item.quote || "").trim() && String(item.name || "").trim());
  }

  function renderTestimonialVideo(item) {
    var figure = document.createElement("figure");
    figure.className = "quote quote-video";
    var video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    video.width = Number(item.width) || 848;
    video.height = Number(item.height) || 480;
    var source = document.createElement("source");
    source.src = String(item.video).trim();
    source.type = "video/mp4";
    video.appendChild(source);
    var caption = document.createElement("figcaption");
    var name = document.createElement("span");
    name.className = "quote-name";
    name.textContent = String(item.label || item.name || "Depoimento").trim();
    caption.appendChild(name);
    figure.appendChild(video);
    figure.appendChild(caption);
    return figure;
  }

  function renderTestimonialQuote(item) {
    var figure = document.createElement("figure");
    figure.className = "quote";
    var quote = document.createElement("blockquote");
    var text = document.createElement("p");
    text.textContent = String(item.quote).trim();
    quote.appendChild(text);
    var caption = document.createElement("figcaption");
    var name = document.createElement("span");
    name.className = "quote-name";
    name.textContent = String(item.name).trim();
    caption.appendChild(name);
    var context = String(item.context || "").trim();
    if (context) {
      var detail = document.createElement("span");
      detail.className = "quote-context";
      detail.textContent = context;
      caption.appendChild(detail);
    }
    figure.appendChild(quote);
    figure.appendChild(caption);
    return figure;
  }

  function renderTestimonials(testimonials) {
    var section = document.getElementById("depoimentos");
    var navItem = document.querySelector('[data-nav="testimonials"]');
    var list = document.getElementById("testimonials-list");
    if (!section || !list) return;

    var source = testimonials || {};
    var enabled = Boolean(source.enabled);
    var items = (Array.isArray(source.items) ? source.items : []).filter(validTestimonial);

    if (!enabled || !items.length) {
      section.hidden = true;
      if (navItem) navItem.hidden = true;
      list.replaceChildren();
      return;
    }

    list.replaceChildren();
    items.forEach(function (item) {
      if (isSafeImagePath(String(item.video || "").trim())) list.appendChild(renderTestimonialVideo(item));
      else list.appendChild(renderTestimonialQuote(item));
    });

    section.hidden = false;
    if (navItem) navItem.hidden = false;
  }

  function isPublicUrl(value) {
    try {
      var url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (error) {
      return false;
    }
  }

  function renderAddress(address) {
    var note = document.getElementById("address-note");
    var frame = document.getElementById("map-frame");
    var place = String(address || "").trim();
    if (!note || !frame || !place) return;

    var query = encodeURIComponent(place);
    var mapUrl = "https://www.google.com/maps/search/?api=1&query=" + query;
    var embedUrl = "https://maps.google.com/maps?q=" + query + "&z=16&hl=pt-BR&output=embed";

    note.replaceChildren();
    note.appendChild(document.createTextNode("Endereço: " + place + " "));
    var openMap = document.createElement("a");
    openMap.href = mapUrl;
    openMap.target = "_blank";
    openMap.rel = "noopener noreferrer";
    openMap.textContent = "Ver no Google Maps";
    var hint = document.createElement("span");
    hint.className = "sr-only";
    hint.textContent = " (abre em uma nova aba)";
    openMap.appendChild(hint);
    note.appendChild(openMap);
    note.hidden = false;

    var iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = "Mapa de " + place;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.setAttribute("width", "600");
    iframe.setAttribute("height", "375");
    frame.replaceChildren(iframe);
    frame.hidden = false;
  }

  function renderContactMeta(source) {
    var data = source || {};
    var regionNote = document.getElementById("region-note");
    var socialNote = document.getElementById("social-note");
    var socialList = document.getElementById("social-list");
    var region = String(data.region || "").trim();

    renderAddress(data.address);
    if (regionNote && region) regionNote.textContent = "Região de atendimento: " + region;
    if (!socialList || !socialNote) return;

    var links = (Array.isArray(data.social) ? data.social : []).filter(function (item) {
      return item && String(item.name || "").trim() && isPublicUrl(String(item.url || "").trim());
    });

    socialList.replaceChildren();
    if (!links.length) {
      socialNote.hidden = false;
      socialList.hidden = true;
      return;
    }

    links.forEach(function (item) {
      var li = document.createElement("li");
      var anchor = document.createElement("a");
      anchor.href = String(item.url).trim();
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = String(item.name).trim();
      var hint = document.createElement("span");
      hint.className = "sr-only";
      hint.textContent = " (abre em uma nova aba)";
      anchor.appendChild(hint);
      li.appendChild(anchor);
      socialList.appendChild(li);
    });
    socialNote.hidden = true;
    socialList.hidden = false;
  }

  window.RICO_CONTENT = {
    renderAbout: renderAbout,
    renderMedia: renderMedia,
    renderServices: renderServices,
    renderTestimonials: renderTestimonials,
    renderContactMeta: renderContactMeta,
  };
})();
