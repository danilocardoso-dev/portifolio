(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const languageToggle = document.getElementById("langToggle");
  const hero = document.querySelector(".hero");
  const skipIntro = document.querySelector("[data-skip-intro]");
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const tau = Math.PI * 2;
  const readPreference = (key, fallback, session = false) => {
    try { return (session ? sessionStorage : localStorage).getItem(key) ?? fallback; }
    catch { return fallback; }
  };
  const savePreference = (key, value, session = false) => {
    try { (session ? sessionStorage : localStorage).setItem(key, value); }
    catch { /* Controls keep working without storage. */ }
  };
  const seeded = (seed) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  let language = readPreference("portfolio-lang", "pt") === "en" ? "en" : "pt";
  let userPaused = readPreference("portfolio-motion", "active") === "paused";
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let needsMeasure = true;
  let needsScroll = true;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let scrollHeight = 1;
  let slowFrames = 0;
  let adaptive = 1;
  let introTimer = 0;
  let introActive = false;
  const motionAllowed = () => !userPaused && !reduced.matches && !document.hidden;
  const pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0, lastX: 0, lastTime: 0, gust: 0, engaged: false };
  const wind = { force: 1, gust: 0, direction: 1, intensity: 1 };

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  const counters = [...document.querySelectorAll(".project-stats dt")].map((element) => {
    const original = element.textContent.trim();
    return { element, target: Number(original.replace(/\D/g, "")), suffix: original.includes("+") ? "+" : "", padded: /^0\d/.test(original) };
  }).filter((counter) => Number.isFinite(counter.target));
  const formatCounter = (counter, value = counter.target) => `${counter.padded ? String(value).padStart(2, "0") : new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US").format(value)}${counter.suffix}`;

  const progressTrack = document.createElement("div");
  progressTrack.className = "scroll-progress";
  progressTrack.setAttribute("aria-hidden", "true");
  progressTrack.innerHTML = "<span></span>";
  body.append(progressTrack);
  const motionControl = document.createElement("button");
  motionControl.type = "button";
  motionControl.className = "motion-control";
  motionControl.innerHTML = '<span class="motion-control-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="motion-control-label"></span>';
  body.append(motionControl);

  const updateLabels = () => {
    const paused = userPaused || reduced.matches;
    // A stable toggle name plus aria-pressed communicates the pause state.
    motionControl.setAttribute("aria-label", language === "pt" ? "Pausar animações" : "Pause animations");
    motionControl.setAttribute("aria-pressed", String(paused));
    motionControl.setAttribute("aria-disabled", String(reduced.matches));
    motionControl.querySelector(".motion-control-label").textContent = reduced.matches
      ? (language === "pt" ? "Reduzido" : "Reduced")
      : paused ? (language === "pt" ? "Retomar" : "Resume") : (language === "pt" ? "Pausar" : "Pause");
    motionControl.title = reduced.matches
      ? (language === "pt" ? "Movimento reduzido pelas preferências do sistema" : "Motion reduced by your system preferences")
      : paused ? (language === "pt" ? "Retomar animações" : "Resume animations") : (language === "pt" ? "Pausar animações" : "Pause animations");
    if (navToggle) {
      const label = navToggle.querySelector(".sr-only");
      const open = navToggle.getAttribute("aria-expanded") === "true";
      if (label) label.textContent = language === "pt" ? (open ? "Fechar menu" : "Abrir menu") : (open ? "Close menu" : "Open menu");
    }
  };
  const applyLanguage = (next) => {
    language = next === "en" ? "en" : "pt";
    root.lang = language === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-pt][data-en]").forEach((element) => { element.textContent = element.dataset[language]; });
    document.querySelectorAll("[data-meta-pt][data-meta-en]").forEach((element) => {
      element.setAttribute("content", element.dataset[language === "pt" ? "metaPt" : "metaEn"]);
    });
    document.querySelectorAll("[data-aria-pt][data-aria-en]").forEach((element) => {
      element.setAttribute("aria-label", element.dataset[language === "pt" ? "ariaPt" : "ariaEn"]);
    });
    const title = document.querySelector("title[data-title-pt][data-title-en]");
    if (title) document.title = title.dataset[language === "pt" ? "titlePt" : "titleEn"];
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
      try {
        const data = JSON.parse(structuredData.textContent);
        const page = (data["@graph"] || [data]).find((node) => node["@type"] === "WebPage");
        if (page) {
          page.inLanguage = root.lang;
          page.name = document.title;
          page.description = document.querySelector('meta[name="description"]')?.getAttribute("content") || page.description;
          structuredData.textContent = JSON.stringify(data);
        }
      } catch { /* Static SEO verification reports malformed JSON-LD. */ }
    }
    if (languageToggle) {
      languageToggle.textContent = language === "pt" ? "EN" : "PT";
      languageToggle.setAttribute("aria-label", language === "pt" ? "Mudar idioma para inglês" : "Switch language to Portuguese");
    }
    counters.forEach((counter) => { counter.element.textContent = formatCounter(counter); });
    updateLabels();
    savePreference("portfolio-lang", language);
    needsMeasure = true;
    requestTick();
  };
  const closeNavigation = (restoreFocus = false) => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    updateLabels();
    if (restoreFocus) navToggle.focus();
  };
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("is-open", open);
      body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      updateLabels();
    });
    nav.addEventListener("click", (event) => { if (event.target.closest("a")) closeNavigation(); });
    document.addEventListener("click", (event) => { if (!event.target.closest("[data-header]")) closeNavigation(); });
  }
  languageToggle?.addEventListener("click", () => applyLanguage(language === "pt" ? "en" : "pt"));

  const finishIntro = () => {
    introActive = false;
    window.clearTimeout(introTimer);
    body.classList.remove("is-intro");
    body.classList.add("intro-done");
    if (skipIntro) {
      if (document.activeElement === skipIntro) document.querySelector(".hero-actions a")?.focus({ preventScroll: true });
      skipIntro.hidden = true;
    }
  };
  const reveals = [...document.querySelectorAll(".reveal")];
  const chapters = [...document.querySelectorAll("[data-chapter], .hero, .case-hero, .project-chapter, .expertise-section, .about-section, .contact-section, .case-story-section")].map((element) => ({ element, top: 0, height: 0, visible: false }));
  const navigationLinks = [...document.querySelectorAll('.nav-links a[href^="#"], .case-toc a[href^="#"]')];
  const navigationSections = navigationLinks.map((link) => {
    const element = document.getElementById(link.hash.slice(1));
    return element ? { element, link, top: 0, height: 0 } : null;
  }).filter(Boolean);
  const revealAll = () => {
    reveals.forEach((element) => element.classList.add("is-visible"));
    counters.forEach((counter) => { counter.element.textContent = formatCounter(counter); });
  };
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
      requestTick();
    }, { rootMargin: "0px 0px -5%", threshold: 0.03 });
    reveals.forEach((element) => { element.classList.add("reveal-ready"); observer.observe(element); });
  } else revealAll();

  // Each scene keeps its last complete frame during a pause. Posters remain
  // visible until a Canvas context has successfully drawn the replacement.
  const scenes = [];
  const makeScene = (element, type, canvas) => {
    if (!canvas) return;
    let context;
    try { context = canvas.getContext("2d", { alpha: true }); }
    catch { return; }
    if (!context) return;
    const scene = { element, type, canvas, context, width: 0, height: 0, top: 0, visible: false, dirty: true, rendered: false, phase: type === "wind" ? 0 : 7, model: null };
    scenes.push(scene);
    return scene;
  };
  const journeyElement = document.querySelector("[data-journey-stage]");
  const journeyScene = journeyElement && window.PortfolioJourney
    ? makeScene(journeyElement, "journey", journeyElement.querySelector(".journey-canvas")) : null;
  if (journeyScene) journeyScene.director = window.PortfolioJourney.create(journeyScene, { foreground: document.querySelector("[data-journey-foreground]"), wake: requestTick });
  const storyAnchors = [...document.querySelectorAll("[data-scene]")].map(element => ({ element, value:Number(element.dataset.scene), top:0, height:0 }));
  if (hero && !journeyScene) makeScene(hero, "wind", hero.querySelector("[data-wind-canvas]"));
  document.querySelectorAll("[data-world]").forEach((element) => {
    if(element.dataset.world === "bridge" && !window.PortfolioBridge) return;
    const scene = makeScene(element, element.dataset.world, element.querySelector("canvas.world-canvas"));
    if(scene?.type === "bridge") scene.director = window.PortfolioBridge.create(scene);
  });

  const createWind = (scene) => {
    const random = seeded(17827);
    const mobile = viewportWidth < 768;
    const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const count = mobile ? 27 : lowPower ? 42 : 60;
    const leaves = Array.from({ length: count }, (_, index) => {
      const depth = index < count * .52 ? 0 : index < count * .94 ? 1 : 2;
      return { x: random() * scene.width, y: random() * scene.height * .87, depth, speed: [9,23,48][depth] * (.7 + random() * .65), size: [.9,2.1,mobile ? 3.3 : 4.8][depth] * (.8 + random() * .8), phase: random() * tau, angle: random() * tau, red: random() > .89, alpha: [.25,.42,.28][depth], vx: 0 };
    });
    const grass = Array.from({ length: mobile ? 30 : 65 }, () => ({
      x: scene.width * (random() < .36 ? random() * .27 : .72 + random() * .28), height: (mobile ? 30 : 44) + random() * (mobile ? 95 : 170), bend: 8 + random() * 24, phase: random() * tau
    }));
    return { leaves, grass };
  };
  const drawWind = (scene, delta) => {
    const { context: ctx, width, height, model } = scene;
    const time = scene.phase;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = .7;
    for (let index = 0; index < 4; index++) {
      const y = height * (.23 + index * .17) + Math.sin(time * .21 + index) * 18;
      const drift = Math.sin(time * .13 + index) * 26 + wind.gust * 6;
      ctx.beginPath();
      ctx.moveTo(width * .46 + drift, y + 40);
      ctx.bezierCurveTo(width * .62 + drift, y - 34, width * .72 + drift, y + 35, width * 1.08, y - 62);
      ctx.strokeStyle = `rgba(218,213,190,${.024 + index * .006})`;
      ctx.stroke();
    }
    model.grass.forEach((blade, index) => {
      const bend = blade.bend * wind.force + Math.sin(time * .63 + blade.phase) * 9 + wind.gust * 12;
      const base = height + 8 + Math.sin(index) * 18;
      ctx.beginPath();
      ctx.moveTo(blade.x, base);
      ctx.bezierCurveTo(blade.x + 4, base - blade.height * .33, blade.x + bend * .48, base - blade.height * .78, blade.x + bend, base - blade.height);
      ctx.strokeStyle = index % 5 === 0 ? "rgba(181,171,143,.27)" : "rgba(94,96,82,.3)";
      ctx.lineWidth = index % 4 === 0 ? 1.4 : .7;
      ctx.stroke();
      if (index % 3 === 0) {
        ctx.beginPath(); ctx.ellipse(blade.x + bend + 3, base - blade.height - 5, 1.6, 10, .32 + bend * .004, 0, tau);
        ctx.fillStyle = "rgba(174,163,131,.17)"; ctx.fill();
      }
    });
    model.leaves.forEach((leaf, index) => {
      if (adaptive < 1 && index % 3 === 0) return;
      leaf.vx = mix(leaf.vx, leaf.speed * wind.force + wind.gust * (leaf.depth + 1) * 13, Math.min(1, delta * 1.6));
      leaf.x += leaf.vx * delta;
      leaf.y += (Math.sin(time * .68 + leaf.phase + leaf.x / width * 2) * (3 + leaf.depth * 6) - 1.3) * delta;
      if (leaf.x > width + 50) { leaf.x = -50; leaf.y = (leaf.y + height * .37) % (height * .9); }
      if (leaf.y < -30) leaf.y = height * .8;
      ctx.save();
      ctx.translate(leaf.x + pointer.smoothX * leaf.depth * .35, leaf.y + pointer.smoothY * leaf.depth * .25);
      ctx.rotate(leaf.angle + Math.sin(time * .6 + leaf.phase) * 1.2 + time * (.08 + leaf.depth * .13));
      ctx.scale(leaf.size, leaf.size * (.6 + Math.abs(Math.sin(time * .9 + leaf.phase)) * .4));
      if (leaf.depth === 2 && viewportWidth > 768 && adaptive === 1) ctx.filter = "blur(.65px)";
      ctx.beginPath(); ctx.moveTo(-3, 0);
      ctx.bezierCurveTo(-1, -2.1, 2.6, -1.8, 4, .1); ctx.bezierCurveTo(1.7, 2.1, -.6, 1.8, -3, 0);
      ctx.fillStyle = leaf.red ? `rgba(157,58,45,${leaf.alpha + .12})` : `rgba(208,201,174,${leaf.alpha})`;
      ctx.fill(); ctx.restore();
    });
  };
  const polyline = (ctx, points, close = false) => {
    ctx.beginPath();
    points.forEach((point, index) => { if (index === 0) ctx.moveTo(point[0], point[1]); else ctx.lineTo(point[0], point[1]); });
    if (close) ctx.closePath();
  };
  const dot = (ctx, x, y, radius, color) => {
    ctx.beginPath(); ctx.arc(x, y, radius, 0, tau); ctx.fillStyle = color; ctx.fill();
  };
  const glow = (ctx, x, y, radius, color) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color); gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  const createWorld = (type) => {
    if (type === "mapcloud") {
      const contours = Array.from({ length: 23 }, (_, ring) => Array.from({ length: 110 }, (_, index) => {
        const angle = index / 109 * tau;
        const radius = (38 + Math.pow(ring / 22,1.24) * 395) * (1 + .18 * Math.sin(angle * 3 + ring * .06) + .055 * Math.cos(angle * 7));
        return [555 + Math.cos(angle) * radius * 1.3 + Math.sin(angle * 2) * 32, 360 + Math.sin(angle) * radius * .77 + ring * 1.7];
      }));
      return { contours, routes: [ [[65,492],[205,419],[318,433],[421,307],[561,330],[663,238],[820,176]], [[137,130],[288,216],[421,307],[513,470],[706,521],[894,456]], [[205,419],[233,563],[394,599],[513,470]] ] };
    }
    if (type === "atlas3d") {
      const vertices = [], edges = [], rows = 24, cols = 28;
      for (let row = 0; row < rows; row++) {
        const u = row / rows * tau;
        for (let col = 0; col < cols; col++) {
          const v = col / cols * tau;
          const radius = 160 + Math.cos(v) * 60;
          // The lifted double wave gives the torus a folded, sculptural surface.
          vertices.push([Math.cos(u) * radius, Math.sin(v) * 78 + Math.sin(u * 2) * 58, Math.sin(u) * radius]);
          const index = row * cols + col;
          edges.push([index, row * cols + (col + 1) % cols, false]);
          edges.push([index, (row + 1) % rows * cols + col, col === 5]);
        }
      }
      return { vertices, edges };
    }
    const random = seeded(91137);
    const branchAngles=[-.8,-.38,.1,.46,1.55,2.4,2.75,3.18];
    const branches = branchAngles.map((angle, branch) => {
      return Array.from({ length: branch===4?4:6 }, (_, depth) => {
        const distance = 38 + depth * (branch<4?42:31);
        const turn = angle + Math.sin(depth * .55 + branch) * .19;
        const origin=branch<4?[400,310]:[530,395];
        return [origin[0] + Math.cos(turn) * distance * 1.28 + (random() - .5) * 24, origin[1] + Math.sin(turn) * distance * .88, depth];
      });
    });
    return { branches };
  };

  const drawMap = (ctx, scene) => {
    const time = scene.phase;
    const paper = body.classList.contains("case-mapcloud");
    glow(ctx, 570, 345, 370, "rgba(121,138,111,.15)");
    scene.model.contours.forEach((points, index) => {
      polyline(ctx, points, true);
      ctx.lineWidth = index % 4 === 0 ? 1 : .65;
      ctx.strokeStyle = paper
        ? (index % 4 === 0 ? "rgba(62,78,64,.38)" : "rgba(77,94,74,.21)")
        : (index % 4 === 0 ? "rgba(196,201,171,.25)" : "rgba(154,163,136,.14)");
      ctx.stroke();
    });
    for (let x = 80; x < 960; x += 110) {
      for (let y = 70; y < 720; y += 110) {
        if((x+y)%3===0||x>680||y>510)continue;
        ctx.strokeStyle = paper ? "rgba(64,76,58,.2)" : "rgba(207,204,185,.16)"; ctx.lineWidth = .6;
        polyline(ctx, [[x-3,y],[x+3,y]]); ctx.stroke();
        polyline(ctx, [[x,y-3],[x,y+3]]); ctx.stroke();
      }
    }
    scene.model.routes.forEach((route, index) => {
      polyline(ctx, route);
      ctx.lineWidth = index === 0 ? 1.8 : 1;
      ctx.strokeStyle = index === 0 ? "rgba(174,73,55,.8)" : paper ? "rgba(57,78,58,.5)" : "rgba(203,207,182,.36)"; ctx.stroke();
      route.forEach(([x, y], node) => {
        dot(ctx, x, y, index === 0 ? 3 : 2, paper ? "rgba(47,65,48,.8)" : "rgba(229,220,195,.8)");
        if (node % 2 === 0) {
          ctx.strokeStyle = paper ? "rgba(66,80,56,.3)" : "rgba(223,209,177,.2)";
          ctx.beginPath(); ctx.arc(x, y, 10, 0, tau); ctx.stroke();
        }
      });
      const position = ((time * (index===0?.067:.036) + index * .3) % 1) * (route.length - 1);
      const start = route[Math.floor(position)], end = route[Math.min(route.length - 1, Math.floor(position) + 1)];
      const x = mix(start[0], end[0], position % 1), y = mix(start[1], end[1], position % 1);
      const arrival=Math.sin(position/(route.length-1)*Math.PI)**2;
      glow(ctx, x, y, 24, `rgba(185,79,54,${arrival*(index===0?.28:.09)})`); dot(ctx, x, y, index===0?3.6:2, `rgba(161,74,52,${arrival})`);
    });
    [0, .5].forEach((offset) => {
      const pulse = (time * .11 + offset) % 1;
      ctx.beginPath(); ctx.arc(421, 307, 14 + pulse * 55, 0, tau);
      ctx.strokeStyle = `rgba(193,104,77,${(1 - pulse) * .42})`; ctx.lineWidth = 1; ctx.stroke();
    });
    ctx.font = "10px ui-monospace, monospace"; ctx.fillStyle = paper ? "rgba(44,63,46,.62)" : "rgba(210,210,184,.42)"; ctx.fillText("N", 866, 93);
    polyline(ctx, [[870,104],[870,149],[866,141],[870,104],[874,141]]);
    ctx.strokeStyle = paper ? "rgba(44,63,46,.55)" : "rgba(210,210,184,.38)"; ctx.stroke();
  };
  const drawAtlas = (ctx, scene) => {
    const angle = -.47 + Math.sin(scene.phase * .024) * .48 + pointer.smoothX * .002, tilt = -.48 + Math.sin(scene.phase * .055) * .035 + pointer.smoothY * .003;
    const yawCos = Math.cos(angle), yawSin = Math.sin(angle), tiltCos = Math.cos(tilt), tiltSin = Math.sin(tilt);
    const project = ([x, y, z]) => {
      const rx = x * yawCos + z * yawSin, rz = z * yawCos - x * yawSin;
      const ry = y * tiltCos - rz * tiltSin, depth = y * tiltSin + rz * tiltCos;
      const perspective = 940 / (940 + depth) * 1.24;
      return [480 + rx * perspective, 354 + ry * perspective, depth];
    };
    glow(ctx, 480, 354, 330, "rgba(171,174,164,.1)");
    ctx.lineWidth = .7;
    for (let index = -3; index <= 3; index+=2) {
      polyline(ctx, [project([index * 75, 245, -310]), project([index * 75, 245, 310])]);
      ctx.strokeStyle = "rgba(164,170,157,.09)"; ctx.stroke();
      polyline(ctx, [project([-310, 245, index * 75]), project([310, 245, index * 75])]); ctx.stroke();
    }
    const vertices = scene.model.vertices.map(project);
    scene.model.edges.forEach(([from, to, seam], index) => {
      const a = vertices[from], b = vertices[to], depth = (a[2] + b[2]) * .5;
      if (!seam && (adaptive < 1 || viewportWidth < 768) && depth > 0 && index % 3 === 0) return;
      const alpha = .025 + Math.pow(clamp((180 - depth) / 350),1.5) * .45;
      polyline(ctx, [a, b]);
      ctx.strokeStyle = seam ? `rgba(184,112,82,${alpha + .12})` : `rgba(215,211,193,${alpha})`;
      ctx.lineWidth = seam ? 1.4 : depth < 0 ? .8 : .6;
      ctx.stroke();
    });
    const orbit = Array.from({ length: 101 }, (_, index) => {
      const phase = index / 100 * tau;
      return project([Math.cos(phase) * 260, 218, Math.sin(phase) * 260]);
    });
    polyline(ctx, orbit); ctx.strokeStyle = "rgba(178,182,165,.16)"; ctx.lineWidth = .7; ctx.stroke();
    const markerAngle = scene.phase * .08, seamAngle = 5 / 28 * tau, seamRadius = 160 + Math.cos(seamAngle) * 60;
    const marker = project([Math.cos(markerAngle) * seamRadius, Math.sin(seamAngle) * 78 + Math.sin(markerAngle * 2) * 58, Math.sin(markerAngle) * seamRadius]);
    dot(ctx, marker[0], marker[1], 2.6, "#c1896f");
    const origin = project([0, 0, 0]);
    [[315,0,0,"X"],[0,-310,0,"Y"],[0,0,315,"Z"]].forEach((axis) => {
      const end = project(axis); polyline(ctx, [origin, end]);
      ctx.strokeStyle = "rgba(196,196,175,.22)"; ctx.setLineDash([3,7]); ctx.lineWidth = .7; ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "10px ui-monospace, monospace"; ctx.fillStyle = "rgba(218,214,196,.56)"; ctx.fillText(axis[3], end[0] + 8, end[1] - 8);
    });
  };
  const drawAzriel = (ctx, scene) => {
    const time = scene.phase;
    glow(ctx, 460, 347, 300, "rgba(132,105,75,.11)");
    for (let line = 0; line < 3; line++) {
      const points = Array.from({ length: 100 }, (_, index) => {
        const x = index / 99 * 960, envelope = Math.exp(-Math.pow((x - 480) / 300, 2));
        const wave = Math.sin(x * .012 - time * .35 + line * .23) * 44 + Math.sin(x * .027 + time * .21) * 17;
        return [x, 348 + wave * envelope + (line - 2.5) * 13];
      });
      polyline(ctx, points); ctx.strokeStyle = `rgba(203,188,154,${line === 1 ? .19 : .04})`; ctx.lineWidth = line === 1 ? 1.1 : .7; ctx.stroke();
    }
    scene.model.branches.forEach((branch, index) => {
      polyline(ctx, branch); ctx.strokeStyle = `rgba(204,190,157,${index===1?.36:.12})`; ctx.lineWidth = index===1?1.3:.7; ctx.stroke();
      branch.forEach(([x,y,depth]) => {
        const phase = (time * .14 - depth * .11 + index * .087 + 10) % 1;
        const alpha = .16 + Math.pow(Math.max(0, Math.cos(phase*tau)),16) * (index===4?.1:index<4?.7:.3);
        dot(ctx, x, y, depth === 5 ? 2 : 2.6, `rgba(216,195,155,${alpha})`);
        if (depth % 2 === 0) {
          ctx.beginPath(); ctx.arc(x, y, 8 + phase * 11, 0, tau);
          ctx.strokeStyle = `rgba(170,123,88,${(1 - phase) * .16})`; ctx.lineWidth = .6; ctx.stroke();
        }
      });
      if (index % 2 === 0) {
        const next = scene.model.branches[(index + 1) % scene.model.branches.length];
        polyline(ctx, [branch[2], next[3]]); ctx.strokeStyle = "rgba(189,178,151,.1)";
        ctx.setLineDash([2,7]); ctx.stroke(); ctx.setLineDash([]);
      }
    });
    const pulse = .75 + Math.sin(time * .85) * .25;
    glow(ctx, 460, 347, 65, `rgba(162,67,45,${pulse * .24})`); dot(ctx, 460, 347, 7, "#bd8063");
    ctx.beginPath(); ctx.arc(460, 347, 18, 0, tau); ctx.strokeStyle = "rgba(184,125,92,.53)"; ctx.lineWidth = 1; ctx.stroke();
  };
  const renderScene = (scene, delta) => {
    if (!scene.width || !scene.height) return;
    scene.phase += delta;
    if (scene.director) scene.director.render(delta, wind, pointer, adaptive, introActive);
    else if (scene.type === "wind") drawWind(scene, delta);
    else {
      const ctx = scene.context;
      ctx.clearRect(0, 0, scene.width, scene.height); ctx.save();
      scene.approachVisual = mix(scene.approachVisual ?? (scene.approach || 0), scene.approach || 0, 1-Math.exp(-delta*10));
      const scale = Math.min(scene.width / 960, scene.height / 650) * 1.13 * (1 + scene.approachVisual * .14);
      ctx.translate((scene.width - 960 * scale) / 2, (scene.height - 720 * scale) / 2); ctx.scale(scale, scale);
      ctx.translate(Math.sin(scene.phase * .05) * 9 + pointer.smoothX * .65, Math.sin(scene.phase * .07) * 6 + pointer.smoothY * .5);
      if (scene.type === "mapcloud") drawMap(ctx, scene);
      else if (scene.type === "atlas3d") drawAtlas(ctx, scene);
      else drawAzriel(ctx, scene);
      ctx.restore();
    }
    scene.dirty = false;
    if (!scene.rendered) { scene.rendered = true; scene.element.classList.add("is-rendered"); }
  };

  const measure = () => {
    viewportWidth = window.innerWidth; viewportHeight = window.innerHeight;
    scrollHeight = Math.max(1, root.scrollHeight - viewportHeight);
    const scrollY = window.scrollY;
    // Batch layout reads first; canvas allocation/style updates follow below.
    const sceneBounds = scenes.map((scene) => scene.element.getBoundingClientRect());
    const chapterBounds = chapters.map((chapter) => chapter.element.getBoundingClientRect());
    const sectionBounds = navigationSections.map((section) => section.element.getBoundingClientRect());
    const storyBounds = storyAnchors.map(anchor => anchor.element.getBoundingClientRect());
    scenes.forEach((scene, index) => {
      const bounds = sceneBounds[index];
      scene.top = bounds.top + scrollY;
      const width = scene.type === "journey" ? viewportWidth : Math.max(1, Math.round(bounds.width));
      const height = scene.type === "journey" ? viewportHeight : Math.max(1, Math.round(bounds.height));
      const ratio = Math.min(window.devicePixelRatio || 1, viewportWidth < 801 ? 1.25 : 1.5);
      if (width !== scene.width || height !== scene.height || scene.ratio !== ratio) {
        scene.width = width; scene.height = height; scene.ratio = ratio;
        scene.canvas.width = Math.round(width * ratio); scene.canvas.height = Math.round(height * ratio);
        scene.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        if (scene.director) scene.director.resize(width, height, ratio);
        else scene.model = scene.type === "wind" ? createWind(scene) : createWorld(scene.type);
        scene.dirty = true;
      }
    });
    chapters.forEach((chapter, index) => { chapter.top = chapterBounds[index].top + scrollY; chapter.height = chapterBounds[index].height; });
    navigationSections.forEach((section, index) => { section.top = sectionBounds[index].top + scrollY; section.height = sectionBounds[index].height; });
    storyAnchors.forEach((anchor, index) => { anchor.top = storyBounds[index].top + scrollY; anchor.height = storyBounds[index].height; });
    needsMeasure = false; needsScroll = true;
  };
  const updateScroll = () => {
    const scrollY = window.scrollY;
    root.style.setProperty("--scroll-progress", clamp(scrollY / scrollHeight).toFixed(4));
    header?.classList.toggle("is-scrolled", scrollY > 24);
    if (hero && motionAllowed()) hero.style.setProperty("--depth", `${Math.round(Math.min(scrollY, viewportHeight) * .085)}px`);
    scenes.forEach((scene) => {
      scene.visible = scene.type === "journey" || (scene.top < scrollY + viewportHeight && scene.top + scene.height > scrollY);
      if (scene.director) scene.director.scroll(scrollY, storyAnchors, reduced.matches, userPaused, viewportHeight);
      else if (motionAllowed()) scene.approach = clamp((scrollY - scene.top) / viewportHeight);
      if(scene.top < scrollY+viewportHeight*1.3 && scene.top+scene.height > scrollY) scene.director?.prepare?.();
    });
    let activeChapter = null;
    chapters.forEach((chapter) => {
      const visible = chapter.top < scrollY + viewportHeight && chapter.top + chapter.height > scrollY;
      if (visible !== chapter.visible) { chapter.visible = visible; chapter.element.classList.toggle("in-view", visible); }
      // Editorial depth stays subtle and never gates the actual readable text.
      const passage = motionAllowed() ? clamp((chapter.top-scrollY)/viewportHeight,-1,1) : 0;
      chapter.element.style.setProperty("--copy-travel", `${(passage*(viewportWidth<801?8:18)).toFixed(1)}px`);
      if (chapter.top <= scrollY + viewportHeight * .58 && chapter.top + chapter.height > scrollY + viewportHeight * .42) activeChapter = chapter;
    });
    if (activeChapter) body.dataset.chapter = activeChapter.element.dataset.chapter || activeChapter.element.id || "projects";
    const activeSection = navigationSections.filter((section) => section.top <= scrollY + viewportHeight * .4).at(-1);
    navigationSections.forEach((section) => {
      if (section === activeSection) section.link.setAttribute("aria-current", "location");
      else section.link.removeAttribute("aria-current");
    });
    if (introActive && scrollY > 24) finishIntro();
    needsScroll = false;
  };

  // One cancelable scheduler owns wind, worlds and pointer inertia.
  // No continuous frame is requested when animation is paused or offscreen.
  function requestTick() {
    if (!frame && !document.hidden) frame = window.requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    if (document.hidden) return;
    const gap = previousTime ? now - previousTime : 16;
    const delta = Math.min(gap, 50) / 1000;
    previousTime = now;
    if (needsMeasure) measure();
    if (needsScroll) updateScroll();
    const active = motionAllowed();
    if (active) {
      elapsed += delta;
      if (gap > 32 && gap < 180) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - .25);
      if (slowFrames > 55) adaptive = .65;
      pointer.gust *= Math.exp(-delta * 1.5);
      wind.gust = mix(wind.gust, pointer.gust, 1 - Math.exp(-delta * 3));
      wind.intensity = journeyScene?.director.energy ?? 1;
      wind.direction = 1 + Math.sin(elapsed * .07) * .15;
      wind.force = (1 + Math.sin(elapsed * .31) * .24 + Math.sin(elapsed * .73 + 1.7) * .13 + Math.abs(wind.gust) * .22) * wind.intensity * wind.direction;
      pointer.smoothX = mix(pointer.smoothX, pointer.x, 1 - Math.exp(-delta * 2.4));
      pointer.smoothY = mix(pointer.smoothY, pointer.y, 1 - Math.exp(-delta * 2.4));
      if (hero && scenes.some((scene) => scene.type === "wind" && scene.visible)) {
        hero.style.setProperty("--camera-x", `${pointer.smoothX.toFixed(2)}px`);
        hero.style.setProperty("--camera-y", `${pointer.smoothY.toFixed(2)}px`);
        hero.style.setProperty("--wind", wind.force.toFixed(3));
        hero.style.setProperty("--gust-x", `${(wind.gust * 8).toFixed(2)}px`);
      }
    }
    scenes.forEach((scene) => { if (scene.visible && ((active && scene.director?.animate !== false) || scene.dirty)) renderScene(scene, active && scene.director?.animate !== false ? delta : 0); });
    if (active && scenes.some((scene) => scene.visible && scene.director?.animate !== false)) requestTick();
    else previousTime = 0;
  }
  const syncMotion = () => {
    // Root classes also stop CSS smooth anchor scrolling when motion is paused.
    root.classList.toggle("motion-paused", userPaused || reduced.matches);
    root.classList.toggle("motion-reduced", reduced.matches);
    body.classList.toggle("motion-paused", userPaused || reduced.matches);
    body.classList.toggle("motion-reduced", reduced.matches);
    body.classList.toggle("page-hidden", document.hidden);
    updateLabels();
    if (!motionAllowed()) {
      window.cancelAnimationFrame(frame); frame = 0; previousTime = 0;
      finishIntro();
      if (userPaused || reduced.matches) revealAll();
    }
    needsScroll = true; requestTick();
  };
  motionControl.addEventListener("click", () => {
    if (reduced.matches) return;
    userPaused = !userPaused;
    savePreference("portfolio-motion", userPaused ? "paused" : "active"); syncMotion();
  });
  reduced.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  window.addEventListener("pagehide", () => { window.cancelAnimationFrame(frame); frame = 0; previousTime = 0; });
  window.addEventListener("pageshow", () => { needsMeasure = true; syncMotion(); });
  window.addEventListener("scroll", () => { needsScroll = true; requestTick(); }, { passive: true });
  window.addEventListener("resize", () => {
    needsMeasure = true;
    if (window.innerWidth > 800) closeNavigation();
    requestTick();
  }, { passive: true });
  window.addEventListener("pointermove", (event) => {
    if (!motionAllowed() || !finePointer.matches || event.pointerType === "touch" || !scenes.some(scene => scene.visible)) return;
    pointer.x = (event.clientX / viewportWidth - .5) * 15;
    pointer.y = (event.clientY / viewportHeight - .5) * 10;
    pointer.engaged = true;
    const now = performance.now();
    if (pointer.lastTime && now - pointer.lastTime < 120) {
      const velocity = (event.clientX - pointer.lastX) / Math.max(8, now - pointer.lastTime);
      pointer.gust = clamp(pointer.gust + velocity * .2, -.65, 1.8);
    }
    pointer.lastX = event.clientX; pointer.lastTime = now;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer.x = 0; pointer.y = 0; pointer.engaged = false; });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { finishIntro(); if (nav?.classList.contains("is-open")) closeNavigation(true); }
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("a, [data-skip-intro], [data-nav-toggle]")) finishIntro();
  });
  document.addEventListener("focusin", (event) => {
    if (introActive && event.target.closest("a, [data-nav-toggle], #langToggle")) finishIntro();
  });
  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => { needsMeasure = true; requestTick(); });
    resizeObserver.observe(body);
    scenes.forEach((scene) => resizeObserver.observe(scene.element));
  }
  document.fonts?.ready.then(() => { needsMeasure = true; requestTick(); });
  root.classList.add("js", "js-ready");
  applyLanguage(language);
  syncMotion();
  if (hero && body.classList.contains("page-home") && motionAllowed() && window.scrollY < 24 && readPreference("portfolio-intro-seen-v3", "", true) !== "yes") {
    introActive = true; body.classList.remove("intro-done"); body.classList.add("is-intro");
    if (skipIntro) skipIntro.hidden = false;
    savePreference("portfolio-intro-seen-v3", "yes", true);
    introTimer = window.setTimeout(finishIntro, 2800);
  } else finishIntro();
})();
