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
    leaflet: "leaflet",
    linux: "linux",
    lynis: "lynis",
    mac: "apple",
    macos: "apple",
    mariadb: "mariadb",
    matplotlib: "matplotlib",
    metasploit: "metasploit",
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
    const {
      variant = "standard",
      className = "",
      decorative = true,
      label = "",
    } = options;

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
      <div class="timeline-logo logo-frame">
        <img src="${image.src}" alt="${translate(image.alt)}" loading="lazy" decoding="async" />
      </div>
    `;
  }

  function buttonMarkup(link, variantClass = "button-secondary", extraClass = "", iconVariant) {
    const classes = ["button", variantClass, extraClass].filter(Boolean).join(" ");
    const resolvedVariant =
      iconVariant || (variantClass === "button-primary" ? "inverse" : "standard");

    return `
      <a class="${classes}" href="${link.href}" ${linkAttrs(link.href)}>
        ${icon(link.icon || "arrow-up-right", { variant: resolvedVariant })}
        <span>${translate(link.label)}</span>
      </a>
    `;
  }

  function renderChip(item, itemClass, options = {}) {
    const label = translate(item);
    const techLogo = options.withTechLogos ? techLogoMarkup(label) : "";
    const classes = [itemClass, techLogo ? "has-tech-logo" : ""].filter(Boolean).join(" ");

    return `
      <span class="${classes}">
        ${techLogo}
        <span class="chip-label">${label}</span>
      </span>
    `;
  }

  function pillList(items, className, itemClass, options = {}) {
    return `
      <div class="${className}">
        ${items.map((item) => renderChip(item, itemClass, options)).join("")}
      </div>
    `;
  }

  function techLogoStrip(items, options = {}) {
    const { className = "project-tech-strip", limit = 5 } = options;
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
        ${logos
          .slice(0, limit)
          .map((item) => techLogoMarkup(item, { className: "project-tech-mark" }))
          .join("")}
      </div>
    `;
  }

  function getMenuLabel() {
    const key = state.menuOpen ? "closeMenuLabel" : "mobileMenuLabel";
    return translate(data.navigation[key]);
  }

  function renderLanguageSwitch() {
    const label = state.language === "fr" ? "Sélecteur de langue" : "Language switch";

    return `
      <div class="language-switch" aria-label="${label}">
        <button
          class="language-button ${state.language === "en" ? "is-active" : ""}"
          type="button"
          aria-pressed="${state.language === "en" ? "true" : "false"}"
          data-lang-switch="en"
        >
          EN
        </button>
        <button
          class="language-button ${state.language === "fr" ? "is-active" : ""}"
          type="button"
          aria-pressed="${state.language === "fr" ? "true" : "false"}"
          data-lang-switch="fr"
        >
          FR
        </button>
      </div>
    `;
  }

  function renderHeader() {
    const navLinks = data.navigation.links
      .map(
        (item) =>
          `<li><a class="nav-link" href="${item.href}" data-section-link="${item.href.replace("#", "")}">${translate(
            item.label
          )}</a></li>`
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

    const cvLink = {
      href: data.person.resumeHref,
      label: data.navigation.cv,
      icon: "document",
    };

    const menuLabel = getMenuLabel();

    elements.header.innerHTML = `
      <div class="nav-shell glass-panel">
        <a class="brand" href="#home" aria-label="${data.person.name}">
          <span class="brand-mark brand-avatar" aria-hidden="true">
            <img
              src="${data.person.headerAnimoji.src}"
              alt=""
              loading="eager"
              decoding="async"
            />
          </span>
          <span class="brand-copy">
            <span class="brand-title">${data.person.name}</span>
            <span class="brand-subtitle">${translate(data.navigation.brandSubtitle)}</span>
          </span>
        </a>

        <nav class="site-nav" aria-label="${state.language === "fr" ? "Navigation principale" : "Main navigation"}">
          <ul class="nav-links">${navLinks}</ul>
        </nav>

        <div class="header-actions">
          <div class="desktop-only header-lang">${renderLanguageSwitch()}</div>
          <a
            class="button button-secondary desktop-only header-cv"
            href="${cvLink.href}"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="${translate(cvLink.label)}"
          >
            ${icon("document")}
            <span class="header-cv-label-full">${translate(cvLink.label)}</span>
            <span class="header-cv-label-short" aria-hidden="true">CV</span>
          </a>
          <button
            class="icon-button mobile-menu-toggle"
            type="button"
            aria-controls="mobile-menu"
            aria-expanded="${state.menuOpen ? "true" : "false"}"
            aria-label="${menuLabel}"
            data-menu-toggle
          >
            <span data-menu-toggle-icon aria-hidden="true">
              <span class="menu-toggle-line"></span>
              <span class="menu-toggle-line"></span>
              <span class="menu-toggle-line"></span>
            </span>
          </button>
        </div>
      </div>

      <div
        class="mobile-menu ${state.menuOpen ? "is-open" : ""}"
        id="mobile-menu"
        aria-hidden="${state.menuOpen ? "false" : "true"}"
        data-mobile-menu
      >
        <ul class="mobile-nav-links">${mobileNavLinks}</ul>
        <div class="mobile-actions">
          ${renderLanguageSwitch()}
          ${buttonMarkup(cvLink, "button-secondary")}
        </div>
      </div>
    `;

    updateHeaderScrolledState();
    bindHeaderInteractions();
    syncMenuState();
  }

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
      {
        href: "#projects",
        label: data.hero.primaryCta,
        icon: "arrow-up-right",
      },
      {
        href: data.person.resumeHref,
        label: data.hero.cvCta,
        icon: "document",
      },
      {
        href: "#contact",
        label: data.hero.contactCta,
        icon: "mail",
      },
    ];

    const buttons = [
      buttonMarkup(ctas[0], "button-primary"),
      buttonMarkup(ctas[1], "button-secondary"),
      buttonMarkup(ctas[2], "button-ghost"),
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

    elements.home.innerHTML = `
      <div class="container">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">${icon("spark", { variant: "accent" })}<span>${translate(data.hero.kicker)}</span></div>
            <h1 class="hero-title">${data.person.name}</h1>
            <p class="hero-subtitle">${translate(data.hero.subtitle)}</p>
            <div class="typewriter-line" aria-live="polite">
              ${icon("shield", { variant: "accent" })}
              <span class="typewriter-text" id="typewriter-target"></span>
              <span class="typewriter-cursor" aria-hidden="true"></span>
            </div>
            <p class="hero-description">${translate(data.hero.description)}</p>
            <div class="hero-actions">${buttons}</div>
            <div class="hero-socials">${socials}</div>
            <div class="hero-stats">${stats}</div>
          </div>

          <div class="hero-visual">
            <article class="portrait-card glass-panel">
              <div class="portrait-image-shell">
                <img src="${data.person.profilePhoto.src}" alt="${translate(data.person.profilePhoto.alt)}" />
              </div>
            </article>

            <div class="animoji-badge glass-panel">
              <img src="${data.person.animoji.src}" alt="${translate(data.person.animoji.alt)}" />
              <span class="sr-only">${translate(data.hero.animojiLabel)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTimelineItem(item) {
    const highlights = translateList(item.highlights)
      .map((point) => `<li>${point}</li>`)
      .join("");

    const linkBlock = item.links?.length
      ? `<div class="project-links">${item.links
          .map((link) => buttonMarkup(link, "button-ghost"))
          .join("")}</div>`
      : "";

    return `
      <li class="timeline-item">
        <article class="timeline-card glass-panel">
          <div class="timeline-header">
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
        <div class="section-heading">
          <div class="section-kicker">${icon("users", { variant: "accent" })}<span>${translate(data.about.kicker)}</span></div>
          <h2 class="section-title">${translate(data.about.title)}</h2>
          <p class="section-intro">${translate(data.about.intro)}</p>
        </div>

        <div class="about-grid">
          <article class="about-card glass-panel">
            ${aboutParagraphs}
            ${pillList(focusPills, "pill-list", "pill")}
          </article>

          <div class="timeline-grid">
            <section class="timeline-column">
              <h3 class="timeline-title">${icon("graduation", { variant: "accent" })}<span>${translate(data.about.educationTitle)}</span></h3>
              <ul class="timeline-list">
                ${data.education.map(renderTimelineItem).join("")}
              </ul>
            </section>

            <section class="timeline-column">
              <h3 class="timeline-title">${icon("briefcase", { variant: "accent" })}<span>${translate(data.about.experienceTitle)}</span></h3>
              <ul class="timeline-list">
                ${data.experiences.map(renderTimelineItem).join("")}
              </ul>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  function renderSkills() {
    const skillCards = data.skills.categories
      .map(
        (category) => `
          <article class="skill-card glass-panel">
            <div class="skill-card-header">
              <div class="skill-icon">${icon(category.icon)}</div>
              <div>
                <h3 class="skill-title">${translate(category.title)}</h3>
              </div>
            </div>
            <p class="skill-copy">${translate(category.copy)}</p>
            ${pillList(category.items, "tech-list", "tech-pill", { withTechLogos: true })}
          </article>
        `
      )
      .join("");

    const toolCloud = pillList(data.skills.toolCloud, "tool-cloud", "tool-chip", {
      withTechLogos: true,
    });

    elements.skills.innerHTML = `
      <div class="section-shell">
        <div class="section-heading">
          <div class="section-kicker">${icon("chart", { variant: "accent" })}<span>${translate(data.skills.kicker)}</span></div>
          <h2 class="section-title">${translate(data.skills.title)}</h2>
          <p class="section-intro">${translate(data.skills.intro)}</p>
        </div>

        <div class="skills-grid">${skillCards}</div>

        <div class="about-card glass-panel">
          <h3 class="timeline-title">${icon("spark", { variant: "accent" })}<span>${translate(data.skills.toolsLabel)}</span></h3>
          ${toolCloud}
        </div>
      </div>
    `;
  }

  function renderFeaturedProject(project) {
    const highlights = translateList(project.highlights).map((point) => `<li>${point}</li>`).join("");
    const outcomes = translateList(project.outcomes).map((point) => `<li>${point}</li>`).join("");

    return `
      <article class="project-card glass-panel">
        <div class="project-media">
          <div class="project-badge">${icon(project.icon, { variant: "accent" })}<span>${project.year}</span></div>
          <div class="project-media-copy">
            <h3 class="project-title">${translate(project.title)}</h3>
            <p class="project-subtitle">${translate(project.subtitle)}</p>
          </div>
          ${techLogoStrip(project.technologies)}
        </div>

        <p class="project-copy">${translate(project.overview)}</p>
        <ul class="project-list">${highlights}</ul>
        ${pillList(project.technologies, "tech-list", "tech-pill", { withTechLogos: true })}
        <ul class="project-list">${outcomes}</ul>
        <div class="project-links">
          ${project.links.map((link) => buttonMarkup(link, "button-ghost")).join("")}
        </div>
      </article>
    `;
  }

  function renderExpandableProject(item, meta) {
    const focus = translateList(item.focus).map((entry) => `<li>${entry}</li>`).join("");
    const outcomes = translateList(item.outcomes).map((entry) => `<li>${entry}</li>`).join("");
    const links = item.links?.length
      ? `<div class="project-links">${item.links
          .map((link) => buttonMarkup(link, "button-ghost"))
          .join("")}</div>`
      : "";

    return `
      <details class="course-card glass-panel">
        <summary>
          <div class="course-summary-main">
            <div class="course-summary-icon">${icon(item.icon)}</div>
            <div class="course-summary-text">
              <h3 class="course-title">${translate(item.title)}</h3>
              <div class="course-meta">${meta}</div>
            </div>
          </div>
          <span class="course-chevron" aria-hidden="true"></span>
        </summary>
        <div class="course-body">
          <div class="detail-grid">
            <div class="detail-block">
              <h4 class="detail-title">${translate(data.projects.contextLabel)}</h4>
              <p class="detail-copy">${translate(item.context)}</p>
            </div>
            <div class="detail-block">
              <h4 class="detail-title">${translate(data.projects.objectiveLabel)}</h4>
              <p class="detail-copy">${translate(item.objective)}</p>
            </div>
            <div class="detail-block">
              <h4 class="detail-title">${translate(data.projects.focusLabel)}</h4>
              <ul class="detail-list">${focus}</ul>
            </div>
            <div class="detail-block">
              <h4 class="detail-title">${translate(data.projects.outcomeLabel)}</h4>
              <ul class="detail-list">${outcomes}</ul>
            </div>
          </div>
          <div class="detail-block">
            <h4 class="detail-title">${translate(data.projects.techLabel)}</h4>
            ${pillList(item.technologies, "tech-list", "tech-pill", { withTechLogos: true })}
          </div>
          ${links}
        </div>
      </details>
    `;
  }

  function renderAcademicWork(item) {
    return renderExpandableProject(item, `${translate(item.level)} - ${translate(item.course)}`);
  }

  function renderPersonalProject(item) {
    return renderExpandableProject(item, translate(item.type));
  }

  function renderContinuousLearningCard(item) {
    return `
      <article class="cert-card glass-panel">
        <div class="skill-card-header">
          <div class="skill-icon">${icon(item.icon)}</div>
          <div>
            <h3 class="cert-title">${translate(item.title)}</h3>
          </div>
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
          <div class="course-group">
            <div class="course-group-header">
              <div>
                <h3 class="course-group-title">${translate(group.title)}</h3>
                <p class="course-group-copy">${translate(group.copy)}</p>
              </div>
            </div>
            <div class="accordion-grid">
              ${items.map(renderAcademicWork).join("")}
            </div>
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
          <div class="course-group">
            <div class="course-group-header">
              <div>
                <h4 class="course-group-title">${translate(group.title)}</h4>
                <p class="course-group-copy">${translate(group.copy)}</p>
              </div>
            </div>
            <div class="accordion-grid">
              ${items.map(renderPersonalProject).join("")}
            </div>
          </div>
        `;
      })
      .join("");

    elements.projects.innerHTML = `
      <div class="section-shell">
        <div class="section-heading">
          <div class="section-kicker">${icon("spark", { variant: "accent" })}<span>${translate(data.projects.kicker)}</span></div>
          <h2 class="section-title">${translate(data.projects.title)}</h2>
          <p class="section-intro">${translate(data.projects.intro)}</p>
        </div>

        <div class="project-stack">
          <section class="course-group">
            <div class="course-group-header">
              <div>
                <h3 class="course-group-title">${translate(data.projects.featuredTitle)}</h3>
                <p class="course-group-copy">${translate(data.projects.featuredIntro)}</p>
              </div>
            </div>
            <div class="featured-grid">${featured}</div>
          </section>

          <section class="course-group">
            <div class="course-group-header">
              <div>
                <h3 class="course-group-title course-group-title-strong">${translate(
                  data.projects.academicTitle
                )}</h3>
                <p class="course-group-copy">${translate(data.projects.academicIntro)}</p>
              </div>
            </div>
            ${groupedAcademic}
          </section>

          <section class="course-group">
            <div class="course-group-header">
              <div>
                <h3 class="course-group-title">${translate(data.projects.continuousTitle)}</h3>
                <p class="course-group-copy">${translate(data.projects.continuousIntro)}</p>
              </div>
            </div>
            <div class="cert-grid">${continuous}</div>
          </section>

          <section class="course-group">
            <div class="course-group-header">
              <div>
                <h3 class="course-group-title course-group-title-strong">${translate(data.projects.personalTitle)}</h3>
                <p class="course-group-copy">${translate(data.projects.personalIntro)}</p>
              </div>
            </div>
            ${groupedPersonal}
          </section>
        </div>
      </div>
    `;
  }

  function renderContact() {
    const contactLinks = data.contact.cards
      .map(
        (card) => `
          <a class="contact-link" href="${card.href}" ${linkAttrs(card.href)}>
            <span class="contact-link-main">
              <span class="skill-icon">${icon(card.icon, { variant: "social" })}</span>
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
        <div class="section-heading">
          <div class="section-kicker">${icon("mail", { variant: "accent" })}<span>${translate(data.contact.kicker)}</span></div>
          <h2 class="section-title">${translate(data.contact.title)}</h2>
          <p class="section-intro">${translate(data.contact.intro)}</p>
        </div>

        <div class="contact-grid">
          <article class="contact-card glass-panel">
            <h3 class="course-group-title">${translate(data.contact.ctaTitle)}</h3>
            <p class="contact-copy">${translate(data.contact.ctaCopy)}</p>
            <div class="contact-actions">
              <a class="button button-primary" href="mailto:${data.person.email}">
                ${icon("mail", { variant: "inverse" })}
                <span>${translate(data.contact.primaryCta)}</span>
              </a>
              <a class="button button-secondary" href="${data.person.resumeHref}" target="_blank" rel="noreferrer noopener">
                ${icon("document")}
                <span>${translate(data.contact.secondaryCta)}</span>
              </a>
            </div>
          </article>

          <aside class="contact-card glass-panel">
            <div class="contact-links">${contactLinks}</div>
          </aside>
        </div>
      </div>
    `;
  }

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
      <div class="footer-shell glass-panel">
        <div class="footer-top">
          <div>
            <div class="brand-title">${data.person.name}</div>
            <div class="footer-copy">${translate(data.footer.copy)}</div>
          </div>
          <a class="button button-secondary" href="mailto:${data.person.email}">
            ${icon("mail")}
            <span>${translate(data.footer.contactLabel)}: ${data.person.email}</span>
          </a>
        </div>

        <div class="footer-meta">
          <span>${year}</span>
          <span>${translate(data.footer.rights)}</span>
          <span>${translate(data.person.location)}</span>
        </div>

        <div class="footer-links footer-link-row">
          ${quickLinks}
        </div>
        <div class="footer-links footer-link-row">
          ${socialLinks}
        </div>
      </div>
    `;
  }

  function setMeta() {
    document.title = translate(data.meta.title);

    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (description) description.setAttribute("content", translate(data.meta.description));
    if (ogTitle) ogTitle.setAttribute("content", translate(data.meta.ogTitle));
    if (ogDescription) ogDescription.setAttribute("content", translate(data.meta.ogDescription));
    if (ogLocale) ogLocale.setAttribute("content", translate(data.meta.locale));
    if (ogImage) ogImage.setAttribute("content", data.person.profilePhoto.src);

    document.documentElement.lang = state.language;
    document.documentElement.setAttribute("data-language", state.language);

    if (elements.skipLink) {
      elements.skipLink.textContent = state.language === "fr" ? "Aller au contenu" : "Skip to content";
    }
  }

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
    startTypewriter();
  }

  function closeMenu() {
    if (!state.menuOpen) return;
    setMenuOpen(false);
  }

  function setMenuOpen(nextOpen) {
    state.menuOpen = Boolean(nextOpen);
    syncMenuState();
    applyActiveNav();
  }

  function syncMenuState() {
    if (!elements.header) return;

    const menuToggle = elements.header.querySelector("[data-menu-toggle]");
    const mobileMenu = elements.header.querySelector("[data-mobile-menu]");
    const menuLabel = getMenuLabel();

    elements.header.classList.toggle("is-menu-open", state.menuOpen);

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", state.menuOpen ? "true" : "false");
      menuToggle.setAttribute("aria-label", menuLabel);
    }

    if (mobileMenu) {
      mobileMenu.classList.toggle("is-open", state.menuOpen);
      mobileMenu.setAttribute("aria-hidden", state.menuOpen ? "false" : "true");
    }
  }

  function isElementNearViewport(element) {
    if (!element || typeof element.getBoundingClientRect !== "function") {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    return rect.top <= viewportHeight * 0.92 && rect.bottom >= viewportHeight * 0.08;
  }

  function ensureVisibleReveals() {
    document.querySelectorAll(".reveal").forEach((element) => {
      if (element.classList.contains("is-visible")) {
        return;
      }

      if (isElementNearViewport(element)) {
        element.classList.add("is-visible");
        if (state.revealObserver) {
          state.revealObserver.unobserve(element);
        }
      }
    });
  }

  function bindHeaderInteractions() {
    if (!elements.header) return;

    elements.header.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => {
        applyLanguage(button.getAttribute("data-lang-switch"));
      });
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
      link.addEventListener("click", () => {
        closeMenu();
      });
    });
  }

  function setupGlobalListeners() {
    if (state.globalListenersReady) return;

    window.addEventListener(
      "scroll",
      () => {
        updateHeaderScrolledState();
        ensureVisibleReveals();
      },
      { passive: true }
    );
    window.addEventListener("resize", () => {
      if (window.innerWidth > HEADER_MENU_BREAKPOINT) {
        closeMenu();
      }
      ensureVisibleReveals();
    });

    document.addEventListener("click", (event) => {
      if (state.menuOpen && !closestFromTarget(event.target, "#site-header")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    state.globalListenersReady = true;
  }

  function updateHeaderScrolledState() {
    if (!elements.header) return;
    elements.header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function setupRevealObserver() {
    if (state.revealObserver) {
      state.revealObserver.disconnect();
    }

    const revealTargets = document.querySelectorAll(".reveal");
    if (state.reduceMotion || typeof window.IntersectionObserver !== "function") {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
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
      {
        threshold: 0.02,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealTargets.forEach((element) => state.revealObserver.observe(element));
    ensureVisibleReveals();
  }

  function setupSectionObserver() {
    if (state.sectionObserver) {
      state.sectionObserver.disconnect();
    }

    state.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            applyActiveNav(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-42% 0px -42% 0px",
        threshold: 0.01,
      }
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
      if (element && element.offsetTop <= threshold) {
        current = id;
      }
    });

    return current;
  }

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
          state.typewriterTimer = window.setTimeout(step, 1500);
          return;
        }

        state.typewriterTimer = window.setTimeout(step, 70);
        return;
      }

      charIndex -= 1;
      target.textContent = currentRole.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        state.typewriterTimer = window.setTimeout(step, 220);
        return;
      }

      state.typewriterTimer = window.setTimeout(step, 36);
    }

    step();
  }

  function detectBrowserLanguage() {
    const browserNavigator = typeof navigator === "object" && navigator ? navigator : {};
    const browserLanguages =
      Array.isArray(browserNavigator.languages) && browserNavigator.languages.length
        ? browserNavigator.languages
        : [browserNavigator.language || "en"];

    return browserLanguages.some((language) => String(language).toLowerCase().startsWith("fr"))
      ? "fr"
      : "en";
  }

  function applyLanguage(lang) {
    const nextLanguage = normalizeLanguage(lang);

    state.language = nextLanguage;
    data = dataByLanguage[nextLanguage] || dataByLanguage.en || dataByLanguage.fr;
    renderApp();
  }

  function init() {
    setupGlobalListeners();
    applyLanguage(detectBrowserLanguage());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
