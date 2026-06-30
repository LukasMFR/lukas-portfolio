(function () {
  const dataByLanguage = {
    en: window.PORTFOLIO_DATA_EN,
    fr: window.PORTFOLIO_DATA_FR,
  };
  let data = dataByLanguage.en || dataByLanguage.fr;

  if (!data) {
    return;
  }

  const state = {
    language: "en",
    theme: "light",
    menuOpen: false,
    typewriterTimer: null,
    revealObserver: null,
    sectionObserver: null,
    globalListenersReady: false,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
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

  const SECTION_IDS = ["home", "about", "skills", "projects", "contact"];
  const SUPPORTED_LANGUAGES = new Set(["en", "fr"]);
  const HEADER_MENU_BREAKPOINT = 1100;
  const STORAGE_LANG = "lukas-portfolio-lang";
  const STORAGE_THEME = "lukas-portfolio-theme";

  const TECH_LOGO_ALIASES = {
    activedirectory: "windows11",
    adobepremierepro: "premierepro",
    allegro: "allegro",
    allegro44: "allegro",
    amadeus: "amadeus",
    apple: "apple",
    appletv: "apple",
    applevisionpro: "apple",
    applewatch: "apple",
    ansible: "ansible",
    apache: "apache",
    apparmor: "apparmor",
    bash: "bash",
    bs4: "beautifulsoup",
    beautifulsoup: "beautifulsoup",
    beautifulsoup4: "beautifulsoup",
    bootstrap5: "bootstrap",
    bitlocker: "windows11",
    burpsuite: "burpsuite",
    c: "c",
    censys: "censys",
    cis: "cisbenchmark",
    cisbenchmark: "cisbenchmark",
    cisbenchmarks: "cisbenchmark",
    cve: "cve",
    cvss: "cvss",
    chatgpt: "openai",
    cisco: "cisco",
    ciscoasa: "cisco",
    ciscocli: "cisco",
    ciscoios: "cisco",
    cplusplus: "cplusplus",
    css: "css3",
    css3: "css3",
    debian: "debian",
    debian12: "debian",
    docker: "docker",
    csv: "csv",
    dvwa: "dvwa",
    excel: "excel",
    ffmpeg: "ffmpeg",
    firebase: "firebase",
    firefox: "firefox",
    firefoxdevtools: "firefox",
    flask: "flask",
    gantt: "gantt",
    gns3: "gns3",
    grafana: "grafana",
    git: "git",
    github: "github",
    hydra: "hydra",
    html: "html5",
    html5: "html5",
    ipad: "apple",
    imagemagick: "imagemagick",
    iphone: "apple",
    java: "java",
    javascript: "javascript",
    jira: "jira",
    johntheripper: "johntheripper",
    json: "json",
    jsonwebtokens: "jsonwebtokens",
    jwt: "jsonwebtokens",
    kapwing: "kapwing",
    kalilinux: "kalilinux",
    keycloak: "keycloak",
    kerberos: "kerberos",
    leaflet: "leaflet",
    linux: "linux",
    lynis: "lynis",
    mac: "apple",
    macos: "apple",
    mariadb: "mariadb",
    matplotlib: "matplotlib",
    metasploit: "metasploit",
    mitre: "mitreattack",
    mitreattck: "mitreattack",
    mitreattack: "mitreattack",
    metasploitable2: "metasploit",
    midjourney: "midjourney",
    mysql: "mysql",
    mysqlworkbench: "mysql",
    netcat: "netcat",
    nmap: "nmap",
    nse: "nmap",
    nessus: "nessus",
    netacad: "cisco",
    nikto: "nikto",
    nominatim: "openstreetmap",
    nodedotjs: "nodejs",
    nodejs: "nodejs",
    npm: "nodejs",
    openai: "openai",
    owasp: "owasp",
    owasptop10: "owasp",
    owasptopten: "owasp",
    top10owasp: "owasp",
    openid: "openid",
    openidconnect: "openid",
    oidc: "openid",
    openldap: "openldap",
    openssh: "openssh",
    openssl: "openssl",
    openstreetmap: "openstreetmap",
    openvpn: "openvpn",
    openweather: "openweather",
    openweathermap: "openweather",
    pandas: "pandas",
    php: "php",
    php8: "php",
    png: "png",
    premiere: "premierepro",
    premierepro: "premierepro",
    powershell: "powershell",
    prometheus: "prometheus",
    promql: "prometheus",
    proxmox: "proxmox",
    python: "python",
    rapid: "rapidapi",
    rapidapi: "rapidapi",
    requests: "requests",
    rsync: "rsync",
    seaborn: "seaborn",
    selenium: "selenium",
    shell: "bash",
    shodan: "shodan",
    simplesamlphp: "simplesamlphp",
    sora: "openai",
    sql: "sql",
    ssh: "openssh",
    svg: "svg",
    swift: "swift",
    swiftui: "swift",
    terraform: "terraform",
    tuleap: "tuleap",
    typescript: "typescript",
    ubuntu: "ubuntu",
    unsplash: "unsplash",
    upscayl: "upscayl",
    visualstudiocode: "vscode",
    vscode: "vscode",
    vscodeextension: "vscode",
    vsce: "vscode",
    wappalyzer: "wappalyzer",
    whatweb: "whatweb",
    weevely: "weevely",
    wireshark: "wireshark",
    windows11: "windows11",
    windowsserver: "windows11",
    wsl: "windows11",
    xampp: "xampp",
    xml: "xml",
    yelp: "yelp",
    zabbix: "zabbix",
    packettracer: "cisco",
    networkdefense: "cisco",
    cyberthreatmanagement: "cisco",
    endpointsecurity: "cisco",
    juniorcybersecurityanalyst: "cisco",
    pythonfundamentalsfordatascience: "python",
  };

  /* ---------------------------------------------------------------- helpers */
  function translate(value, language = state.language) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
      return value[language] ?? value.en ?? value.fr ?? "";
    }
    return String(value);
  }

  function translateList(value) {
    const translated = translate(value);
    return Array.isArray(translated) ? translated : [];
  }

  function t(en, fr) {
    return state.language === "fr" ? fr : en;
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
    return String(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\+\+/g, "plusplus")
      .replace(/#/g, "sharp")
      .replace(/[^a-z0-9]+/g, "");
  }

  function closestFromTarget(target, selector) {
    const element =
      target && typeof target.closest === "function"
        ? target
        : target && target.parentElement && typeof target.parentElement.closest === "function"
          ? target.parentElement
          : null;
    return element ? element.closest(selector) : null;
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

  function icon(name, options = {}) {
    const { variant = "standard", className = "", decorative = true, label = "" } = options;
    const classes = ["icon-image", `is-${variant}`, className].filter(Boolean).join(" ");
    const alt = decorative ? "" : label;
    const ariaHidden = decorative ? 'aria-hidden="true"' : "";
    return `
      <span class="${classes}" data-icon-name="${name}" ${ariaHidden}>
        <img src="${iconAsset(name)}" alt="${alt}" loading="lazy" decoding="async" />
      </span>
    `;
  }

  function techLogoMarkup(value, options = {}) {
    const { className = "" } = options;
    const slug = resolveTechLogo(value);
    if (!slug) return "";
    const classes = ["tech-mark", className].filter(Boolean).join(" ");
    return `
      <span class="${classes}" aria-hidden="true">
        <img src="${techLogoAsset(slug)}" alt="" loading="lazy" decoding="async" />
      </span>
    `;
  }

  function logoMarkup(image) {
    if (!image) return "";
    return `
      <div class="timeline-logo">
        <img src="${image.src}" alt="${translate(image.alt)}" loading="lazy" decoding="async" />
      </div>
    `;
  }

  function buttonMarkup(link, variantClass = "button-secondary") {
    return `
      <a class="button ${variantClass}" href="${link.href}" ${linkAttrs(link.href)}>
        <span>${translate(link.label)}</span>
        <span class="btn-icon">${icon(link.icon || "arrow-up-right")}</span>
      </a>
    `;
  }

  function renderChip(item, itemClass, options = {}) {
    const label = translate(item);
    const techLogo = options.withTechLogos ? techLogoMarkup(label) : "";
    const classes = [itemClass, techLogo ? "has-tech-logo" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}">${techLogo}<span class="chip-label">${label}</span></span>`;
  }

  function pillList(items, className, itemClass, options = {}) {
    return `<div class="${className}">${items.map((item) => renderChip(item, itemClass, options)).join("")}</div>`;
  }

  function techLogoStrip(items, options = {}) {
    const { className = "project-tech-strip", limit = 6 } = options;
    const logos = [];
    const seen = new Set();
    items.forEach((item) => {
      const label = translate(item);
      const slug = resolveTechLogo(label);
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      logos.push(label);
    });
    if (!logos.length) return "";
    return `
      <div class="${className}" aria-hidden="true">
        ${logos.slice(0, limit).map((item) => techLogoMarkup(item, { className: "project-tech-mark" })).join("")}
      </div>
    `;
  }

  function collectMarqueeLogos(limit = 24) {
    const labels = [];
    (data.skills.categories || []).forEach((cat) => {
      (cat.items || []).forEach((item) => labels.push(translate(item)));
    });
    (data.skills.toolCloud || []).forEach((item) => labels.push(translate(item)));

    const seen = new Set();
    const logos = [];
    labels.forEach((label) => {
      const slug = resolveTechLogo(label);
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      logos.push(slug);
    });
    return logos.slice(0, limit);
  }

  /* --------------------------------------------------------------- controls */
  function themeIcons() {
    return `
      <span class="sun" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/></svg>
      </span>
      <span class="moon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/></svg>
      </span>
    `;
  }

  function renderThemeToggle() {
    return `
      <button class="icon-toggle theme-toggle" type="button" data-theme-toggle
        aria-label="${t("Switch colour theme", "Changer de thème")}">
        ${themeIcons()}
      </button>
    `;
  }

  function renderLanguageSwitch() {
    return `
      <div class="language-switch" aria-label="${t("Language switch", "Sélecteur de langue")}">
        <button class="language-button ${state.language === "en" ? "is-active" : ""}" type="button"
          aria-pressed="${state.language === "en"}" data-lang-switch="en">EN</button>
        <button class="language-button ${state.language === "fr" ? "is-active" : ""}" type="button"
          aria-pressed="${state.language === "fr"}" data-lang-switch="fr">FR</button>
      </div>
    `;
  }

  /* ----------------------------------------------------------------- header */
  function renderHeader() {
    const navLinks = data.navigation.links
      .map(
        (item) =>
          `<li><a class="nav-link" href="${item.href}" data-section-link="${item.href.replace("#", "")}">${translate(item.label)}</a></li>`
      )
      .join("");

    const mobileNavLinks = data.navigation.links
      .map(
        (item) => `
          <li>
            <a class="mobile-nav-link" href="${item.href}" data-mobile-link="${item.href.replace("#", "")}">
              <span>${translate(item.label)}</span>
              ${icon("arrow-up-right", { variant: "muted" })}
            </a>
          </li>
        `
      )
      .join("");

    const cvLink = { href: data.person.resumeHref, label: data.navigation.cv, icon: "document" };

    elements.header.innerHTML = `
      <div class="nav-shell">
        <a class="brand" href="#home" aria-label="${data.person.name}">
          <span class="brand-mark" aria-hidden="true">
            <img src="${data.person.headerAnimoji.src}" alt="" loading="eager" decoding="async" />
          </span>
          <span class="brand-copy">
            <span class="brand-title">${data.person.name}</span>
            <span class="brand-subtitle">${translate(data.navigation.brandSubtitle)}</span>
          </span>
        </a>

        <nav class="site-nav" aria-label="${t("Main navigation", "Navigation principale")}">
          <ul class="nav-links">${navLinks}</ul>
        </nav>

        <div class="header-actions">
          ${renderThemeToggle()}
          <span class="header-lang">${renderLanguageSwitch()}</span>
          <a class="button button-secondary header-cv" href="${cvLink.href}" target="_blank" rel="noreferrer noopener">
            <span>${translate(cvLink.label)}</span>
            <span class="btn-icon">${icon("document")}</span>
          </a>
          <button class="icon-toggle menu-toggle" type="button" aria-controls="mobile-menu"
            aria-expanded="${state.menuOpen}" aria-label="${getMenuLabel()}" data-menu-toggle>
            <span class="burger" aria-hidden="true"><span></span><span></span><span></span></span>
          </button>
        </div>
      </div>

      <div class="mobile-menu ${state.menuOpen ? "is-open" : ""}" id="mobile-menu"
        aria-hidden="${!state.menuOpen}" data-mobile-menu>
        <ul class="mobile-nav-links">${mobileNavLinks}</ul>
        <div class="mobile-actions">
          ${renderThemeToggle()}
          ${renderLanguageSwitch()}
          ${buttonMarkup(cvLink, "button-secondary")}
        </div>
      </div>
    `;

    updateHeaderScrolledState();
    bindHeaderInteractions();
    syncMenuState();
  }

  /* ------------------------------------------------------------------- hero */
  function renderHero() {
    const socials = data.person.socials
      .map(
        (item) => `
          <a class="social-chip" href="${item.href}" ${linkAttrs(item.href)} aria-label="${item.title}">
            ${icon(item.icon, { variant: "social" })}
            <span>${item.title}</span>
          </a>
        `
      )
      .join("");

    const ctas = [
      buttonMarkup({ href: "#projects", label: data.hero.primaryCta, icon: "arrow-up-right" }, "button-primary"),
      buttonMarkup({ href: data.person.resumeHref, label: data.hero.cvCta, icon: "document" }, "button-secondary"),
    ].join("");

    const stats = data.hero.stats
      .map(
        (item) => `
          <article class="stat-card">
            <div class="stat-value">${item.value}</div>
            <div class="stat-label">${translate(item.label)}</div>
          </article>
        `
      )
      .join("");

    const nameParts = String(data.person.name).trim().split(/\s+/);
    const firstName = nameParts.shift();
    const surname = nameParts.join(" ");

    const marqueeLogos = collectMarqueeLogos();
    const marqueeSet = marqueeLogos
      .map((slug) => `<span class="tech-mark" aria-hidden="true"><img src="${techLogoAsset(slug)}" alt="" loading="lazy" decoding="async" /></span>`)
      .join("");

    elements.home.innerHTML = `
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="hero-availability">
            <span class="status-dot"></span>
            <span>${translate(data.hero.availability)}</span>
          </div>
          <h1 class="hero-title">${firstName}${surname ? `<span class="hero-surname">${surname}</span>` : ""}</h1>
          <p class="hero-lead">
            <span class="typewriter-text" id="typewriter-target"></span><span class="typewriter-cursor" aria-hidden="true"></span>
          </p>
          <p class="hero-description">${translate(data.hero.description)}</p>
          <div class="hero-actions">${ctas}</div>
          <div class="hero-socials">${socials}</div>
        </div>

        <div class="hero-visual">
          <div class="portrait-card">
            <div class="portrait-image-shell">
              <img src="${data.person.profilePhoto.src}" alt="${translate(data.person.profilePhoto.alt)}" decoding="async" />
            </div>
          </div>
          <div class="animoji-badge">
            <img src="${data.person.animoji.src}" alt="" loading="lazy" decoding="async" />
            <span class="sr-only">${translate(data.hero.animojiLabel)}</span>
          </div>
        </div>
      </div>

      <div class="hero-stats reveal" data-stagger>${stats}</div>

      <div class="tech-marquee" aria-hidden="true">
        <div class="tech-marquee-track">${marqueeSet}${marqueeSet}</div>
      </div>
    `;
  }

  /* ------------------------------------------------------------ section head */
  function sectionHeading(titleValue, introValue) {
    return `
      <div class="section-heading reveal">
        <h2 class="section-title">${translate(titleValue)}</h2>
        ${introValue ? `<p class="section-intro">${translate(introValue)}</p>` : ""}
      </div>
    `;
  }

  /* ------------------------------------------------------------------ about */
  function renderTimelineItem(item) {
    const highlights = translateList(item.highlights).map((point) => `<li>${point}</li>`).join("");
    const linkBlock = item.links?.length
      ? `<div class="project-links">${item.links.map((link) => buttonMarkup(link, "button-ghost")).join("")}</div>`
      : "";

    return `
      <li class="timeline-item">
        <article class="timeline-card">
          <div class="timeline-title-row">
            ${logoMarkup(item.image)}
            <div>
              <h3 class="timeline-role">${translate(item.role)}</h3>
              <div class="timeline-meta">
                <span>${translate(item.organisation)}</span>
                <span>${translate(item.period)}</span>
              </div>
            </div>
          </div>
          <p class="timeline-summary">${translate(item.summary)}</p>
          <ul class="timeline-listing">${highlights}</ul>
          ${linkBlock}
        </article>
      </li>
    `;
  }

  function renderAbout() {
    const aboutParagraphs = data.about.paragraphs.map((item) => `<p>${translate(item)}</p>`).join("");
    const focusPills = data.about.focusPills.map((item) => translate(item));

    elements.about.innerHTML = `
      <div class="section-shell">
        ${sectionHeading(data.about.title, data.about.intro)}
        <div class="about-grid">
          <article class="about-card reveal">
            ${aboutParagraphs}
            ${pillList(focusPills, "pill-list", "pill")}
          </article>
          <div class="timeline-grid">
            <section class="timeline-column reveal">
              <h3 class="timeline-title">${icon("graduation", { variant: "accent" })}<span>${translate(data.about.educationTitle)}</span></h3>
              <ul class="timeline-list">${data.education.map(renderTimelineItem).join("")}</ul>
            </section>
            <section class="timeline-column reveal">
              <h3 class="timeline-title">${icon("briefcase", { variant: "accent" })}<span>${translate(data.about.experienceTitle)}</span></h3>
              <ul class="timeline-list">${data.experiences.map(renderTimelineItem).join("")}</ul>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------------- skills */
  function renderSkills() {
    const skillCards = data.skills.categories
      .map(
        (category) => `
          <article class="skill-card">
            <div class="skill-card-header">
              <div class="skill-icon">${icon(category.icon, { variant: "accent" })}</div>
              <h3 class="skill-title">${translate(category.title)}</h3>
            </div>
            <p class="skill-copy">${translate(category.copy)}</p>
            ${pillList(category.items, "tech-list", "tech-pill", { withTechLogos: true })}
          </article>
        `
      )
      .join("");

    const toolCloud = pillList(data.skills.toolCloud, "tool-cloud", "tool-chip", { withTechLogos: true });

    elements.skills.innerHTML = `
      <div class="section-shell">
        ${sectionHeading(data.skills.title, data.skills.intro)}
        <div class="skills-grid reveal" data-stagger>${skillCards}</div>
        <div class="skills-tools reveal">
          <h3 class="timeline-title">${icon("spark", { variant: "accent" })}<span>${translate(data.skills.toolsLabel)}</span></h3>
          ${toolCloud}
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------- projects */
  function renderFeaturedProject(project) {
    const highlights = translateList(project.highlights).map((point) => `<li>${point}</li>`).join("");
    const outcomes = translateList(project.outcomes).map((point) => `<li>${point}</li>`).join("");

    return `
      <article class="project-card">
        <div class="project-media">
          <div class="project-badge">${icon(project.icon, { variant: "accent" })}<span>${project.year}</span></div>
          <div class="project-media-copy">
            <h3 class="project-title">${translate(project.title)}</h3>
            <p class="project-subtitle">${translate(project.subtitle)}</p>
          </div>
          ${techLogoStrip(project.technologies)}
        </div>
        <div class="project-body">
          <p class="project-copy">${translate(project.overview)}</p>
          <ul class="project-list">${highlights}</ul>
          ${pillList(project.technologies, "tech-list", "tech-pill", { withTechLogos: true })}
          <ul class="project-list">${outcomes}</ul>
          <div class="project-links">${project.links.map((link) => buttonMarkup(link, "button-ghost")).join("")}</div>
        </div>
      </article>
    `;
  }

  function renderDisclosure(item, meta) {
    const focus = translateList(item.focus).map((entry) => `<li>${entry}</li>`).join("");
    const outcomes = translateList(item.outcomes).map((entry) => `<li>${entry}</li>`).join("");
    const links = item.links?.length
      ? `<div class="project-links">${item.links.map((link) => buttonMarkup(link, "button-ghost")).join("")}</div>`
      : "";

    return `
      <details class="disclosure">
        <summary>
          <div class="disclosure-icon">${icon(item.icon, { variant: "accent" })}</div>
          <div class="disclosure-text">
            <h4 class="disclosure-title">${translate(item.title)}</h4>
            <div class="disclosure-meta">${meta}</div>
          </div>
          <span class="disclosure-chevron" aria-hidden="true"></span>
        </summary>
        <div class="disclosure-body">
          <div class="detail-grid">
            <div class="detail-block">
              <h5 class="detail-title">${translate(data.projects.contextLabel)}</h5>
              <p class="detail-copy">${translate(item.context)}</p>
            </div>
            <div class="detail-block">
              <h5 class="detail-title">${translate(data.projects.objectiveLabel)}</h5>
              <p class="detail-copy">${translate(item.objective)}</p>
            </div>
            <div class="detail-block">
              <h5 class="detail-title">${translate(data.projects.focusLabel)}</h5>
              <ul class="detail-list">${focus}</ul>
            </div>
            <div class="detail-block">
              <h5 class="detail-title">${translate(data.projects.outcomeLabel)}</h5>
              <ul class="detail-list">${outcomes}</ul>
            </div>
          </div>
          <div class="detail-block">
            <h5 class="detail-title">${translate(data.projects.techLabel)}</h5>
            ${pillList(item.technologies, "tech-list", "tech-pill", { withTechLogos: true })}
          </div>
          ${links}
        </div>
      </details>
    `;
  }

  function renderAcademicWork(item) {
    return renderDisclosure(item, `${translate(item.level)} · ${translate(item.course)}`);
  }

  function renderPersonalProject(item) {
    return renderDisclosure(item, translate(item.type));
  }

  function renderContinuousLearningCard(item) {
    return `
      <article class="cert-card">
        <div class="skill-card-header">
          <div class="skill-icon">${icon(item.icon, { variant: "accent" })}</div>
          <h3 class="cert-title">${translate(item.title)}</h3>
        </div>
        <p class="skill-copy">${translate(item.copy)}</p>
        ${pillList(item.tags, "tech-list", "tech-pill", { withTechLogos: true })}
      </article>
    `;
  }

  function renderProjects() {
    const featured = data.featuredProjects.map(renderFeaturedProject).join("");

    const groupedAcademic = Object.entries(data.projects.groups)
      .map(([groupKey, group]) => {
        const items = data.academicWorks.filter((item) => item.group === groupKey);
        if (!items.length) return "";
        return `
          <div class="work-subgroup reveal">
            <div class="work-subgroup-header">
              <h4 class="work-subgroup-title">${translate(group.title)}</h4>
              <p class="work-subgroup-copy">${translate(group.copy)}</p>
            </div>
            <div class="disclosure-grid">${items.map(renderAcademicWork).join("")}</div>
          </div>
        `;
      })
      .join("");

    const continuous = data.continuousLearning.map(renderContinuousLearningCard).join("");

    const groupedPersonal = Object.entries(data.projects.personalGroups)
      .map(([groupKey, group]) => {
        const items = data.personalProjects.filter((item) => item.group === groupKey);
        if (!items.length) return "";
        return `
          <div class="work-subgroup reveal">
            <div class="work-subgroup-header">
              <h4 class="work-subgroup-title">${translate(group.title)}</h4>
              <p class="work-subgroup-copy">${translate(group.copy)}</p>
            </div>
            <div class="disclosure-grid">${items.map(renderPersonalProject).join("")}</div>
          </div>
        `;
      })
      .join("");

    elements.projects.innerHTML = `
      <div class="section-shell">
        ${sectionHeading(data.projects.title, data.projects.intro)}
        <div class="project-stack">
          <section>
            <div class="work-group-header reveal">
              <h3 class="work-group-title work-group-title-strong">${translate(data.projects.featuredTitle)}</h3>
              <p class="work-group-copy">${translate(data.projects.featuredIntro)}</p>
            </div>
            <div class="featured-grid">${featured}</div>
          </section>

          <section>
            <div class="work-group-header reveal">
              <h3 class="work-group-title work-group-title-strong">${translate(data.projects.academicTitle)}</h3>
              <p class="work-group-copy">${translate(data.projects.academicIntro)}</p>
            </div>
            ${groupedAcademic}
          </section>

          <section>
            <div class="work-group-header reveal">
              <h3 class="work-group-title work-group-title-strong">${translate(data.projects.continuousTitle)}</h3>
              <p class="work-group-copy">${translate(data.projects.continuousIntro)}</p>
            </div>
            <div class="cert-grid reveal" data-stagger>${continuous}</div>
          </section>

          <section>
            <div class="work-group-header reveal">
              <h3 class="work-group-title work-group-title-strong">${translate(data.projects.personalTitle)}</h3>
              <p class="work-group-copy">${translate(data.projects.personalIntro)}</p>
            </div>
            ${groupedPersonal}
          </section>
        </div>
      </div>
    `;
  }

  /* ---------------------------------------------------------------- contact */
  function renderContact() {
    const contactLinks = data.contact.cards
      .map(
        (card) => `
          <a class="contact-link" href="${card.href}" ${linkAttrs(card.href)}>
            <span class="contact-link-main">
              <span class="skill-icon">${icon(card.icon, { variant: "accent" })}</span>
              <span>
                <span class="contact-link-title">${card.title}</span>
                <span class="contact-link-copy">${translate(card.copy)}</span>
              </span>
            </span>
            ${icon("arrow-up-right", { variant: "muted" })}
          </a>
        `
      )
      .join("");

    elements.contact.innerHTML = `
      <div class="section-shell">
        ${sectionHeading(data.contact.title, data.contact.intro)}
        <div class="contact-grid">
          <article class="contact-card is-primary reveal">
            <h3 class="contact-card-title">${translate(data.contact.ctaTitle)}</h3>
            <p class="contact-copy">${translate(data.contact.ctaCopy)}</p>
            <div class="contact-actions">
              <a class="button button-primary" href="mailto:${data.person.email}">
                <span>${translate(data.contact.primaryCta)}</span>
                <span class="btn-icon">${icon("mail")}</span>
              </a>
              <a class="button button-secondary" href="${data.person.resumeHref}" target="_blank" rel="noreferrer noopener">
                <span>${translate(data.contact.secondaryCta)}</span>
                <span class="btn-icon">${icon("document")}</span>
              </a>
            </div>
          </article>
          <aside class="contact-card reveal">
            <div class="contact-links">${contactLinks}</div>
          </aside>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------------- footer */
  function renderFooter() {
    const quickLinks = data.navigation.links
      .map((item) => `<a class="social-chip" href="${item.href}">${translate(item.label)}</a>`)
      .join("");

    const socialLinks = data.person.socials
      .map(
        (item) => `
          <a class="social-chip" href="${item.href}" ${linkAttrs(item.href)}>
            ${icon(item.icon, { variant: "social" })}
            <span>${item.title}</span>
          </a>
        `
      )
      .join("");

    const year = new Date().getFullYear();

    elements.footer.innerHTML = `
      <div class="footer-shell reveal">
        <div class="footer-top">
          <div>
            <div class="footer-brand-title">${data.person.name}</div>
            <p class="footer-copy">${translate(data.footer.copy)}</p>
          </div>
          <a class="button button-primary" href="mailto:${data.person.email}">
            <span>${translate(data.footer.contactLabel)}</span>
            <span class="btn-icon">${icon("mail")}</span>
          </a>
        </div>
        <div class="footer-links">${quickLinks}</div>
        <div class="footer-links">${socialLinks}</div>
        <div class="footer-meta">
          <span>© ${year} ${data.person.name}</span>
          <span>${translate(data.footer.rights)}</span>
          <span>${icon("globe", { variant: "muted" })}${translate(data.person.location)}</span>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------- meta */
  function setMeta() {
    document.title = translate(data.meta.title);
    const set = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    set('meta[name="description"]', "content", translate(data.meta.description));
    set('meta[property="og:title"]', "content", translate(data.meta.ogTitle));
    set('meta[property="og:description"]', "content", translate(data.meta.ogDescription));
    set('meta[property="og:locale"]', "content", translate(data.meta.locale));
    set('meta[property="og:image"]', "content", data.person.profilePhoto.src);

    document.documentElement.lang = state.language;
    document.documentElement.setAttribute("data-language", state.language);
    if (elements.skipLink) {
      elements.skipLink.textContent = t("Skip to content", "Aller au contenu");
    }
  }

  /* ----------------------------------------------------------------- render */
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
    setupMagnetic();
    startTypewriter();
  }

  /* -------------------------------------------------------------- menu/state */
  function getMenuLabel() {
    const key = state.menuOpen ? "closeMenuLabel" : "mobileMenuLabel";
    return translate(data.navigation[key]);
  }

  function closeMenu() {
    if (!state.menuOpen) return;
    setMenuOpen(false);
  }

  function setMenuOpen(nextOpen) {
    state.menuOpen = Boolean(nextOpen);
    document.body.style.overflow = state.menuOpen ? "hidden" : "";
    syncMenuState();
    applyActiveNav();
  }

  function syncMenuState() {
    if (!elements.header) return;
    const menuToggle = elements.header.querySelector("[data-menu-toggle]");
    const mobileMenu = elements.header.querySelector("[data-mobile-menu]");
    elements.header.classList.toggle("is-menu-open", state.menuOpen);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
      menuToggle.setAttribute("aria-label", getMenuLabel());
    }
    if (mobileMenu) {
      mobileMenu.classList.toggle("is-open", state.menuOpen);
      mobileMenu.setAttribute("aria-hidden", state.menuOpen ? "false" : "true");
    }
  }

  function bindHeaderInteractions() {
    if (!elements.header) return;

    elements.header.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.getAttribute("data-lang-switch")));
    });

    elements.header.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => toggleTheme());
    });

    const menuToggle = elements.header.querySelector("[data-menu-toggle]");
    if (menuToggle) {
      menuToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuOpen(!state.menuOpen);
      });
    }

    elements.header.querySelectorAll("[data-mobile-link]").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });
  }

  /* ---------------------------------------------------------------- theme */
  function applyTheme(theme, persist) {
    state.theme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", state.theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_THEME, state.theme);
      } catch (error) {
        /* storage unavailable */
      }
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === "dark" ? "light" : "dark", true);
    elements.header.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-label", t("Switch colour theme", "Changer de thème"));
    });
  }

  function detectInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_THEME);
      if (saved === "light" || saved === "dark") return saved;
    } catch (error) {
      /* ignore */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /* ------------------------------------------------------- global listeners */
  function setupGlobalListeners() {
    if (state.globalListenersReady) return;

    window.addEventListener(
      "scroll",
      () => {
        updateHeaderScrolledState();
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      if (window.innerWidth > HEADER_MENU_BREAKPOINT) closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (state.menuOpen && !closestFromTarget(event.target, "#site-header")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeQuery.addEventListener("change", (event) => {
      let hasSaved = false;
      try {
        hasSaved = Boolean(localStorage.getItem(STORAGE_THEME));
      } catch (error) {
        /* ignore */
      }
      if (!hasSaved) applyTheme(event.matches ? "dark" : "light", false);
    });

    state.globalListenersReady = true;
  }

  function updateHeaderScrolledState() {
    if (!elements.header) return;
    elements.header.classList.toggle("is-scrolled", window.scrollY > 16);
  }

  /* ------------------------------------------------------------ reveal/obs */
  function setupRevealObserver() {
    if (state.revealObserver) state.revealObserver.disconnect();

    const targets = document.querySelectorAll(".reveal");
    if (state.reduceMotion || typeof window.IntersectionObserver !== "function") {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    state.revealObserver = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            state.revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((el) => state.revealObserver.observe(el));
  }

  function setupSectionObserver() {
    if (state.sectionObserver) state.sectionObserver.disconnect();

    state.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) applyActiveNav(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
    );

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) state.sectionObserver.observe(element);
    });

    applyActiveNav();
  }

  function applyActiveNav(activeId) {
    const fallbackId = activeId || getCurrentSectionId();
    elements.header.querySelectorAll("[data-section-link]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.sectionLink === fallbackId);
    });
  }

  function getCurrentSectionId() {
    const threshold = window.scrollY + window.innerHeight * 0.35;
    let current = "home";
    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element && element.offsetTop <= threshold) current = id;
    });
    return current;
  }

  /* ---------------------------------------------------------- magnetic CTA */
  function setupMagnetic() {
    if (state.reduceMotion) return;
    document.querySelectorAll(".button-primary").forEach((button) => {
      if (button.dataset.magnetic) return;
      button.dataset.magnetic = "true";
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.3;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  /* --------------------------------------------------------------- typewriter */
  function startTypewriter() {
    window.clearTimeout(state.typewriterTimer);
    const target = document.getElementById("typewriter-target");
    if (!target) return;

    const roles = data.hero.roles.map((role) => translate(role));
    if (!roles.length) return;

    if (state.reduceMotion) {
      target.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function step() {
      const currentRole = roles[roleIndex];
      if (!deleting) {
        charIndex += 1;
        target.textContent = currentRole.slice(0, charIndex);
        if (charIndex === currentRole.length) {
          deleting = true;
          state.typewriterTimer = window.setTimeout(step, 1700);
          return;
        }
        state.typewriterTimer = window.setTimeout(step, 65);
        return;
      }
      charIndex -= 1;
      target.textContent = currentRole.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        state.typewriterTimer = window.setTimeout(step, 320);
        return;
      }
      state.typewriterTimer = window.setTimeout(step, 32);
    }

    step();
  }

  /* ---------------------------------------------------------------- language */
  function detectBrowserLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_LANG);
      if (SUPPORTED_LANGUAGES.has(saved)) return saved;
    } catch (error) {
      /* ignore */
    }
    const nav = typeof navigator === "object" && navigator ? navigator : {};
    const langs =
      Array.isArray(nav.languages) && nav.languages.length ? nav.languages : [nav.language || "en"];
    return langs.some((language) => String(language).toLowerCase().startsWith("fr")) ? "fr" : "en";
  }

  function applyLanguage(lang) {
    const nextLanguage = normalizeLanguage(lang);
    state.language = nextLanguage;
    data = dataByLanguage[nextLanguage] || dataByLanguage.en || dataByLanguage.fr;
    try {
      localStorage.setItem(STORAGE_LANG, nextLanguage);
    } catch (error) {
      /* ignore */
    }
    renderApp();
  }

  /* -------------------------------------------------------------------- init */
  function init() {
    applyTheme(detectInitialTheme(), false);
    setupGlobalListeners();
    applyLanguage(detectBrowserLanguage());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
