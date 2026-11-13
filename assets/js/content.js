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
    if (about) {
      var aboutMedia = source.about || {};
      var heroSrc = String((source.hero && source.hero.src) || "").trim();
      var aboutSrc = String(aboutMedia.src || "").trim();
      if (aboutSrc && aboutSrc !== heroSrc) mountImage(about, aboutMedia, "low");
    }
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
      else card.classList.add("is-text");
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

    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + id;
    iframe.title = "Depoimento de " + person;
    iframe.width = "220";
    iframe.height = "391";
    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.appendChild(iframe);

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
    var status = document.createElement("p");
    status.className = "short-status";
    status.hidden = true;
    status.textContent = "O vídeo não carregou nesta página.";

    caption.appendChild(name);
    caption.appendChild(status);
    caption.appendChild(watch);
    figure.appendChild(frame);
    figure.appendChild(caption);
    return figure;
  }

  function reviewInitials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function renderTestimonialQuote(item) {
    var person = String(item.name).trim();
    var article = document.createElement("article");
    article.className = "review-card";

    var personRow = document.createElement("div");
    personRow.className = "review-person";
    var avatar = document.createElement("span");
    avatar.className = "review-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = reviewInitials(person);
    var name = document.createElement("h3");
    name.className = "review-name";
    name.textContent = person;
    personRow.appendChild(avatar);
    personRow.appendChild(name);

    var rating = document.createElement("p");
    rating.className = "review-rating";
    var stars = document.createElement("span");
    stars.className = "review-stars";
    stars.setAttribute("aria-hidden", "true");
    stars.textContent = "★★★★★";
    var ratingText = document.createElement("span");
    ratingText.className = "sr-only";
    ratingText.textContent = "5 de 5 estrelas";
    rating.appendChild(stars);
    rating.appendChild(ratingText);

    var summary = document.createElement("p");
    summary.className = "review-summary";
    summary.textContent = String(item.quote).trim();

    article.appendChild(personRow);
    article.appendChild(rating);
    article.appendChild(summary);

    var href = String(item.url || "").trim();
    if (isPublicUrl(href)) {
      var link = document.createElement("a");
      link.className = "review-link";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ler avaliação no Google";
      var hint = document.createElement("span");
      hint.className = "sr-only";
      hint.textContent = " (abre em uma nova aba)";
      link.appendChild(hint);
      article.appendChild(link);
    }

    return article;
  }

  function renderReviewCarousel(quotes) {
    var wrap = document.createElement("div");
    wrap.className = "review-carousel";
    wrap.setAttribute("data-review-carousel", "");
    wrap.setAttribute("aria-roledescription", "carrossel");
    wrap.setAttribute("aria-label", "Avaliações no Google");

    var viewport = document.createElement("div");
    viewport.className = "review-viewport";
    var track = document.createElement("div");
    track.className = "review-track";
    quotes.forEach(function (node, index) {
      if (index > 0) {
        node.setAttribute("aria-hidden", "true");
        node.setAttribute("inert", "");
      }
      track.appendChild(node);
    });
    viewport.appendChild(track);
    wrap.appendChild(viewport);

    if (quotes.length < 2) return wrap;

    var controls = document.createElement("div");
    controls.className = "review-controls";

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "review-nav";
    prev.setAttribute("data-review-prev", "");
    prev.setAttribute("aria-label", "Avaliação anterior");
    prev.textContent = "‹";

    var dots = document.createElement("div");
    dots.className = "review-dots";
    dots.setAttribute("role", "group");
    dots.setAttribute("aria-label", "Escolher avaliação");
    quotes.forEach(function (node, index) {
      var name = node.querySelector(".review-name");
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "review-dot";
      dot.setAttribute("data-review-dot", String(index));
      if (index === 0) dot.setAttribute("aria-current", "true");
      var label = "Avaliação " + (index + 1) + " de " + quotes.length;
      if (name && name.textContent) label += ", " + name.textContent;
      dot.setAttribute("aria-label", label);
      dots.appendChild(dot);
    });

    var next = document.createElement("button");
    next.type = "button";
    next.className = "review-nav";
    next.setAttribute("data-review-next", "");
    next.setAttribute("aria-label", "Próxima avaliação");
    next.textContent = "›";

    controls.appendChild(prev);
    controls.appendChild(dots);
    controls.appendChild(next);
    wrap.appendChild(controls);
    return wrap;
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
      var hiddenFooterLink = document.querySelector('[data-footer="testimonials"]');
      if (hiddenFooterLink) hiddenFooterLink.hidden = true;
      list.replaceChildren();
      return;
    }

    var videos = [];
    var quotes = [];
    items.forEach(function (item) {
      if (isYouTubeId(item.youtube)) videos.push(renderYouTubeShort(item));
      else if (isSafeImagePath(String(item.video || "").trim())) videos.push(renderTestimonialVideo(item));
      else quotes.push(renderTestimonialQuote(item));
    });

    list.replaceChildren();
    var layout = document.createElement("div");
    layout.className = "testimonials-layout";
    if (videos.length && quotes.length) layout.classList.add("is-split");
    else if (videos.length) layout.classList.add("is-video-only");
    else layout.classList.add("is-quotes-only");

    if (videos.length) {
      var videoCol = document.createElement("div");
      videoCol.className = "testimonials-video";
      videos.forEach(function (node) { videoCol.appendChild(node); });
      layout.appendChild(videoCol);
    }
    if (quotes.length) {
      var quoteCol = document.createElement("div");
      quoteCol.className = "testimonials-quotes";
      quoteCol.appendChild(renderReviewCarousel(quotes));
      layout.appendChild(quoteCol);
    }
    list.appendChild(layout);

    section.hidden = false;
    if (navItem) navItem.hidden = false;
    var footerLink = document.querySelector('[data-footer="testimonials"]');
    if (footerLink) footerLink.hidden = false;
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

  function formatRegion(region) {
    var value = String(region || "").trim();
    if (/^curitiba\s*[-–—]\s*pr$/i.test(value)) return "Curitiba–PR";
    return value;
  }

  function renderEmail(email) {
    var value = String(email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
    ["contact-email", "footer-email-link"].forEach(function (id) {
      var anchor = document.getElementById(id);
      if (!anchor) return;
      anchor.href = "mailto:" + value;
      anchor.replaceChildren();
      var at = value.indexOf("@");
      var domain = at > 0 ? value.slice(at + 1) : "";
      var split = domain.indexOf(".com");
      if (at > 0 && split > 0) {
        anchor.appendChild(document.createTextNode(value.slice(0, at + 1)));
        anchor.appendChild(document.createElement("wbr"));
        anchor.appendChild(document.createTextNode(domain.slice(0, split)));
        anchor.appendChild(document.createElement("wbr"));
        anchor.appendChild(document.createTextNode(domain.slice(split)));
      } else {
        anchor.textContent = value;
      }
    });
  }

  function renderAddress(address) {
    var note = document.getElementById("address-note");
    var place = String(address || "").trim();
    if (!note || !place) return;

    var query = encodeURIComponent(place);
    var mapUrl = "https://www.google.com/maps/search/?api=1&query=" + query;

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
  }

  function renderContactMeta(source) {
    var data = source || {};
    var contact = data.contact || {};
    var region = formatRegion(data.region);
    renderEmail(contact.email);
    renderAddress(data.address);

    var footerRegion = document.getElementById("footer-region");
    if (footerRegion) {
      if (region) {
        footerRegion.hidden = false;
        footerRegion.textContent = region;
      } else {
        footerRegion.hidden = true;
      }
    }

    var footerSocial = document.getElementById("footer-social");
    if (!footerSocial) return;
    var links = (Array.isArray(data.social) ? data.social : []).filter(function (item) {
      return item && String(item.name || "").trim() && isPublicUrl(String(item.url || "").trim());
    });
    footerSocial.replaceChildren();
    var band = footerSocial.closest(".footer-social-band");
    if (!links.length) {
      footerSocial.hidden = true;
      if (band) band.hidden = true;
      return;
    }
    links.forEach(function (item) {
      var name = String(item.name).trim();
      var li = document.createElement("li");
      var anchor = document.createElement("a");
      anchor.href = String(item.url).trim();
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.setAttribute("aria-label", name + " (abre em uma nova aba)");
      var icon = socialIcon(name);
      if (icon) anchor.appendChild(icon);
      anchor.appendChild(document.createTextNode(name));
      li.appendChild(anchor);
      footerSocial.appendChild(li);
    });
    footerSocial.hidden = false;
  }

  window.RICO_CONTENT = {
    renderAbout: renderAbout,
    renderMedia: renderMedia,
    renderServices: renderServices,
    renderTestimonials: renderTestimonials,
    renderContactMeta: renderContactMeta,
  };
})();
