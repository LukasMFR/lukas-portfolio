(function () {
  "use strict";

  const dataByLanguage = {
    en: window.PORTFOLIO_DATA_EN,
    fr: window.PORTFOLIO_DATA_FR,
  };
  let data = dataByLanguage.en || dataByLanguage.fr;
  if (!data) return;

  const SECTION_IDS = ["home", "about", "skills", "projects", "contact"];
  const SUPPORTED_LANGUAGES = new Set(["en", "fr"]);
  const THEMES = new Set(["system", "light", "dark"]);
  const LANG_KEY = "lm-lang";
  const THEME_KEY = "lm-theme";

  const state = {
    language: "en",
    theme: "system",
    menuOpen: false,
    typewriterTimer: null,
    revealObserver: null,
    sectionObserver: null,
    scrollTicking: false,
    listenersReady: false,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    canHover: window.matchMedia("(hover: hover)").matches,
  };

  const elements = {
    header: document.getElementById("site-header"),
    home: document.getElementById("home"),
    about: document.getElementById("about"),
    skills: document.getElementById("skills"),
    projects: document.getElementById("projects"),
    contact: document.getElementById("contact"),
    footer: document.getElementById("site-footer"),
    skipLink: document.querySelector(".skip-link"),
  };

  const UI = {
    en: {
      mainNav: "Main navigation",
      langLabel: "Language",
      themeLabel: "Theme",
      themeSystem: "Match system theme",
      themeLight: "Light theme",
      themeDark: "Dark theme",
      open: "Open work",
      available: "Open to opportunities",
      connect: "Connect",
      skip: "Skip to content",
      builtWith: "Built from scratch with vanilla HTML, CSS and JavaScript.",
      highlights: "Highlights",
      developed: "What it developed",
    },
    fr: {
      mainNav: "Navigation principale",
      langLabel: "Langue",
      themeLabel: "Thème",
      themeSystem: "Suivre le thème du système",
      themeLight: "Thème clair",
      themeDark: "Thème sombre",
      open: "Voir les projets",
      available: "Ouvert aux opportunités",
      connect: "Réseaux",
      skip: "Aller au contenu",
      builtWith: "Conçu de zéro en HTML, CSS et JavaScript natifs.",
      highlights: "Points clés",
      developed: "Ce que cela a développé",
    },
  };

  function ui(key) {
    return (UI[state.language] || UI.en)[key];
  }

  /* ---- tech logo alias map ---- */
  const TECH_LOGO_ALIASES = {
    activedirectory: "windows11", adobepremierepro: "premierepro", allegro: "allegro",
    allegro44: "allegro", amadeus: "amadeus", apple: "apple", appletv: "apple",
    applevisionpro: "apple", applewatch: "apple", ansible: "ansible", apache: "apache",
    apparmor: "apparmor", bash: "bash", bs4: "beautifulsoup", beautifulsoup: "beautifulsoup",
    beautifulsoup4: "beautifulsoup", bootstrap5: "bootstrap", bitlocker: "windows11",
    burpsuite: "burpsuite", c: "c", censys: "censys", cis: "cisbenchmark",
    cisbenchmark: "cisbenchmark", cisbenchmarks: "cisbenchmark", cve: "cve", cvss: "cvss",
    chatgpt: "openai", cisco: "cisco", ciscoasa: "cisco", ciscocli: "cisco", ciscoios: "cisco",
    cplusplus: "cplusplus", css: "css3", css3: "css3", debian: "debian", debian12: "debian",
    docker: "docker", csv: "csv", dvwa: "dvwa", excel: "excel", ffmpeg: "ffmpeg",
    firebase: "firebase", firefox: "firefox", firefoxdevtools: "firefox", flask: "flask",
    gantt: "gantt", gns3: "gns3", grafana: "grafana", git: "git", github: "github",
    hydra: "hydra", html: "html5", html5: "html5", ipad: "apple", imagemagick: "imagemagick",
    iphone: "apple", java: "java", javascript: "javascript", jira: "jira",
    johntheripper: "johntheripper", json: "json", jsonwebtokens: "jsonwebtokens",
    jwt: "jsonwebtokens", kapwing: "kapwing", kalilinux: "kalilinux", keycloak: "keycloak",
    kerberos: "kerberos", leaflet: "leaflet", linux: "linux", lynis: "lynis", mac: "apple",
    macos: "apple", mariadb: "mariadb", matplotlib: "matplotlib", metasploit: "metasploit",
    mitre: "mitreattack", mitreattck: "mitreattack", mitreattack: "mitreattack",
    metasploitable2: "metasploit", midjourney: "midjourney", mysql: "mysql",
    mysqlworkbench: "mysql", netcat: "netcat", nmap: "nmap", nse: "nmap", nessus: "nessus",
    netacad: "cisco", nikto: "nikto", nominatim: "openstreetmap", nodedotjs: "nodejs",
    nodejs: "nodejs", npm: "nodejs", openai: "openai", owasp: "owasp", owasptop10: "owasp",
    owasptopten: "owasp", top10owasp: "owasp", openid: "openid", openidconnect: "openid",
    oidc: "openid", openldap: "openldap", openssh: "openssh", openssl: "openssl",
    openstreetmap: "openstreetmap", openvpn: "openvpn", openweather: "openweather",
    openweathermap: "openweather", pandas: "pandas", php: "php", php8: "php", png: "png",
    premiere: "premierepro", premierepro: "premierepro", powershell: "powershell",
    prometheus: "prometheus", promql: "prometheus", proxmox: "proxmox", python: "python",
    rapid: "rapidapi", rapidapi: "rapidapi", requests: "requests", rsync: "rsync",
    seaborn: "seaborn", selenium: "selenium", shell: "bash", shodan: "shodan",
    simplesamlphp: "simplesamlphp", sora: "openai", sql: "sql", ssh: "openssh", svg: "svg",
    swift: "swift", swiftui: "swift", terraform: "terraform", tuleap: "tuleap",
    typescript: "typescript", ubuntu: "ubuntu", unsplash: "unsplash", upscayl: "upscayl",
    visualstudiocode: "vscode", vscode: "vscode", vscodeextension: "vscode", vsce: "vscode",
    wappalyzer: "wappalyzer", whatweb: "whatweb", weevely: "weevely", wireshark: "wireshark",
    windows11: "windows11", windowsserver: "windows11", wsl: "windows11", xampp: "xampp",
    xml: "xml", yelp: "yelp", zabbix: "zabbix", packettracer: "cisco", networkdefense: "cisco",
    cyberthreatmanagement: "cisco", endpointsecurity: "cisco",
    juniorcybersecurityanalyst: "cisco", pythonfundamentalsfordatascience: "python",
  };

  /* ---------- helpers ---------- */
  function translate(value, language = state.language) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return value[language] ?? value.en ?? value.fr ?? "";
    return String(value);
  }
  function translateList(value) {
    const t = translate(value);
    return Array.isArray(t) ? t : [];
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function isExternal(href) {
    return /^https?:\/\//.test(href);
  }
  function linkAttrs(href) {
    return isExternal(href) ? 'target="_blank" rel="noreferrer noopener"' : "";
  }
  function normalizeLanguage(lang) {
    return SUPPORTED_LANGUAGES.has(lang) ? lang : "en";
  }
  function normalizeTechName(value) {
    return String(value).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/\+\+/g, "plusplus").replace(/#/g, "sharp").replace(/[^a-z0-9]+/g, "");
  }
  function iconAsset(name) {
    return `assets/images/icons/${name}.webp`;
  }
  function techLogoAsset(name) {
    return `assets/images/tech-logos/${name}.webp`;
  }
  function resolveTechLogo(value) {
    return TECH_LOGO_ALIASES[normalizeTechName(value)] || "";
  }

  function icon(name, opts = {}) {
    const { variant = "standard", label = "" } = opts;
    const cls = ["ico", variant !== "standard" ? `is-${variant}` : ""].filter(Boolean).join(" ");
    return `<span class="${cls}" data-icon="${name}" ${label ? "" : 'aria-hidden="true"'}>
      <img src="${iconAsset(name)}" alt="${label ? escapeHtml(label) : ""}" loading="lazy" decoding="async" />
    </span>`;
  }

  function techMark(value) {
    const slug = resolveTechLogo(value);
    if (!slug) return "";
    return `<span class="mark" aria-hidden="true"><img src="${techLogoAsset(slug)}" alt="" loading="lazy" decoding="async" /></span>`;
  }

  function chip(item, opts = {}) {
    const label = escapeHtml(translate(item));
    const mark = opts.withLogos ? techMark(translate(item)) : "";
    return `<span class="chip ${mark ? "has-mark" : ""}">${mark}<span>${label}</span></span>`;
  }

  function chips(items, opts = {}) {
    return `<div class="chips">${items.map((i) => chip(i, opts)).join("")}</div>`;
  }

  function bullets(items) {
    return `<ul class="bullets">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  }

  function techMarks(items, limit = 5) {
    const seen = new Set();
    const out = [];
    items.forEach((item) => {
      const slug = resolveTechLogo(translate(item));
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      out.push(techMark(translate(item)));
    });
    if (!out.length) return "";
    return `<div class="proj-marks">${out.slice(0, limit).join("")}</div>`;
  }

  function btn(href, label, opts = {}) {
    const variant = opts.variant || "secondary";
    const iconName = opts.icon || "arrow-up-right";
    const iconVariant = variant === "primary" ? "inverse" : "standard";
    const trailing = opts.trailing !== false;
    const inner = trailing
      ? `<span>${escapeHtml(translate(label))}</span><span class="btn-ico">${icon(iconName, { variant: iconVariant })}</span>`
      : `${icon(iconName, { variant: iconVariant })}<span>${escapeHtml(translate(label))}</span>`;
    return `<a class="btn btn-${variant}" href="${href}" ${linkAttrs(href)}>${inner}</a>`;
  }

  function linkBtn(link) {
    return btn(link.href, link.label, { variant: "ghost", icon: link.icon || "arrow-up-right", trailing: false });
  }

  function logoBox(image, cls) {
    if (!image) return "";
    return `<div class="${cls}"><img src="${image.src}" alt="${escapeHtml(translate(image.alt))}" loading="lazy" decoding="async" /></div>`;
  }

  /* ---------- theme glyphs (simple geometric) ---------- */
  function themeGlyph(kind) {
    const a = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
    if (kind === "light") {
      return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" ${a}/><g ${a}><path d="M12 2.5v2.2"/><path d="M12 19.3v2.2"/><path d="M4.6 4.6l1.6 1.6"/><path d="M17.8 17.8l1.6 1.6"/><path d="M2.5 12h2.2"/><path d="M19.3 12h2.2"/><path d="M4.6 19.4l1.6-1.6"/><path d="M17.8 6.2l1.6-1.6"/></g></svg>`;
    }
    if (kind === "dark") {
      return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2Z" ${a}/></svg>`;
    }
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" ${a}/><path d="M12 3.8a8.2 8.2 0 0 0 0 16.4Z" fill="currentColor" stroke="none"/></svg>`;
  }

  /* ---------- theme ---------- */
  function effectiveTheme() {
    if (state.theme === "light" || state.theme === "dark") return state.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function updateThemeColorMeta() {
    const color = effectiveTheme() === "dark" ? "#0a0e13" : "#f3f5f9";
    let meta = document.getElementById("active-theme-color");
    if (!meta) {
      meta = document.createElement("meta");
      meta.id = "active-theme-color";
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }

  function applyTheme(pref, persist = true) {
    state.theme = THEMES.has(pref) ? pref : "system";
    const root = document.documentElement;
    if (state.theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", state.theme);
    }
    root.setAttribute("data-theme-pref", state.theme);
    if (persist) {
      try {
        if (state.theme === "system") localStorage.removeItem(THEME_KEY);
        else localStorage.setItem(THEME_KEY, state.theme);
      } catch (e) { /* ignore */ }
    }
    updateThemeColorMeta();
    syncThemeButtons();
  }

  function syncThemeButtons() {
    document.querySelectorAll("[data-theme-set]").forEach((b) => {
      const active = b.getAttribute("data-theme-set") === state.theme;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function themeControl() {
    const opts = [
      { key: "system", glyph: "system", label: ui("themeSystem") },
      { key: "light", glyph: "light", label: ui("themeLight") },
      { key: "dark", glyph: "dark", label: ui("themeDark") },
    ];
    return `<div class="seg seg-theme" role="group" aria-label="${ui("themeLabel")}">
      ${opts.map((o) => `<button type="button" class="seg-btn ${state.theme === o.key ? "is-active" : ""}" data-theme-set="${o.key}" aria-pressed="${state.theme === o.key}" aria-label="${o.label}" title="${o.label}">${themeGlyph(o.glyph)}</button>`).join("")}
    </div>`;
  }

  function langControl() {
    return `<div class="seg seg-lang" role="group" aria-label="${ui("langLabel")}">
      ${["en", "fr"].map((l) => `<button type="button" class="seg-btn ${state.language === l ? "is-active" : ""}" data-lang-set="${l}" aria-pressed="${state.language === l}">${l.toUpperCase()}</button>`).join("")}
    </div>`;
  }

  /* ---------- header ---------- */
  function renderHeader() {
    const navLinks = data.navigation.links.map(
      (item) => `<li><a class="nav-link" href="${item.href}" data-section-link="${item.href.replace("#", "")}">${escapeHtml(translate(item.label))}</a></li>`
    ).join("");

    const mobileLinks = data.navigation.links.map(
      (item, i) => `<li><a class="mobile-link" href="${item.href}" data-mobile-link="${item.href.replace("#", "")}" style="animation-delay:${80 + i * 55}ms"><span>${escapeHtml(translate(item.label))}</span>${icon("arrow-up-right", { variant: "muted" })}</a></li>`
    ).join("");

    const cvLabel = escapeHtml(translate(data.navigation.cv));

    elements.header.innerHTML = `
      <div class="nav-shell glass">
        <a class="brand" href="#home" aria-label="${escapeHtml(data.person.name)}">
          <span class="brand-mark"><img src="${data.person.headerAnimoji.src}" alt="" loading="eager" decoding="async" /></span>
          <span class="brand-copy">
            <span class="brand-name">${escapeHtml(data.person.name)}</span>
            <span class="brand-tag">${escapeHtml(translate(data.navigation.brandSubtitle))}</span>
          </span>
        </a>

        <nav class="site-nav" aria-label="${ui("mainNav")}">
          <ul class="nav-links">${navLinks}</ul>
        </nav>

        <div class="nav-actions">
          <div class="desktop-only">${langControl()}</div>
          <div class="desktop-only">${themeControl()}</div>
          <a class="btn btn-secondary header-cv" href="${data.person.resumeHref}" target="_blank" rel="noreferrer noopener">
            ${icon("document")}<span>${cvLabel}</span>
          </a>
          <button class="icon-btn menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="${state.menuOpen}" aria-label="${escapeHtml(translate(state.menuOpen ? data.navigation.closeMenuLabel : data.navigation.mobileMenuLabel))}" data-menu-toggle>
            <span class="bars" aria-hidden="true"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>

      <div class="mobile-menu ${state.menuOpen ? "is-open" : ""}" id="mobile-menu" data-mobile-menu aria-hidden="${!state.menuOpen}">
        <ul class="mobile-nav">${mobileLinks}</ul>
        <div class="mobile-foot">
          ${langControl()}
          ${themeControl()}
          <a class="btn btn-primary" href="${data.person.resumeHref}" target="_blank" rel="noreferrer noopener"><span>${cvLabel}</span><span class="btn-ico">${icon("document", { variant: "inverse" })}</span></a>
        </div>
      </div>
    `;

    bindHeader();
    syncThemeButtons();
    updateHeaderScrolled();
  }

  /* ---------- hero ---------- */
  function renderHero() {
    const socials = data.person.socials.map(
      (s) => `<a class="social-dot" href="${s.href}" ${linkAttrs(s.href)} aria-label="${escapeHtml(s.title)}">${icon(s.icon, { variant: "social" })}</a>`
    ).join("");

    const stripStats = data.hero.stats.map(
      (s) => `<div class="hero-stat"><span class="v">${escapeHtml(s.value)}</span><span class="l">${escapeHtml(translate(s.label))}</span></div>`
    ).join("");

    elements.home.innerHTML = `
      <div class="container">
        <div class="hero-grid">
          <div class="hero-copy">
            <span class="hero-name-label">${escapeHtml(translate(data.navigation.brandSubtitle))}</span>
            <h1 class="hero-title" id="hero-name">${escapeHtml(data.person.name)}</h1>
            <p class="hero-role" aria-hidden="true">
              ${icon("shield", { variant: "accent" })}
              <span class="tw" id="tw-target"></span><span class="hero-cursor"></span>
            </p>
            <p class="sr-only">${escapeHtml(translate(data.hero.roles[0]))}.</p>
            <p class="hero-subtitle">${escapeHtml(translate(data.hero.subtitle))}</p>
            <div class="hero-actions">
              ${btn("#projects", data.hero.primaryCta, { variant: "primary", icon: "arrow-up-right" })}
              ${btn(data.person.resumeHref, data.hero.cvCta, { variant: "secondary", icon: "document", trailing: false })}
            </div>
            <div class="hero-socials" aria-label="${ui("connect")}">${socials}</div>
          </div>

          <div class="hero-visual">
            <div class="portrait-shell">
              <span class="portrait-tag"><span class="pulse"></span>${escapeHtml(ui("available"))}</span>
              <div class="portrait-frame">
                <img src="${data.person.profilePhoto.src}" alt="${escapeHtml(translate(data.person.profilePhoto.alt))}" loading="eager" decoding="async" />
              </div>
              <div class="animoji-badge">
                <img src="${data.person.animoji.src}" alt="" loading="lazy" decoding="async" />
                <span class="sr-only">${escapeHtml(translate(data.hero.animojiLabel))}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-strip reveal-item">${stripStats}</div>
      </div>
    `;
  }

  /* ---------- about ---------- */
  function renderTimelineItem(item) {
    const links = item.links?.length
      ? `<div class="tl-links">${item.links.map(linkBtn).join("")}</div>` : "";
    const hl = translateList(item.highlights);
    return `<li class="tl-item reveal-item">
      <article class="tl-card card">
        <div class="tl-head">
          ${logoBox(item.image, "tl-logo")}
          <div>
            <h4 class="tl-role">${escapeHtml(translate(item.role))}</h4>
            <div class="tl-meta">
              <span class="period">${escapeHtml(translate(item.period))}</span>
              <span>${escapeHtml(translate(item.organisation))}</span>
            </div>
          </div>
        </div>
        <p class="tl-summary">${escapeHtml(translate(item.summary))}</p>
        ${hl.length ? bullets(hl) : ""}
        ${links}
      </article>
    </li>`;
  }

  function renderAbout() {
    const paras = data.about.paragraphs.map(translate);
    const lead = translate(data.about.intro);
    const focus = data.about.focusPills.map(
      (f) => `<li>${icon("spark", { variant: "accent" })}<span>${escapeHtml(translate(f))}</span></li>`
    ).join("");

    elements.about.innerHTML = `
      <div class="container">
        <div class="section-head reveal-item">
          <span class="section-eyebrow">${escapeHtml(translate(data.about.kicker))}</span>
          <h2 class="section-title" id="about-title">${escapeHtml(translate(data.about.title))}</h2>
        </div>

        <div class="about-top">
          <article class="about-bio card reveal-item">
            <p class="lead">${escapeHtml(lead)}</p>
            ${paras.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
          </article>
          <aside class="about-focus card reveal-item">
            <h3>${state.language === "fr" ? "Domaines de prédilection" : "Where I focus"}</h3>
            <ul class="focus-list">${focus}</ul>
          </aside>
        </div>

        <div class="timeline-wrap">
          <section>
            <h3 class="tl-col-title reveal-item"><span class="tile-ico">${icon("graduation", { variant: "accent" })}</span>${escapeHtml(translate(data.about.educationTitle))}</h3>
            <ul class="timeline">${data.education.map(renderTimelineItem).join("")}</ul>
          </section>
          <section>
            <h3 class="tl-col-title reveal-item"><span class="tile-ico">${icon("briefcase", { variant: "accent" })}</span>${escapeHtml(translate(data.about.experienceTitle))}</h3>
            <ul class="timeline">${data.experiences.map(renderTimelineItem).join("")}</ul>
          </section>
        </div>
      </div>
    `;
  }

  /* ---------- skills ---------- */
  function renderSkills() {
    const spans = ["span-8 feature", "span-4", "span-4", "span-4", "span-4", "span-7 feature", "span-5"];
    const tiles = data.skills.categories.map((cat, i) => {
      const span = spans[i] || "span-4";
      const isWide = span.includes("span-12");
      const head = `<div class="skill-head"><span class="tile-ico">${icon(cat.icon, { variant: "accent" })}</span><h3 class="skill-title">${escapeHtml(translate(cat.title))}</h3></div>`;
      const copy = `<p class="skill-copy">${escapeHtml(translate(cat.copy))}</p>`;
      const tags = chips(cat.items, { withLogos: true });
      const inner = isWide
        ? `<div class="skill-inner"><div>${head}${copy}</div><div>${tags}</div></div>`
        : `${head}${copy}${tags}`;
      return `<article class="skill-tile card card-hover spot ${span} reveal-item" style="--reveal-delay:${i * 60}ms">${inner}</article>`;
    }).join("");

    const tools = data.skills.toolCloud
      .map((t) => `<span class="tool-chip">${techMark(t)}<span>${escapeHtml(t)}</span></span>`)
      .join("");

    elements.skills.innerHTML = `
      <div class="container">
        <div class="section-head reveal-item">
          <h2 class="section-title" id="skills-title">${escapeHtml(translate(data.skills.title))}</h2>
          <p class="section-intro">${escapeHtml(translate(data.skills.intro))}</p>
        </div>

        <div class="bento">${tiles}</div>

        <div class="tools reveal-item">
          <div class="tools-label">${escapeHtml(translate(data.skills.toolsLabel))}</div>
          <div class="marquee">
            <div class="marquee-track">${tools}${tools}</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------- work ---------- */
  function renderFeatured(project, index) {
    const isHero = index === 0;
    const overview = `<p class="proj-overview">${escapeHtml(translate(project.overview))}</p>`;
    const hl = translateList(project.highlights);
    const out = translateList(project.outcomes);
    const hlBlock = hl.length ? `<div><p class="proj-sub">${ui("highlights")}</p>${bullets(hl)}</div>` : "";
    const outBlock = out.length ? `<div><p class="proj-sub">${ui("developed")}</p>${bullets(out)}</div>` : "";
    const body = isHero
      ? `${overview}<div class="proj-body">${hlBlock}${outBlock}</div>${chips(project.technologies, { withLogos: true })}`
      : `${overview}${hlBlock}${outBlock}${chips(project.technologies, { withLogos: true })}`;

    return `<article class="proj card card-hover spot ${isHero ? "is-hero" : ""} reveal-item">
      <div class="proj-banner">
        <div class="proj-tagrow">
          <span class="proj-badge">${icon(project.icon, { variant: "accent" })}<span>${escapeHtml(project.year)}</span></span>
          ${techMarks(project.technologies, isHero ? 7 : 5)}
        </div>
        <div class="proj-headings">
          <h4 class="proj-title">${escapeHtml(translate(project.title))}</h4>
          <span class="proj-subtitle">${escapeHtml(translate(project.subtitle))}</span>
        </div>
      </div>
      ${body}
      <div class="proj-foot">${project.links.map(linkBtn).join("")}</div>
    </article>`;
  }

  function renderDisclosure(item, meta) {
    const focus = translateList(item.focus);
    const out = translateList(item.outcomes);
    const links = item.links?.length
      ? `<div class="proj-foot">${item.links.map(linkBtn).join("")}</div>` : "";
    return `<details class="disc reveal-item">
      <summary>
        <span class="disc-ico">${icon(item.icon, { variant: "accent" })}</span>
        <span class="disc-text">
          <span class="disc-title">${escapeHtml(translate(item.title))}</span>
          <span class="disc-meta">${escapeHtml(meta)}</span>
        </span>
        <span class="disc-plus" aria-hidden="true"></span>
      </summary>
      <div class="disc-body">
        <div class="detail-grid">
          <div class="detail-box"><div class="detail-label">${escapeHtml(translate(data.projects.contextLabel))}</div><p>${escapeHtml(translate(item.context))}</p></div>
          <div class="detail-box"><div class="detail-label">${escapeHtml(translate(data.projects.objectiveLabel))}</div><p>${escapeHtml(translate(item.objective))}</p></div>
        </div>
        ${focus.length ? `<div><p class="proj-sub">${escapeHtml(translate(data.projects.focusLabel))}</p>${bullets(focus)}</div>` : ""}
        <div><p class="proj-sub">${escapeHtml(translate(data.projects.techLabel))}</p>${chips(item.technologies, { withLogos: true })}</div>
        ${out.length ? `<div><p class="proj-sub">${escapeHtml(translate(data.projects.outcomeLabel))}</p>${bullets(out)}</div>` : ""}
        ${links}
      </div>
    </details>`;
  }

  function renderCert(item) {
    return `<article class="cert card card-hover reveal-item">
      <span class="tile-ico">${icon(item.icon, { variant: "accent" })}</span>
      <h4 class="cert-title">${escapeHtml(translate(item.title))}</h4>
      <p class="skill-copy">${escapeHtml(translate(item.copy))}</p>
      ${chips(item.tags, { withLogos: true })}
    </article>`;
  }

  function renderProjects() {
    const featured = data.featuredProjects.map(renderFeatured).join("");

    const academic = Object.entries(data.projects.groups).map(([key, group]) => {
      const items = data.academicWorks.filter((i) => i.group === key);
      if (!items.length) return "";
      return `<div class="group">
        <div class="group-head reveal-item">
          <h4 class="group-title"><span class="yr">${key.toUpperCase()}</span>${escapeHtml(translate(group.title))}</h4>
          <p class="group-copy">${escapeHtml(translate(group.copy))}</p>
        </div>
        <div class="acc">${items.map((i) => renderDisclosure(i, `${translate(i.level)} · ${translate(i.course)}`)).join("")}</div>
      </div>`;
    }).join("");

    const continuous = data.continuousLearning.map(renderCert).join("");

    const personal = Object.entries(data.projects.personalGroups).map(([key, group]) => {
      const items = data.personalProjects.filter((i) => i.group === key);
      if (!items.length) return "";
      return `<div class="group">
        <div class="group-head reveal-item">
          <h4 class="group-title">${escapeHtml(translate(group.title))}</h4>
          <p class="group-copy">${escapeHtml(translate(group.copy))}</p>
        </div>
        <div class="acc">${items.map((i) => renderDisclosure(i, translate(i.type))).join("")}</div>
      </div>`;
    }).join("");

    elements.projects.innerHTML = `
      <div class="container">
        <div class="section-head reveal-item">
          <h2 class="section-title" id="projects-title">${escapeHtml(translate(data.projects.title))}</h2>
          <p class="section-intro">${escapeHtml(translate(data.projects.intro))}</p>
        </div>

        <div class="work-block">
          <div class="block-head reveal-item">
            <div>
              <h3 class="block-title">${escapeHtml(translate(data.projects.featuredTitle))}</h3>
              <p class="block-copy">${escapeHtml(translate(data.projects.featuredIntro))}</p>
            </div>
            <span class="block-index">${String(data.featuredProjects.length).padStart(2, "0")} ${state.language === "fr" ? "projets" : "builds"}</span>
          </div>
          <div class="featured-grid">${featured}</div>
        </div>

        <div class="work-block">
          <div class="block-head reveal-item">
            <div>
              <h3 class="block-title">${escapeHtml(translate(data.projects.academicTitle))}</h3>
              <p class="block-copy">${escapeHtml(translate(data.projects.academicIntro))}</p>
            </div>
          </div>
          ${academic}
        </div>

        <div class="work-block">
          <div class="block-head reveal-item">
            <div>
              <h3 class="block-title">${escapeHtml(translate(data.projects.continuousTitle))}</h3>
              <p class="block-copy">${escapeHtml(translate(data.projects.continuousIntro))}</p>
            </div>
          </div>
          <div class="cert-grid">${continuous}</div>
        </div>

        <div class="work-block">
          <div class="block-head reveal-item">
            <div>
              <h3 class="block-title">${escapeHtml(translate(data.projects.personalTitle))}</h3>
              <p class="block-copy">${escapeHtml(translate(data.projects.personalIntro))}</p>
            </div>
          </div>
          ${personal}
        </div>
      </div>
    `;
  }

  /* ---------- contact ---------- */
  function renderContact() {
    const links = data.contact.cards.map(
      (card) => `<a class="contact-link" href="${card.href}" ${linkAttrs(card.href)}>
        <span class="lead-ico">${icon(card.icon, { variant: "accent" })}</span>
        <span class="cl-body">
          <span class="cl-title">${escapeHtml(card.title)}</span>
          <span class="cl-copy">${escapeHtml(translate(card.copy))}</span>
        </span>
        <span class="trail">${icon("arrow-up-right", { variant: "muted" })}</span>
      </a>`
    ).join("");

    elements.contact.innerHTML = `
      <div class="container">
        <div class="section-head reveal-item">
          <h2 class="section-title" id="contact-title">${escapeHtml(translate(data.contact.title))}</h2>
          <p class="section-intro">${escapeHtml(translate(data.contact.intro))}</p>
        </div>

        <div class="contact-grid">
          <article class="contact-cta card reveal-item">
            <h3>${escapeHtml(translate(data.contact.ctaTitle))}</h3>
            <p>${escapeHtml(translate(data.contact.ctaCopy))}</p>
            <div class="contact-actions">
              ${btn(`mailto:${data.person.email}`, data.contact.primaryCta, { variant: "primary", icon: "mail", trailing: false })}
              ${btn(data.person.resumeHref, data.contact.secondaryCta, { variant: "secondary", icon: "document", trailing: false })}
            </div>
          </article>
          <div class="contact-list reveal-item">${links}</div>
        </div>
      </div>
    `;
  }

  /* ---------- footer ---------- */
  function renderFooter() {
    const quickLinks = data.navigation.links.map(
      (item) => `<li><a href="${item.href}">${escapeHtml(translate(item.label))}</a></li>`
    ).join("");
    const socials = data.person.socials.map(
      (s) => `<li><a href="${s.href}" ${linkAttrs(s.href)}>${icon(s.icon, { variant: "muted" })}<span>${escapeHtml(s.title)}</span></a></li>`
    ).join("");
    const year = new Date().getFullYear();

    elements.footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="brand-name">${escapeHtml(data.person.name)}</div>
            <p class="footer-about">${escapeHtml(translate(data.footer.copy))}</p>
            <a class="footer-mail" href="mailto:${data.person.email}">${icon("mail", { variant: "muted" })}<span>${escapeHtml(data.person.email)}</span></a>
          </div>
          <div class="footer-col">
            <h4>${escapeHtml(translate(data.footer.quickLinksTitle))}</h4>
            <ul>${quickLinks}</ul>
          </div>
          <div class="footer-col">
            <h4>${escapeHtml(ui("connect"))}</h4>
            <ul>${socials}</ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-meta">
            <span>© ${year} ${escapeHtml(data.person.name)}</span>
            <span>${escapeHtml(translate(data.person.location))}</span>
          </div>
          <span>${escapeHtml(ui("builtWith"))}</span>
        </div>
      </div>
    `;
  }

  /* ---------- meta ---------- */
  function setMeta() {
    document.title = translate(data.meta.title);
    const set = (sel, attr, val) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    set('meta[name="description"]', "content", translate(data.meta.description));
    set('meta[property="og:title"]', "content", translate(data.meta.ogTitle));
    set('meta[property="og:description"]', "content", translate(data.meta.ogDescription));
    set('meta[property="og:locale"]', "content", translate(data.meta.locale));
    set('meta[name="twitter:title"]', "content", translate(data.meta.ogTitle));
    set('meta[name="twitter:description"]', "content", translate(data.meta.ogDescription));
    document.documentElement.lang = state.language;
    if (elements.skipLink) elements.skipLink.textContent = ui("skip");
  }

  /* ---------- render app ---------- */
  function renderApp() {
    setMeta();
    renderHeader();
    renderHero();
    renderAbout();
    renderSkills();
    renderProjects();
    renderContact();
    renderFooter();
    setupRevealObserver();
    setupSectionObserver();
    setupSpotlights();
    startTypewriter();
    applyActiveNav();
    updateHeaderScrolled();
    updateScrollProgress();
  }

  /* ---------- menu ---------- */
  function setMenuOpen(open) {
    state.menuOpen = Boolean(open);
    const toggle = elements.header.querySelector("[data-menu-toggle]");
    const menu = elements.header.querySelector("[data-mobile-menu]");
    if (toggle) {
      toggle.setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
      toggle.setAttribute("aria-label", translate(state.menuOpen ? data.navigation.closeMenuLabel : data.navigation.mobileMenuLabel));
    }
    if (menu) {
      menu.classList.toggle("is-open", state.menuOpen);
      menu.setAttribute("aria-hidden", state.menuOpen ? "false" : "true");
    }
    document.body.style.overflow = state.menuOpen ? "hidden" : "";
    if (state.menuOpen) {
      const first = menu && menu.querySelector(".mobile-link");
      if (first) window.requestAnimationFrame(() => first.focus());
    } else if (toggle) {
      toggle.focus();
    }
  }
  function closeMenu() {
    if (state.menuOpen) setMenuOpen(false);
  }

  function bindHeader() {
    elements.header.querySelectorAll("[data-lang-set]").forEach((b) =>
      b.addEventListener("click", () => applyLanguage(b.getAttribute("data-lang-set")))
    );
    elements.header.querySelectorAll("[data-theme-set]").forEach((b) =>
      b.addEventListener("click", () => applyTheme(b.getAttribute("data-theme-set")))
    );
    const toggle = elements.header.querySelector("[data-menu-toggle]");
    if (toggle) toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(!state.menuOpen);
    });
    elements.header.querySelectorAll("[data-mobile-link]").forEach((l) =>
      l.addEventListener("click", () => closeMenu())
    );
    elements.header.querySelectorAll('.nav-link[href^="#"]').forEach((l) =>
      l.addEventListener("click", () => closeMenu())
    );
  }

  /* ---------- scroll / nav state ---------- */
  function updateHeaderScrolled() {
    if (!elements.header) return;
    elements.header.classList.toggle("is-scrolled", window.scrollY > 16);
  }
  function updateScrollProgress() {
    const bar = document.querySelector(".scroll-progress span");
    if (!bar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  }
  function onScroll() {
    if (state.scrollTicking) return;
    state.scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateHeaderScrolled();
      updateScrollProgress();
      state.scrollTicking = false;
    });
  }

  function setupRevealObserver() {
    if (state.revealObserver) state.revealObserver.disconnect();
    const targets = document.querySelectorAll(".reveal-item");
    if (state.reduceMotion || typeof window.IntersectionObserver !== "function") {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }
    state.revealObserver = new window.IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    targets.forEach((t) => state.revealObserver.observe(t));
  }

  function setupSectionObserver() {
    if (state.sectionObserver) state.sectionObserver.disconnect();
    if (typeof window.IntersectionObserver !== "function") return;
    state.sectionObserver = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) applyActiveNav(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 });
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) state.sectionObserver.observe(el);
    });
  }

  function applyActiveNav(activeId) {
    const id = activeId || "home";
    elements.header.querySelectorAll("[data-section-link]").forEach((l) =>
      l.classList.toggle("is-active", l.dataset.sectionLink === id)
    );
  }

  /* ---------- spotlight ---------- */
  function setupSpotlights() {
    if (!state.canHover) return;
    document.querySelectorAll(".spot").forEach((el) => {
      if (el.dataset.spotBound) return;
      el.dataset.spotBound = "1";
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      });
    });
  }

  /* ---------- typewriter ---------- */
  function startTypewriter() {
    window.clearTimeout(state.typewriterTimer);
    const target = document.getElementById("tw-target");
    if (!target) return;
    const roles = data.hero.roles.map((r) => translate(r));
    if (!roles.length) return;
    if (state.reduceMotion) {
      target.textContent = roles[0];
      return;
    }
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    function step() {
      const role = roles[roleIndex];
      if (!deleting) {
        charIndex += 1;
        target.textContent = role.slice(0, charIndex);
        if (charIndex === role.length) {
          deleting = true;
          state.typewriterTimer = window.setTimeout(step, 1600);
          return;
        }
        state.typewriterTimer = window.setTimeout(step, 65);
        return;
      }
      charIndex -= 1;
      target.textContent = role.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        state.typewriterTimer = window.setTimeout(step, 260);
        return;
      }
      state.typewriterTimer = window.setTimeout(step, 32);
    }
    step();
  }

  /* ---------- language ---------- */
  function detectBrowserLanguage() {
    const nav = typeof navigator === "object" && navigator ? navigator : {};
    const langs = Array.isArray(nav.languages) && nav.languages.length ? nav.languages : [nav.language || "en"];
    return langs.some((l) => String(l).toLowerCase().startsWith("fr")) ? "fr" : "en";
  }
  function applyLanguage(lang, persist = true) {
    const next = normalizeLanguage(lang);
    state.language = next;
    data = dataByLanguage[next] || dataByLanguage.en || dataByLanguage.fr;
    if (persist) {
      try { localStorage.setItem(LANG_KEY, next); } catch (e) { /* ignore */ }
    }
    closeMenu();
    renderApp();
  }
  function initialLanguage() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (SUPPORTED_LANGUAGES.has(stored)) return stored;
    } catch (e) { /* ignore */ }
    return detectBrowserLanguage();
  }
  function initialTheme() {
    const pref = document.documentElement.getAttribute("data-theme-pref");
    return THEMES.has(pref) ? pref : "system";
  }

  /* ---------- global listeners ---------- */
  function setupGlobalListeners() {
    if (state.listenersReady) return;
    state.listenersReady = true;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionMq.addEventListener("change", (e) => {
      state.reduceMotion = e.matches;
      setupRevealObserver();
      startTypewriter();
    });

    const darkMq = window.matchMedia("(prefers-color-scheme: dark)");
    darkMq.addEventListener("change", () => {
      if (state.theme === "system") updateThemeColorMeta();
    });
  }

  /* ---------- init ---------- */
  function init() {
    setupGlobalListeners();
    applyTheme(initialTheme(), false);
    applyLanguage(initialLanguage(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
