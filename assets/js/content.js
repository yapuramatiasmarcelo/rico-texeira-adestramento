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
    img.alt = String((media && media.alt) || "").trim() || "Fotografia de Rico Teixeira Adestramento";
    img.width = Number(media && media.width) || 1200;
    img.height = Number(media && media.height) || 900;
    img.decoding = "async";
    var mobile = String((media && media.srcMobile) || "").trim();
    var node = img;
    if (priority === "high" && isSafeImagePath(mobile)) {
      var picture = document.createElement("picture");
      var small = document.createElement("source");
      small.media = "(max-width: 47.99rem)";
      small.srcset = mobile;
      small.type = "image/webp";
      var large = document.createElement("source");
      large.srcset = src;
      large.type = "image/webp";
      picture.appendChild(small);
      picture.appendChild(large);
      picture.appendChild(img);
      img.src = src;
      node = picture;
    } else {
      img.src = src;
    }
    if (priority === "high") {
      img.setAttribute("fetchpriority", "high");
    } else {
      img.loading = "lazy";
    }
    var placeholder = figure.querySelector(".placeholder");
    img.addEventListener("error", function () {
      if (node.parentNode) node.remove();
      if (placeholder) placeholder.hidden = false;
      var caption = figure.querySelector("figcaption");
      if (caption) caption.hidden = false;
    });
    if (placeholder) placeholder.hidden = true;
    var captionOk = figure.querySelector("figcaption");
    if (captionOk) captionOk.hidden = true;
    figure.insertBefore(node, figure.firstChild);
  }

  function renderMedia(media) {
    var source = media || {};
    var hero = document.querySelector('[data-media="hero"]');
    var about = document.querySelector('[data-media="about"]');
    if (hero && !hero.querySelector("img")) mountImage(hero, source.hero, "high");
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
      empty.textContent = "O primeiro passo continua sendo a avaliação comportamental.";
      list.appendChild(empty);
      return;
    }

    visible.forEach(function (service) {
      var card = document.createElement("article");
      card.className = "card";
      if (service.provisional !== false) card.classList.add("is-provisional");

      var frame = null;
      var src = String(service.image || "").trim();
      var label = service.imageLabel || "Imagem do serviço";
      var description = "Fotografia em revisão. " + (service.imageLabel || service.name);
      if (isSafeImagePath(src) || service.provisional !== false) {
        frame = document.createElement("div");
        frame.className = "card-media";
      }
      if (frame && isSafeImagePath(src)) {
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
      } else if (frame) {
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
      if (frame) card.appendChild(frame);
      card.appendChild(body);
      list.appendChild(card);
    });
  }

  function isYouTubeId(value) {
    return /^[A-Za-z0-9_-]{11}$/.test(String(value || "").trim());
  }

  function validTestimonial(item) {
    if (!item) return false;
    if (isYouTubeId(item.youtube)) return true;
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

  function renderYouTubeShort(item) {
    var id = String(item.youtube).trim();
    var person = String(item.name || "Depoimento").trim();
    var figure = document.createElement("figure");
    figure.className = "quote quote-short";

    var frame = document.createElement("div");
    frame.className = "short-frame";

    var poster = String(item.poster || "").trim();
    if (isSafeImagePath(poster)) {
      var image = document.createElement("img");
      image.className = "short-thumb";
      image.src = poster;
      image.alt = "Miniatura do depoimento de " + person;
      image.width = Number(item.posterWidth) || 480;
      image.height = Number(item.posterHeight) || 853;
      image.decoding = "async";
      image.loading = "lazy";
      image.addEventListener("error", function () {
        image.hidden = true;
      });
      frame.appendChild(image);
    }

    var button = document.createElement("button");
    button.type = "button";
    button.className = "short-play";
    button.textContent = "Assistir ao depoimento";
    button.addEventListener("click", function () {
      if (frame.querySelector("iframe")) return;
      var player = document.createElement("iframe");
      player.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
      player.title = "Depoimento de " + person;
      player.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
      player.setAttribute("allowfullscreen", "");
      player.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      frame.replaceChildren(player);
    });
    frame.appendChild(button);

    var watch = document.createElement("a");
    watch.className = "short-watch";
    watch.href = "https://www.youtube.com/shorts/" + id;
    watch.target = "_blank";
    watch.rel = "noopener noreferrer";
    watch.textContent = "Assistir no YouTube";
    var hint = document.createElement("span");
    hint.className = "sr-only";
    hint.textContent = " (abre em uma nova aba)";
    watch.appendChild(hint);

    var caption = document.createElement("figcaption");
    var name = document.createElement("span");
    name.className = "quote-name";
    name.textContent = person;

    caption.appendChild(name);
    caption.appendChild(watch);
    figure.appendChild(frame);
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
      if (isYouTubeId(item.youtube)) list.appendChild(renderYouTubeShort(item));
      else if (isSafeImagePath(String(item.video || "").trim())) list.appendChild(renderTestimonialVideo(item));
      else list.appendChild(renderTestimonialQuote(item));
    });

    section.hidden = false;
    if (navItem) navItem.hidden = false;
  }

  function socialIcon(name) {
    var key = String(name || "").trim().toLowerCase();
    var path = "";
    if (key === "instagram") {
      path = "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z";
    } else if (key === "facebook") {
      path = "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
    }
    if (!path) return null;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "social-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shape.setAttribute("fill", "currentColor");
    shape.setAttribute("d", path);
    svg.appendChild(shape);
    return svg;
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

    note.textContent = place;
    note.hidden = false;
    var fact = document.getElementById("address-fact");
    if (fact) fact.hidden = false;
    var openMap = document.createElement("a");
    openMap.href = mapUrl;
    openMap.target = "_blank";
    openMap.rel = "noopener noreferrer";
    openMap.textContent = "Ver no Google Maps";
    var hint = document.createElement("span");
    hint.className = "sr-only";
    hint.textContent = " (abre em uma nova aba)";
    openMap.appendChild(hint);
    var linkSlot = document.getElementById("address-link");
    if (linkSlot) {
      linkSlot.replaceChildren(openMap);
      linkSlot.hidden = false;
    }

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
    if (regionNote && region) regionNote.textContent = region;
    var footerRegion = document.getElementById("footer-region");
    if (footerRegion && region) {
      footerRegion.hidden = false;
      footerRegion.replaceChildren();
      var regionKicker = document.createElement("span");
      regionKicker.className = "footer-kicker";
      regionKicker.textContent = "Região";
      footerRegion.appendChild(regionKicker);
      footerRegion.appendChild(document.createTextNode(region));
    }
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
      var name = String(item.name).trim();
      var li = document.createElement("li");
      var anchor = document.createElement("a");
      anchor.href = String(item.url).trim();
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      var icon = socialIcon(name);
      if (icon) anchor.appendChild(icon);
      anchor.appendChild(document.createTextNode(name));
      var hint = document.createElement("span");
      hint.className = "sr-only";
      hint.textContent = " (abre em uma nova aba)";
      anchor.appendChild(hint);
      li.appendChild(anchor);
      socialList.appendChild(li);
    });
    socialNote.hidden = true;
    socialList.hidden = false;
    var footerSocial = document.getElementById("footer-social");
    if (footerSocial) {
      footerSocial.replaceChildren();
      links.forEach(function (item) {
        var name = String(item.name).trim();
        var li = document.createElement("li");
        var anchor = document.createElement("a");
        anchor.href = String(item.url).trim();
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = name;
        var hint = document.createElement("span");
        hint.className = "sr-only";
        hint.textContent = " (abre em uma nova aba)";
        anchor.appendChild(hint);
        li.appendChild(anchor);
        footerSocial.appendChild(li);
      });
      footerSocial.hidden = false;
    }
  }

  window.RICO_CONTENT = {
    renderAbout: renderAbout,
    renderMedia: renderMedia,
    renderServices: renderServices,
    renderTestimonials: renderTestimonials,
    renderContactMeta: renderContactMeta,
  };
})();
