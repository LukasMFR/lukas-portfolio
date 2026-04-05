(function () {
  const data = window.PORTFOLIO_DATA;

  if (!data) {
    return;
  }

  const state = {
    lang: "en",
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

  const STORAGE_KEY = "lukas-portfolio-language";
  const SECTION_IDS = ["home", "about", "skills", "projects", "contact"];

  function translate(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
      return value[state.lang] ?? value.en ?? "";
    }
    return String(value);
  }

  function translateList(value) {
    const translated = translate(value);
    return Array.isArray(translated) ? translated : [];
  }

  function icon(name) {
    return `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
  }

  function isExternal(href) {
    return /^https?:\/\//.test(href);
  }

  function linkAttrs(href) {
    return isExternal(href) ? 'target="_blank" rel="noreferrer noopener"' : "";
  }

  function buttonMarkup(link, variantClass = "button-secondary", extraClass = "") {
    const classes = ["button", variantClass, extraClass].filter(Boolean).join(" ");
    return `<a class="${classes}" href="${link.href}" ${linkAttrs(link.href)}>${icon(link.icon || "arrow-up-right")}<span>${translate(link.label)}</span></a>`;
  }

  function pillList(items, className, itemClass) {
    return `<div class="${className}">${items
      .map((item) => `<span class="${itemClass}">${item}</span>`)
      .join("")}</div>`;
  }

  function renderLanguageSwitch() {
    return `
      <div class="language-switch" aria-label="${state.lang === "fr" ? "Sélecteur de langue" : "Language switch"}">
        <button class="language-button ${state.lang === "en" ? "is-active" : ""}" type="button" data-lang-switch="en">EN</button>
        <button class="language-button ${state.lang === "fr" ? "is-active" : ""}" type="button" data-lang-switch="fr">FR</button>
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
              ${icon("arrow-up-right")}
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

    elements.header.innerHTML = `
      <div class="nav-shell glass-panel">
        <a class="brand" href="#home" aria-label="${data.person.name}">
          <span class="brand-mark" aria-hidden="true">${data.person.initials}</span>
          <span class="brand-copy">
            <span class="brand-title">${data.person.name}</span>
            <span class="brand-subtitle">${translate(data.navigation.brandSubtitle)}</span>
          </span>
        </a>

        <nav class="site-nav" aria-label="${state.lang === "fr" ? "Navigation principale" : "Main navigation"}">
          <ul class="nav-links">${navLinks}</ul>
        </nav>

        <div class="header-actions">
          <div class="desktop-only">${renderLanguageSwitch()}</div>
          <a class="button button-secondary desktop-only" href="${cvLink.href}" target="_blank" rel="noreferrer noopener">
            ${icon("document")}
            <span>${translate(cvLink.label)}</span>
          </a>
          <button
            class="icon-button mobile-menu-toggle"
            type="button"
            aria-controls="mobile-menu"
            aria-expanded="${state.menuOpen ? "true" : "false"}"
            aria-label="${translate({
              en: state.menuOpen ? data.navigation.closeMenuLabel.en : data.navigation.mobileMenuLabel.en,
              fr: state.menuOpen ? data.navigation.closeMenuLabel.fr : data.navigation.mobileMenuLabel.fr,
            })}"
            data-menu-toggle
          >
            ${icon(state.menuOpen ? "close" : "menu")}
          </button>
        </div>
      </div>

      <div class="mobile-menu ${state.menuOpen ? "is-open" : ""}" id="mobile-menu">
        <ul class="mobile-nav-links">${mobileNavLinks}</ul>
        <div class="mobile-actions">
          ${renderLanguageSwitch()}
          ${buttonMarkup(cvLink, "button-secondary")}
        </div>
      </div>
    `;

    updateHeaderScrolledState();
  }

  function renderHero() {
    const socials = data.person.socials
      .map(
        (item) => `
          <a class="social-chip" href="${item.href}" ${linkAttrs(item.href)} aria-label="${item.title}">
            ${icon(item.icon)}
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
      `<a class="button button-secondary" href="${ctas[1].href}" target="_blank" rel="noreferrer noopener">${icon(
        ctas[1].icon
      )}<span>${translate(ctas[1].label)}</span></a>`,
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
            <div class="eyebrow">${icon("spark")}<span>${translate(data.hero.kicker)}</span></div>
            <h1 class="hero-title">${data.person.name}</h1>
            <p class="hero-subtitle">${translate(data.hero.subtitle)}</p>
            <div class="typewriter-line" aria-live="polite">
              ${icon("shield")}
              <span class="typewriter-text" id="typewriter-target"></span>
              <span class="typewriter-cursor" aria-hidden="true"></span>
            </div>
            <p class="hero-description">${translate(data.hero.description)}</p>
            <div class="hero-actions">${buttons}</div>
            <div class="hero-socials">${socials}</div>
            <div class="hero-stats">${stats}</div>
          </div>

          <div class="hero-visual">
            <div class="floating-note glass-panel">
              <strong>${translate(data.hero.noteTitle)}</strong>
              <span>${translate(data.hero.noteCopy)}</span>
            </div>

            <article class="portrait-card glass-panel">
              <div class="portrait-image-shell">
                <img src="${data.person.profilePhoto.src}" alt="${translate(data.person.profilePhoto.alt)}" />
                <div class="portrait-meta">
                  <div class="portrait-meta-title">${translate(data.hero.portraitTitle)}</div>
                  <div class="portrait-meta-copy">${translate(data.hero.portraitCopy)}</div>
                </div>
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
              ${
                item.image
                  ? `<div class="timeline-logo"><img src="${item.image.src}" alt="${translate(item.image.alt)}" /></div>`
                  : ""
              }
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
          <div class="section-kicker">${icon("users")}<span>${translate(data.about.kicker)}</span></div>
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
              <h3 class="timeline-title">${icon("graduation")}<span>${translate(data.about.educationTitle)}</span></h3>
              <ul class="timeline-list">
                ${data.education.map(renderTimelineItem).join("")}
              </ul>
            </section>

            <section class="timeline-column">
              <h3 class="timeline-title">${icon("briefcase")}<span>${translate(data.about.experienceTitle)}</span></h3>
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
            ${pillList(category.items, "tech-list", "tech-pill")}
          </article>
        `
      )
      .join("");

    const toolCloud = data.skills.toolCloud
      .map((tool) => `<span class="tool-chip">${tool}</span>`)
      .join("");

    elements.skills.innerHTML = `
      <div class="section-shell">
        <div class="section-heading">
          <div class="section-kicker">${icon("chart")}<span>${translate(data.skills.kicker)}</span></div>
          <h2 class="section-title">${translate(data.skills.title)}</h2>
          <p class="section-intro">${translate(data.skills.intro)}</p>
        </div>

        <div class="skills-grid">${skillCards}</div>

        <div class="about-card glass-panel">
          <h3 class="timeline-title">${icon("spark")}<span>${translate(data.skills.toolsLabel)}</span></h3>
          <div class="tool-cloud">${toolCloud}</div>
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
          <div class="project-badge">${icon(project.icon)}<span>${project.year}</span></div>
          <div>
            <h3 class="project-title">${translate(project.title)}</h3>
            <p class="project-subtitle">${translate(project.subtitle)}</p>
          </div>
        </div>

        <p class="project-copy">${translate(project.overview)}</p>
        <ul class="project-list">${highlights}</ul>
        ${pillList(project.technologies, "tech-list", "tech-pill")}
        <ul class="project-list">${outcomes}</ul>
        <div class="project-links">
          ${project.links.map((link) => buttonMarkup(link, "button-ghost")).join("")}
        </div>
      </article>
    `;
  }

  function renderAcademicWork(item) {
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
              <div class="course-meta">${translate(item.level)} - ${translate(item.course)}</div>
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
            ${pillList(item.technologies, "tech-list", "tech-pill")}
          </div>
          ${links}
        </div>
      </details>
    `;
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
        ${pillList(item.tags, "tech-list", "tech-pill")}
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

    elements.projects.innerHTML = `
      <div class="section-shell">
        <div class="section-heading">
          <div class="section-kicker">${icon("spark")}<span>${translate(data.projects.kicker)}</span></div>
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
                <h3 class="course-group-title">${translate(data.projects.academicTitle)}</h3>
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
              <span class="skill-icon">${icon(card.icon)}</span>
              <span>
                <span class="contact-link-title">${card.title}</span>
                <span class="contact-link-copy">${translate(card.copy)}</span>
              </span>
            </span>
            ${icon("arrow-up-right")}
          </a>
        `
      )
      .join("");

    elements.contact.innerHTML = `
      <div class="section-shell">
        <div class="section-heading">
          <div class="section-kicker">${icon("mail")}<span>${translate(data.contact.kicker)}</span></div>
          <h2 class="section-title">${translate(data.contact.title)}</h2>
          <p class="section-intro">${translate(data.contact.intro)}</p>
        </div>

        <div class="contact-grid">
          <article class="contact-card glass-panel">
            <h3 class="course-group-title">${translate(data.contact.ctaTitle)}</h3>
            <p class="contact-copy">${translate(data.contact.ctaCopy)}</p>
            <div class="contact-actions">
              <a class="button button-primary" href="mailto:${data.person.email}">
                ${icon("mail")}
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
      .map(
        (item) =>
          `<a class="social-chip" href="${item.href}">${translate(item.label)}</a>`
      )
      .join("");

    const socialLinks = data.person.socials
      .map(
        (item) => `
          <a class="social-chip" href="${item.href}" ${linkAttrs(item.href)}>
            ${icon(item.icon)}
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

    if (description) description.setAttribute("content", translate(data.meta.description));
    if (ogTitle) ogTitle.setAttribute("content", translate(data.meta.ogTitle));
    if (ogDescription) ogDescription.setAttribute("content", translate(data.meta.ogDescription));
    if (ogLocale) ogLocale.setAttribute("content", translate(data.meta.locale));

    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-language", state.lang);

    if (elements.skipLink) {
      elements.skipLink.textContent = state.lang === "fr" ? "Aller au contenu" : "Skip to content";
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
    bindInteractiveElements();
    setupRevealObserver();
    setupSectionObserver();
    startTypewriter();
  }

  function bindInteractiveElements() {
    elements.header.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang, true));
    });

    const toggle = elements.header.querySelector("[data-menu-toggle]");
    if (toggle) {
      toggle.addEventListener("click", () => {
        state.menuOpen = !state.menuOpen;
        renderHeader();
        bindInteractiveElements();
        applyActiveNav();
      });
    }

    elements.header.querySelectorAll("[data-mobile-link]").forEach((link) => {
      link.addEventListener("click", () => {
        state.menuOpen = false;
        renderHeader();
        bindInteractiveElements();
        applyActiveNav();
      });
    });
  }

  function closeMenu() {
    if (!state.menuOpen) return;
    state.menuOpen = false;
    renderHeader();
    bindInteractiveElements();
    applyActiveNav();
  }

  function setupGlobalListeners() {
    if (state.globalListenersReady) return;

    window.addEventListener("scroll", updateHeaderScrolledState, { passive: true });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 880) {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!state.menuOpen) return;
      if (!elements.header.contains(event.target)) {
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
    if (state.reduceMotion) {
      revealTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    state.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            state.revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealTargets.forEach((element) => state.revealObserver.observe(element));
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

  function detectLanguage() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "en") {
      return saved;
    }

    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"];

    return languages.some((language) => String(language).toLowerCase().startsWith("fr")) ? "fr" : "en";
  }

  function setLanguage(lang, persist) {
    const nextLang = lang === "fr" ? "fr" : "en";
    state.lang = nextLang;
    if (persist) {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    }
    renderApp();
  }

  function init() {
    state.lang = detectLanguage();
    setupGlobalListeners();
    renderApp();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
