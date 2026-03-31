/* ============================================================
   Stackweld Landing — script.js
   Theme toggle, language toggle, particles, scroll reveal,
   counter animation, clipboard, OS detection, mobile menu
   ============================================================ */

(function () {
  'use strict';

  /* ── i18n Translations ──────────────────────────────────── */
  const translations = {
    en: {
      'nav.features': 'Features',
      'nav.cli': 'CLI',
      'nav.download': 'Download',
      'nav.docs': 'Docs',
      'nav.getStarted': 'Get Started',
      'hero.badge': 'Open Source Developer Tool',
      'hero.titleLine1': "The Developer's",
      'hero.titleLine2': 'Forge',
      'hero.subtitle': 'Compose your tech stack visually. Validate compatibility instantly. Generate production-ready projects in seconds.',
      'hero.ctaPrimary': 'Install via npm',
      'hero.ctaSecondary': 'View on GitHub',
      'hero.statTech': 'Technologies',
      'hero.statCli': 'CLI Commands',
      'hero.statTemplates': 'Templates',
      'hero.statTools': 'Analysis Tools',
      'features.titlePrefix': 'Built for',
      'features.titleAccent': 'Real Workflows',
      'features.subtitle': 'Everything you need to compose, validate, and ship your tech stack with confidence.',
      'features.composition.title': 'Stack Composition',
      'features.composition.desc': 'Select from 83 technologies. Auto-validate combinations as you build. Visual dependency graph included.',
      'features.scoring.title': 'Compatibility Scoring',
      'features.scoring.desc': 'Get a 0-100 compatibility score between any two technologies. Letter grades from D to S. Know before you commit.',
      'features.scaffolding.title': 'Project Scaffolding',
      'features.scaffolding.desc': 'Generate full project structures from validated stacks. Config files, folder layout, and boilerplate — all production-ready.',
      'features.health.title': 'Health Monitor',
      'features.health.desc': 'Audit existing projects for outdated deps, missing configs, security issues, and performance bottlenecks.',
      'features.migration.title': 'Migration Assistant',
      'features.migration.desc': 'Step-by-step guides for migrating between technologies. Risk analysis and rollback plans included.',
      'features.infra.title': 'Infrastructure Generation',
      'features.infra.desc': 'Auto-generate Dockerfiles, nginx configs, CI/CD pipelines, and deploy scripts tailored to your stack.',
      'cli.titlePrefix': 'See It',
      'cli.titleAccent': 'In Action',
      'cli.subtitle': 'One command to create, validate, and scaffold a production-ready stack.',
      'how.titlePrefix': 'How It',
      'how.titleAccent': 'Works',
      'how.step1.title': 'Choose',
      'how.step1.desc': 'Select from 83 technologies across frontend, backend, database, DevOps, and more. Mix and match freely.',
      'how.step2.title': 'Validate',
      'how.step2.desc': 'Automatically check compatibility between every pair. Get scores, grades, and actionable warnings before writing a line of code.',
      'how.step3.title': 'Build',
      'how.step3.desc': 'Generate your project with Docker, CI/CD, tests, and deploy configs. Everything wired up and ready to ship.',
      'more.titlePrefix': 'And',
      'more.titleAccent': 'Much More',
      'more.subtitle': 'A growing ecosystem of tools for every stage of your development workflow.',
      'more.cost.title': 'Cost Estimator',
      'more.cost.desc': 'Estimate monthly cloud costs for your stack across AWS, GCP, and Azure.',
      'more.profiles.title': 'Performance Profiles',
      'more.profiles.desc': 'Optimize for speed, cost, or reliability with pre-tuned configuration profiles.',
      'more.sharing.title': 'Stack Sharing',
      'more.sharing.desc': 'Export and share your validated stacks as JSON. Import community stacks instantly.',
      'more.team.title': 'Team Standards',
      'more.team.desc': 'Define and enforce stack policies across your team with shared configs.',
      'more.learning.title': 'Learning Paths',
      'more.learning.desc': 'Interactive tutorials for each technology in your stack. Learn as you build.',
      'more.plugins.title': 'Plugin System',
      'more.plugins.desc': 'Extend Stackweld with community plugins. Custom validators, generators, and analyzers.',
      'more.env.title': 'Env Sync',
      'more.env.desc': 'Auto-generate .env files with correct variables for each service in your stack.',
      'more.compare.title': 'Stack Comparison',
      'more.compare.desc': 'Compare two stacks side-by-side. Performance, cost, complexity, and compatibility metrics.',
      'more.deploy.title': 'Deploy Anywhere',
      'more.deploy.desc': 'Generate deploy configs for VPS, AWS, GCP, Vercel, Railway, and more.',
      'download.titlePrefix': 'Get',
      'download.titleAccent': 'Stackweld',
      'download.subtitle': 'Available on all major platforms. Free and open source.',
      'download.detected': 'Detected OS:',
      'download.btnLinux': 'Download for Linux',
      'download.btnMac': 'Download for macOS',
      'download.btnWin': 'Download for Windows',
      'download.altLabel': 'Or install via npm:',
      'download.allReleases': 'View all releases on GitHub',
      'oss.title': 'Free and Open Source',
      'oss.desc': 'Stackweld is MIT licensed. Use it, fork it, improve it. Contributions welcome.',
      'oss.starBtn': 'Star on GitHub',
      'oss.contribBtn': 'Contributors',
      'footer.tagline': "The Developer's Forge",
      'footer.product': 'Product',
      'footer.features': 'Features',
      'footer.download': 'Download',
      'footer.cli': 'CLI',
      'footer.resources': 'Resources',
      'footer.docs': 'Documentation',
      'footer.releases': 'Releases',
      'footer.community': 'Community',
      'footer.contributing': 'Contributing',
      'footer.issues': 'Issues',
      'footer.discussions': 'Discussions',
      'footer.copyright': '\u00A9 2026 Stackweld. Built by Orlando Fernandez / XPlus Technologies LLC.',
      'footer.license': 'Released under the MIT License.',
    },
    es: {
      'nav.features': 'Funciones',
      'nav.cli': 'CLI',
      'nav.download': 'Descargar',
      'nav.docs': 'Docs',
      'nav.getStarted': 'Empezar',
      'hero.badge': 'Herramienta Open Source para Developers',
      'hero.titleLine1': "The Developer's",
      'hero.titleLine2': 'Forge',
      'hero.subtitle': 'Compone tu stack visual. Valida compatibilidad al instante. Genera proyectos listos para produccion en segundos.',
      'hero.ctaPrimary': 'Instalar via npm',
      'hero.ctaSecondary': 'Ver en GitHub',
      'hero.statTech': 'Tecnologias',
      'hero.statCli': 'Comandos CLI',
      'hero.statTemplates': 'Plantillas',
      'hero.statTools': 'Herramientas',
      'features.titlePrefix': 'Hecho para',
      'features.titleAccent': 'Flujos Reales',
      'features.subtitle': 'Todo lo que necesitas para componer, validar y publicar tu stack con confianza.',
      'features.composition.title': 'Composicion de Stack',
      'features.composition.desc': 'Selecciona entre 83 tecnologias. Valida combinaciones mientras construyes. Grafo de dependencias incluido.',
      'features.scoring.title': 'Puntuacion de Compatibilidad',
      'features.scoring.desc': 'Obtiene una puntuacion 0-100 entre cualquier par de tecnologias. Grados de D a S. Decide antes de comprometerte.',
      'features.scaffolding.title': 'Scaffolding de Proyecto',
      'features.scaffolding.desc': 'Genera estructuras completas desde stacks validados. Configs, directorios y boilerplate listos para produccion.',
      'features.health.title': 'Monitor de Salud',
      'features.health.desc': 'Audita proyectos existentes: deps desactualizadas, configs faltantes, seguridad y cuellos de botella.',
      'features.migration.title': 'Asistente de Migracion',
      'features.migration.desc': 'Guias paso a paso para migrar entre tecnologias. Analisis de riesgo y planes de rollback incluidos.',
      'features.infra.title': 'Generacion de Infraestructura',
      'features.infra.desc': 'Genera Dockerfiles, configs de nginx, pipelines CI/CD y scripts de deploy para tu stack.',
      'cli.titlePrefix': 'Velo',
      'cli.titleAccent': 'En Accion',
      'cli.subtitle': 'Un comando para crear, validar y generar un stack listo para produccion.',
      'how.titlePrefix': 'Como',
      'how.titleAccent': 'Funciona',
      'how.step1.title': 'Elige',
      'how.step1.desc': 'Selecciona entre 83 tecnologias de frontend, backend, base de datos, DevOps y mas. Mezcla libremente.',
      'how.step2.title': 'Valida',
      'how.step2.desc': 'Verifica compatibilidad entre cada par automaticamente. Scores, grados y advertencias antes de escribir codigo.',
      'how.step3.title': 'Construye',
      'how.step3.desc': 'Genera tu proyecto con Docker, CI/CD, tests y configs de deploy. Todo conectado y listo para publicar.',
      'more.titlePrefix': 'Y',
      'more.titleAccent': 'Mucho Mas',
      'more.subtitle': 'Un ecosistema creciente de herramientas para cada etapa de tu flujo de desarrollo.',
      'more.cost.title': 'Estimador de Costos',
      'more.cost.desc': 'Estima costos mensuales en la nube para tu stack en AWS, GCP y Azure.',
      'more.profiles.title': 'Perfiles de Rendimiento',
      'more.profiles.desc': 'Optimiza por velocidad, costo o fiabilidad con perfiles de configuracion pre-ajustados.',
      'more.sharing.title': 'Compartir Stacks',
      'more.sharing.desc': 'Exporta y comparte tus stacks validados como JSON. Importa stacks de la comunidad al instante.',
      'more.team.title': 'Estandares de Equipo',
      'more.team.desc': 'Define y aplica politicas de stack en tu equipo con configuraciones compartidas.',
      'more.learning.title': 'Rutas de Aprendizaje',
      'more.learning.desc': 'Tutoriales interactivos para cada tecnologia de tu stack. Aprende mientras construyes.',
      'more.plugins.title': 'Sistema de Plugins',
      'more.plugins.desc': 'Extiende Stackweld con plugins de la comunidad. Validadores, generadores y analizadores.',
      'more.env.title': 'Sincronizar Env',
      'more.env.desc': 'Genera archivos .env con las variables correctas para cada servicio de tu stack.',
      'more.compare.title': 'Comparacion de Stacks',
      'more.compare.desc': 'Compara dos stacks lado a lado. Metricas de rendimiento, costo, complejidad y compatibilidad.',
      'more.deploy.title': 'Deploy en Cualquier Lugar',
      'more.deploy.desc': 'Genera configs de deploy para VPS, AWS, GCP, Vercel, Railway y mas.',
      'download.titlePrefix': 'Obtener',
      'download.titleAccent': 'Stackweld',
      'download.subtitle': 'Disponible en todas las plataformas principales. Gratuito y open source.',
      'download.detected': 'SO detectado:',
      'download.btnLinux': 'Descargar para Linux',
      'download.btnMac': 'Descargar para macOS',
      'download.btnWin': 'Descargar para Windows',
      'download.altLabel': 'O instalar via npm:',
      'download.allReleases': 'Ver todas las versiones en GitHub',
      'oss.title': 'Gratuito y Open Source',
      'oss.desc': 'Stackweld tiene licencia MIT. Usalo, haz fork, mejoralo. Contribuciones bienvenidas.',
      'oss.starBtn': 'Star en GitHub',
      'oss.contribBtn': 'Contribuidores',
      'footer.tagline': "The Developer's Forge",
      'footer.product': 'Producto',
      'footer.features': 'Funciones',
      'footer.download': 'Descargar',
      'footer.cli': 'CLI',
      'footer.resources': 'Recursos',
      'footer.docs': 'Documentacion',
      'footer.releases': 'Versiones',
      'footer.community': 'Comunidad',
      'footer.contributing': 'Contribuir',
      'footer.issues': 'Issues',
      'footer.discussions': 'Discusiones',
      'footer.copyright': '\u00A9 2026 Stackweld. Creado por Orlando Fernandez / XPlus Technologies LLC.',
      'footer.license': 'Publicado bajo la licencia MIT.',
    },
  };

  /* ── State ──────────────────────────────────────────────── */
  let currentLang = localStorage.getItem('fb-lang') || 'en';
  let currentTheme = localStorage.getItem('fb-theme') || 'light';

  /* ── Theme ──────────────────────────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('fb-theme', theme);
  }

  function toggleTheme() {
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  /* ── Language ───────────────────────────────────────────── */
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('fb-lang', lang);
    document.documentElement.setAttribute('lang', lang);

    const dict = translations[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // Update lang button label
    var langLabel = document.querySelector('#lang-toggle .lang-label');
    if (langLabel) {
      langLabel.textContent = lang === 'en' ? 'EN' : 'ES';
    }
  }

  function toggleLanguage() {
    applyLanguage(currentLang === 'en' ? 'es' : 'en');
  }

  /* ── Particle Canvas ────────────────────────────────────── */
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 60;
    var mouse = { x: -999, y: -999 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse repulsion
      var dx = this.x - mouse.x;
      var dy = this.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        var force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
      }

      // Wrap around
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    };

    Particle.prototype.draw = function () {
      var isDark = currentTheme === 'dark';
      var color = isDark ? '0, 227, 253' : '151, 32, 171';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + this.opacity + ')';
      ctx.fill();
    };

    // Create particles
    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      var isDark = currentTheme === 'dark';
      var color = isDark ? '0, 227, 253' : '151, 32, 171';
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(' + color + ',' + (0.06 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      drawConnections();
      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ── Scroll Reveal (IntersectionObserver) ───────────────── */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ── Counter Animation ──────────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var duration = 1500;
      var start = performance.now();

      function step(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(eased * target);
        el.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }
  }

  /* ── Copy to Clipboard ──────────────────────────────────── */
  function initCopyButton() {
    var btn = document.getElementById('copy-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var text = 'npm install -g @stackweld/cli';
      navigator.clipboard.writeText(text).then(function () {
        var copyIcon = btn.querySelector('.copy-icon');
        var checkIcon = btn.querySelector('.check-icon');
        if (copyIcon) copyIcon.style.display = 'none';
        if (checkIcon) checkIcon.style.display = 'block';

        setTimeout(function () {
          if (copyIcon) copyIcon.style.display = 'block';
          if (checkIcon) checkIcon.style.display = 'none';
        }, 2000);
      }).catch(function () {
        // Fallback
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); } catch (e) { /* noop */ }
        document.body.removeChild(textarea);
      });
    });
  }

  /* ── OS Detection ───────────────────────────────────────── */
  function detectOS() {
    var ua = navigator.userAgent || '';
    var platform = navigator.platform || '';
    var os = 'linux';
    var label = 'Linux';

    if (/Mac/i.test(platform) || /Mac/i.test(ua)) {
      os = 'macos';
      label = 'macOS';
    } else if (/Win/i.test(platform) || /Win/i.test(ua)) {
      os = 'windows';
      label = 'Windows';
    }

    // Update OS badge
    var badge = document.getElementById('detected-os');
    if (badge) badge.textContent = label;

    // Highlight platform card
    var cards = document.querySelectorAll('.platform-card');
    cards.forEach(function (card) {
      if (card.getAttribute('data-platform') === os) {
        card.classList.add('detected');
        card.setAttribute('data-detected-label', currentLang === 'es' ? 'Tu SO' : 'Your OS');
      }
    });
  }

  /* ── Mobile Menu ────────────────────────────────────────── */
  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      btn.classList.toggle('active');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on nav link click
    nav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = 80; // header height
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Header scroll effect ───────────────────────────────── */
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;

    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var current = window.pageYOffset;
      if (current > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
      } else {
        header.style.boxShadow = 'none';
      }
      lastScroll = current;
    }, { passive: true });
  }

  /* ── Initialize Everything ──────────────────────────────── */
  function init() {
    // Apply saved preferences
    applyTheme(currentTheme);
    applyLanguage(currentLang);

    // Bind toggles
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLanguage);

    // Init modules
    initParticles();
    initScrollReveal();
    initCounters();
    initCopyButton();
    detectOS();
    initMobileMenu();
    initSmoothScroll();
    initHeaderScroll();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
