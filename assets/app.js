(function () {
  const C = window.SITE_CONTENT;
  if (!C) return;

  const S = C.strings;
  const LABELS = {
    contact: S.contact,
    social: S.social,
    address: S.address,
    ig: S.ig,
    tg: S.tg,
    wa: S.wa,
    rubika: S.rubika,
    eitaa: S.eitaa,
    bale: S.bale,
  };

  document.title = "Persian Silver | " + S.brandFa;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute(
      "content",
      "Persian Silver - " + S.retail + ", " + S.wholesale + ", " + S.trade
    );
  }

  const logoImg = document.querySelector("#view-home img[src='logo.jpg']");
  if (logoImg) logoImg.alt = "Persian Silver - " + S.brandFa;

  document.querySelectorAll("[data-text]").forEach((el) => {
    const key = el.getAttribute("data-text");
    if (S[key]) el.textContent = S[key];
  });

  document.querySelectorAll("[data-aria]").forEach((el) => {
    const key = el.getAttribute("data-aria");
    if (S[key]) el.setAttribute("aria-label", S[key]);
  });

  Object.entries(C.pageTitles || {}).forEach(([page, title]) => {
    const h1 = document.querySelector("#view-" + page + " [data-page-title]");
    if (h1) h1.textContent = title;
    const section = document.getElementById("view-" + page);
    if (section) section.setAttribute("aria-label", title);
  });

  const VIEWS = {
    home: document.getElementById("view-home"),
    retail: document.getElementById("view-retail"),
    wholesale: document.getElementById("view-wholesale"),
    trade: document.getElementById("view-trade"),
  };

  function toTelDigits(p) {
    const fa = "\u06f0\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9";
    return p
      .replace(/[\u06f0-\u06f9]/g, (c) => String(fa.indexOf(c)))
      .replace(/[^\d+]/g, "");
  }

  function renderContact(key) {
    const data = C.contacts[key];
    const el = document.querySelector('[data-contact="' + key + '"]');
    if (!data || !el) return;
    const phoneRows = data.phones
      .map(
        (p) =>
          '<a href="tel:' +
          toTelDigits(p) +
          '" class="block text-brand-ink hover:text-brand-slate text-left font-medium tracking-wide" dir="ltr">' +
          p +
          "</a>"
      )
      .join("");
    const socialRows = data.social
      .map(
        (s) =>
          '<a href="' +
          s.href +
          '" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-3 py-2.5 px-3.5 rounded-xl bg-white/55 border border-brand-slate/15 hover:border-brand-slate/35 hover:bg-white/80 transition-colors group"><span class="text-brand-slate text-sm font-medium">' +
          LABELS[s.labelKey] +
          '</span><span class="text-brand-ink group-hover:text-brand-slate text-sm font-medium" dir="ltr">' +
          s.handle +
          "</span></a>"
      )
      .join("");
    el.innerHTML =
      '<div><h2 class="text-xs font-bold uppercase tracking-widest text-brand-slate mb-2.5">' +
      LABELS.contact +
      '</h2><div class="space-y-1.5">' +
      phoneRows +
      '</div></div><div><h2 class="text-xs font-bold uppercase tracking-widest text-brand-slate mb-2.5">' +
      LABELS.social +
      '</h2><div class="space-y-2">' +
      socialRows +
      "</div></div>" +
      (data.address
        ? '<div><h2 class="text-xs font-bold uppercase tracking-widest text-brand-slate mb-2.5">' +
          LABELS.address +
          '</h2><p class="text-brand-dark/90 text-sm leading-relaxed">' +
          data.address +
          "</p></div>"
        : "");
  }

  Object.keys(C.contacts).forEach(renderContact);

  let current = "home";
  let transitioning = false;
  let syncingHash = false;

  function clearHash() {
    const clean = location.pathname + location.search;
    syncingHash = true;
    history.replaceState(null, "", clean);
    syncingHash = false;
  }

  function setHash(name) {
    syncingHash = true;
    history.replaceState(null, "", "#" + name);
    syncingHash = false;
  }

  function showView(name) {
    if (transitioning || name === current || !VIEWS[name]) return;
    transitioning = true;

    const prev = VIEWS[current];
    const next = VIEWS[name];

    prev.classList.add("is-leaving");
    prev.classList.remove("is-active");

    setTimeout(function () {
      prev.hidden = true;
      prev.classList.remove("is-leaving");

      next.hidden = false;
      requestAnimationFrame(function () {
        next.classList.add("is-active");
        current = name;

        if (name === "home") {
          clearHash();
          next.classList.add("home-ready");
        } else {
          setHash(name);
        }

        transitioning = false;
      });
    }, 250);
  }

  document.querySelectorAll("[data-nav]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showView(link.dataset.nav);
    });
  });

  document.querySelectorAll("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      showView("home");
    });
  });

  function applyHashRoute() {
    if (syncingHash || transitioning) return;

    const hash = (location.hash || "").replace(/^#/, "");
    const target = hash && VIEWS[hash] && hash !== "home" ? hash : "home";
    if (target === current) return;
    showView(target);
  }

  window.addEventListener("hashchange", applyHashRoute);

  // Initial route from URL hash (e.g. open with #retail)
  (function initRoute() {
    const hash = (location.hash || "").replace(/^#/, "");
    if (hash && VIEWS[hash] && hash !== "home") {
      VIEWS.home.classList.remove("is-active");
      VIEWS.home.hidden = true;
      const next = VIEWS[hash];
      next.hidden = false;
      next.classList.add("is-active");
      current = hash;
    } else {
      clearHash();
      requestAnimationFrame(function () {
        VIEWS.home.classList.add("home-ready");
      });
    }
  })();

  // Music via enter-gate (user gesture = guaranteed play)
  (function initMusic() {
    const audio = document.getElementById("bg-music");
    const btn = document.getElementById("music-toggle");
    const gate = document.getElementById("enter-gate");
    const enterBtn = document.getElementById("enter-btn");
    const enterHint = document.getElementById("enter-hint");
    if (!audio || !btn || !gate) return;

    const VOLUME = 0.35;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = VOLUME;
    audio.muted = false;

    // ASCII-safe Persian labels
    const enterTitle = gate.querySelector(".enter-gate__title");
    if (enterTitle) {
      enterTitle.textContent =
        "\u0628\u0647 \u067e\u0631\u0634\u06cc\u0646 \u0633\u06cc\u0644\u0648\u0631 \u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f";
    }
    if (enterHint) {
      enterHint.textContent = "Persian Silver";
    }
    if (enterBtn) {
      enterBtn.textContent =
        "\u062f\u06cc\u062f\u0646 \u062e\u062f\u0645\u0627\u062a \u0648 \u0634\u0639\u0628\u0647\u200c\u0647\u0627";
    }

    let playing = false;

    function setPlayingUI(isPlaying) {
      playing = !!isPlaying;
      btn.classList.toggle("is-muted", !playing);
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      btn.setAttribute("aria-label", playing ? "Mute music" : "Play music");
      btn.title = playing ? "Mute" : "Play";
    }

    function playMusic() {
      audio.muted = false;
      audio.volume = VOLUME;
      try { audio.currentTime = 0; } catch (e) {}
      return audio.play().then(function () {
        setPlayingUI(true);
      }).catch(function () {
        setPlayingUI(false);
      });
    }

    function stopMusic() {
      audio.pause();
      setPlayingUI(false);
    }

    function enterSite(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      playMusic();
      gate.classList.add("is-gone");
      btn.classList.add("is-ready");
      window.setTimeout(function () {
        if (gate.parentNode) gate.parentNode.removeChild(gate);
      }, 500);
    }

    gate.addEventListener("click", enterSite);
    if (enterBtn) {
      enterBtn.addEventListener("click", enterSite);
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (playing && !audio.paused) {
        stopMusic();
      } else {
        playMusic();
      }
    });

    audio.addEventListener("play", function () { setPlayingUI(true); });
    audio.addEventListener("pause", function () { setPlayingUI(false); });
  })();
})();
