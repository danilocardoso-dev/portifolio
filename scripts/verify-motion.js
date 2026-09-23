"use strict";

// Behavior checks for the native scheduler, without browser dependencies.
// Visual fidelity, focus order and real layout are verified in the browser.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../js/main.js"), "utf8");

function environment({ reduce = false, canvas = true, journey = false, width = 1100 } = {}) {
  const callbacks = new Map();
  const timers = new Map();
  let nextId = 0;
  let now = 0;
  let scroll = 0;
  const storage = new Map();
  const events = () => ({
    listeners: new Map(),
    addEventListener(type, callback) {
      const listeners = this.listeners.get(type) || [];
      listeners.push(callback);
      this.listeners.set(type, listeners);
    },
    emit(type, event = {}) { (this.listeners.get(type) || []).forEach((callback) => callback(event)); }
  });
  const element = (top = 0, height = 650) => {
    const classes = new Set();
    const attributes = new Map();
    const properties = new Map();
    return {
      ...events(), top, height, dataset: {}, textContent: "", hidden: false, children: [],
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        contains: (name) => classes.has(name),
        toggle(name, force) { const value = force ?? !classes.has(name); if (value) classes.add(name); else classes.delete(name); return value; }
      },
      style: { setProperty(name,value) { properties.set(name,value); }, getPropertyValue(name) {return properties.get(name)||"";} },
      append(child) { this.children.push(child); },
      setAttribute(name, value) { attributes.set(name, String(value)); },
      getAttribute(name) { return attributes.get(name) || null; },
      removeAttribute(name) { attributes.delete(name); },
      getBoundingClientRect() { return { top: this.top - scroll, height: this.height, width: 1100, left: 0 }; },
      querySelector(selector) { return selector === ".motion-control-label" ? (this.label ||= element()) : null; },
      closest() { return null; },
      contains(candidate) { return this.children.includes(candidate); },
      focus() {}
    };
  };
  const root = element();
  root.scrollHeight = 7000;
  const body = element();
  body.classList.add("page-home");
  const header = element();
  const hero = element(0, 900);
  const skip = element();
  const language = element();
  const year = element();
  const firstCounter = element(); firstCounter.textContent = "1.000+";
  const paddedCounter = element(); paddedCounter.textContent = "06";
  const sceneElements = [hero];
  const stage = element(0,700);
  const foreground = element(0,700);
  const anchors = Array.from({length:7},(_,index) => {
    const anchor = index===0 ? hero : element(1400*index,1400);
    anchor.dataset.scene=String(index);
    return anchor;
  });
  const worlds = ["mapcloud", "atlas3d", "azriel"].map((type, index) => {
    const world = element(1200 + index * 1200);
    world.dataset.world = type;
    sceneElements.push(world);
    return world;
  });
  for (const scene of [...sceneElements, stage, foreground]) {
    const context = new Proxy({ draws: 0 }, {
      get(target, key) {
        if (key === "clearRect") return () => { target.draws++; };
        if (key === "createRadialGradient") return () => ({ addColorStop() {} });
        return key in target ? target[key] : () => {};
      }
    });
    scene.context = context;
    scene.canvas = { getContext: () => canvas ? context : null };
    scene.querySelector = () => scene.canvas;
  }
  const media = { ...events(), matches: reduce };
  const document = {
    ...events(), documentElement: root, body, hidden: false, activeElement: null,
    createElement: () => element(),
    getElementById: (id) => id === "langToggle" ? language : id === "year" ? year : null,
    querySelector(selector) {
      if (selector === ".hero") return hero;
      if (selector === "[data-header]") return header;
      if (selector === "[data-skip-intro]") return skip;
      if (selector === "[data-journey-stage]") return journey ? stage : null;
      if (selector === "[data-journey-foreground]") return journey ? foreground.canvas : null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === ".project-stats dt") return [firstCounter, paddedCounter];
      if (selector === "[data-world]") return journey ? [] : worlds;
      if (selector === "[data-scene]") return journey ? anchors : [];
      if (selector.startsWith("[data-chapter]")) return sceneElements;
      return [];
    }
  };
  const window = {
    ...events(), innerWidth: width, innerHeight: 700, devicePixelRatio: 3,
    get scrollY() { return scroll; },
    matchMedia: (query) => query.includes("reduced-motion") ? media : { matches: true },
    requestAnimationFrame(callback) { const id = ++nextId; callbacks.set(id, callback); return id; },
    cancelAnimationFrame: (id) => callbacks.delete(id),
    setTimeout(callback) { const id = ++nextId; timers.set(id, callback); return id; },
    clearTimeout: (id) => timers.delete(id)
  };
  const localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  let director;
  const sandbox={ document, window, localStorage, sessionStorage: localStorage, navigator: { hardwareConcurrency: 8 }, performance: { now: () => now }, Intl, console, Image:class {complete=false;naturalWidth=0;} };
  if(journey){
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../js/journey.js"),"utf8"),sandbox);
    const factory=window.PortfolioJourney;
    window.PortfolioJourney={...factory,create(...args){director=factory.create(...args);return director;}};
  }
  vm.runInNewContext(source, sandbox);
  return {
    root, body, document, window, media, hero, worlds, firstCounter, paddedCounter, language, skip, stage, anchors,
    director:()=>director,
    control: body.children.find((child) => child.className === "motion-control"),
    pending: () => callbacks.size,
    frame(ms=16) {
      assert.ok(callbacks.size <= 1, "Only one central animation frame may be queued");
      now += ms;
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach((callback) => callback(now));
    },
    scrollTo(value) { scroll = value; window.emit("scroll"); },
    hidden(value) { document.hidden = value; document.emit("visibilitychange"); },
    reduced(value) { media.matches = value; media.emit("change"); }
  };
}

const page = environment();
assert.equal(page.root.classList.contains("js"), true, "Mobile enhancement marker is present");
assert.equal(page.body.classList.contains("is-intro"), true);
page.frame();
assert.equal(page.pending(), 1, "Visible wind keeps one animation frame queued");
assert.equal(page.hero.context.draws, 1);
assert.equal(page.hero.canvas.width, 1650, "Canvas DPR is capped at 1.5");
page.control.emit("click");
const beforePause = page.hero.context.draws;
page.frame();
assert.equal(page.pending(), 0, "Pause stops the scheduler");
assert.equal(page.hero.context.draws, beforePause, "Pause preserves the last frame");
assert.equal(page.hero.classList.contains("is-rendered"), true);
assert.equal(page.body.classList.contains("is-intro"), false, "Pausing safely completes opening");
page.scrollTo(1200);
page.frame();
assert.equal(page.worlds[0].context.draws, 1, "A paused world is drawn once on first entry");
assert.equal(page.pending(), 0);
page.control.emit("click");
page.frame();
assert.equal(page.worlds[0].context.draws, 2, "Resume animates the current world");
page.scrollTo(4900);
page.frame();
assert.equal(page.pending(), 0, "All offscreen scenes stop scheduling");
page.scrollTo(0);
page.frame();
assert.equal(page.pending(), 1, "Entering a scene restarts scheduling");
page.hidden(true);
assert.equal(page.pending(), 0, "Hidden document immediately cancels its frame");
assert.equal(page.body.classList.contains("page-hidden"), true);
page.hidden(false);
page.frame();
assert.equal(page.pending(), 1, "Returning to the tab restarts visible motion");
page.reduced(true);
const beforeReduced = page.hero.context.draws;
page.frame();
assert.equal(page.pending(), 0, "Live reduced-motion change stops motion");
assert.equal(page.hero.context.draws, beforeReduced);
assert.equal(page.control.getAttribute("aria-disabled"), "true");
page.control.emit("click");
assert.equal(page.pending(), 0, "Reduced-motion cannot be accidentally overridden");
page.reduced(false);
page.frame();
assert.equal(page.pending(), 1);
page.language.emit("click");
assert.equal(page.root.lang, "en");
assert.equal(page.firstCounter.textContent, "1,000+", "Counters reformat for the selected language");
assert.equal(page.paddedCounter.textContent, "06");
assert.equal(page.control.getAttribute("aria-label"), "Pause animations");
page.scrollTo(2400); page.frame();
assert.ok(page.worlds[1].context.draws > 0, "Atlas world renders");
page.scrollTo(3600); page.frame();
assert.ok(page.worlds[2].context.draws > 0, "Azriel world renders");

const staticPage = environment({ reduce: true });
staticPage.frame();
assert.equal(staticPage.pending(), 0, "Initial reduced-motion needs no continuous frame");
assert.equal(staticPage.hero.context.draws, 1, "Reduced-motion gets a complete static wind composition");
assert.equal(staticPage.body.classList.contains("is-intro"), false);
const fallback = environment({ canvas: false });
fallback.frame();
assert.equal(fallback.pending(), 0);
assert.equal(fallback.hero.classList.contains("is-rendered"), false, "Failed Canvas keeps the poster fallback");
console.log("Motion checks passed: one scheduler, pause/resume, offscreen, hidden tab, live reduced motion, static fallbacks, DPR cap, all worlds, PT/EN counters.");

const journeyPage=environment({journey:true});
journeyPage.frame();
assert.equal(journeyPage.body.classList.contains("journey-ready"),true);
assert.equal(journeyPage.stage.canvas.width,1650);
journeyPage.scrollTo(2800);journeyPage.frame();
assert.equal(journeyPage.stage.dataset.scene,"2","Fixed stage survives scrolling past the hero");
assert.equal(journeyPage.pending(),1);
assert.ok(journeyPage.director().inspect().vertices>=700,"One mesh supplies the three worlds");
journeyPage.control.emit("click");journeyPage.frame();
const frozen=journeyPage.director().inspect();
assert.equal(journeyPage.pending(),0);
journeyPage.scrollTo(4200);journeyPage.frame();
assert.equal(journeyPage.director().inspect().phase,frozen.phase,"Paused scroll changes composition, not animation time");
assert.equal(journeyPage.stage.dataset.scene,"3");
assert.equal(journeyPage.pending(),0,"Paused scene redraw does not start a continuous loop");
const pausedDraws=journeyPage.stage.context.draws;
journeyPage.frame();assert.equal(journeyPage.stage.context.draws,pausedDraws);
journeyPage.control.emit("click");journeyPage.frame();
journeyPage.scrollTo(6000);journeyPage.frame();
assert.equal(journeyPage.pending(),1,"A quiet destination keeps one frame until damping settles");
for(let i=0;i<120;i++)journeyPage.frame();
assert.equal(journeyPage.pending(),0,"Craft genuinely sleeps instead of rendering an invisible effect");
journeyPage.scrollTo(7100);for(let i=0;i<120;i++)journeyPage.frame();assert.equal(journeyPage.pending(),0,"About is a quiet composition");
journeyPage.scrollTo(8400);journeyPage.frame();assert.equal(journeyPage.pending(),1,"Wind returns for the final scene");
journeyPage.hidden(true);assert.equal(journeyPage.pending(),0);
journeyPage.hidden(false);journeyPage.frame();assert.equal(journeyPage.pending(),1);
journeyPage.reduced(true);journeyPage.frame();assert.equal(journeyPage.pending(),0);
journeyPage.scrollTo(2200);journeyPage.frame();
assert.equal(Number.isInteger(journeyPage.director().inspect().pose),true,"Reduced motion uses directed static worlds, not intermediate morphs");
assert.equal(journeyPage.pending(),0);
journeyPage.language.emit("click");journeyPage.frame();assert.equal(journeyPage.pending(),0);
assert.equal(journeyPage.firstCounter.textContent,"1,000+");
journeyPage.reduced(false);journeyPage.frame();
// With time frozen, nearby scroll positions must never replace or reset topology.
journeyPage.control.emit("click");journeyPage.frame();
// Paused calls intentionally cannot advance time, even with a huge delta.
const phaseBeforeLongPause=journeyPage.director().inspect().phase;
journeyPage.director().render(600,{force:1,gust:0},{smoothX:0,smoothY:0,engaged:false},1,false);
assert.equal(journeyPage.director().inspect().phase,phaseBeforeLongPause);
let previous=null;
for(let y=2000;y<=3100;y+=5){
  journeyPage.scrollTo(y);journeyPage.frame();
  const current=journeyPage.director().inspect();
  assert.ok(current.projected.every(point=>point.every(Number.isFinite)));
  if(previous){
    assert.equal(current.vertices,previous.vertices);
    const displacement=Math.max(...current.projected.map((point,i)=>Math.hypot(point[0]-previous.projected[i][0],point[1]-previous.projected[i][1])));
    assert.ok(displacement<40,`Morph continuity failed at ${y}: ${displacement}px`);
  }
  previous=current;
}
journeyPage.scrollTo(2200);journeyPage.frame();const outward=journeyPage.director().inspect().projected;
journeyPage.scrollTo(2900);journeyPage.frame();journeyPage.scrollTo(2200);journeyPage.frame();
assert.deepEqual(journeyPage.director().inspect().projected,outward,"Reversing scroll returns the exact frozen geometry");
const mobileJourney=environment({journey:true,width:375,reduce:true});mobileJourney.frame();
assert.equal(mobileJourney.stage.canvas.width,469,"Mobile DPR cap is 1.25");
assert.ok(mobileJourney.director().inspect().vertices<journeyPage.director().inspect().vertices);
assert.equal(mobileJourney.pending(),0);
const failedJourney=environment({journey:true,canvas:false});failedJourney.frame();
assert.equal(failedJourney.body.classList.contains("journey-ready"),false,"Canvas failure leaves the static landscape and local posters in place");
const breeze=environment({journey:true});breeze.frame();
const initialWind=breeze.stage.style.getPropertyValue("--wind");
for(let i=0;i<90;i++)breeze.frame();
assert.notEqual(breeze.stage.style.getPropertyValue("--wind"),initialWind,"Branches and canvas share changing wind even without pointer input");
breeze.window.emit("pointermove",{clientX:1000,clientY:500,pointerType:"mouse"});
for(let i=0;i<40;i++)breeze.frame();
assert.notEqual(breeze.stage.style.getPropertyValue("--camera-x"),"0px");
const preReducedDraws=breeze.stage.context.draws;
breeze.reduced(true);breeze.frame();
assert.equal(breeze.stage.context.draws,preReducedDraws+1,"Live reduced recomposes even at an integer pose");
assert.equal(breeze.stage.style.getPropertyValue("--camera-x"),"0px","Reduced neutralizes camera immediately");
assert.equal(breeze.pending(),0);
console.log("Journey V2 checks passed: fixed stage, shared topology, reversible continuous morph, pause + scroll, static reduced direction, quiet chapters, mobile density/DPR, hidden lifecycle and Canvas failure.");

// V2.1: the latest scroll is a target, never a queued transition.
const travel=environment({journey:true});travel.frame();
travel.scrollTo(2800);travel.frame();
let sample=travel.director().inspect();
assert.ok(sample.pose>0&&sample.pose<sample.targetPose*.1,"Scroll does not directly move the visual world");
assert.ok(sample.cameraPose<sample.pose,"Camera and geometry have independent response");
travel.control.emit("click");travel.frame();
assert.equal(travel.director().inspect().pose,sample.pose,"Pausing mid-approach preserves the last geometry frame");
assert.equal(travel.director().inspect().cameraPose,sample.cameraPose,"Pausing mid-approach preserves the last camera frame");
travel.control.emit("click");travel.frame();
let last=sample.pose;
for(let i=0;i<90;i++){
  travel.frame();sample=travel.director().inspect();
  assert.ok(sample.pose>=last&&sample.pose<=sample.targetPose+1e-9,"Rest-to-target step is monotone without overshoot");last=sample.pose;
}
assert.ok(Math.abs(sample.pose-sample.targetPose)<.001);
travel.scrollTo(4200);for(let i=0;i<6;i++)travel.frame();
const beforeReverse=travel.director().inspect();
travel.scrollTo(1800);travel.frame();
assert.ok(Math.abs(travel.director().inspect().pose-beforeReverse.pose)<.15,"Reverse has bounded first-frame displacement");
for(let i=0;i<90;i++)travel.frame();
sample=travel.director().inspect();assert.ok(Math.abs(sample.pose-sample.targetPose)<.001,"Reversal converges to the latest target");
travel.scrollTo(0);travel.frame();travel.scrollTo(9000);
for(let i=0;i<75;i++)travel.frame();
sample=travel.director().inspect();assert.ok(Math.abs(sample.pose-6)<.002,"Rapid multi-world jump has no backlog");
const phaseBeforeHidden=sample.phase;travel.hidden(true);for(let i=0;i<30;i++)travel.frame();
assert.equal(travel.director().inspect().phase,phaseBeforeHidden,"Hidden state freezes integration");
travel.hidden(false);travel.frame(2000);
assert.ok(travel.director().inspect().phase-phaseBeforeHidden<=.051,"Resume clamps time instead of replaying missed frames");
travel.window.innerWidth=430;travel.window.emit("resize");travel.frame();
sample=travel.director().inspect();assert.equal(sample.pose,sample.targetPose,"Resize establishes a coherent new composition");
assert.ok(sample.projected.every(p=>p.every(Number.isFinite)));

const fpsStates=[30,60,120].map(fps=>{
  const test=environment({journey:true});test.frame();test.scrollTo(2800);
  for(let i=0;i<fps/2;i++)test.frame(1000/fps);
  return test.director().inspect();
});
for(const sample of fpsStates){
  assert.ok(Math.abs(sample.pose-fpsStates[0].pose)<1e-9,"Geometry is frame-rate independent");
  assert.ok(Math.abs(sample.cameraPose-fpsStates[0].cameraPose)<1e-9,"Camera is frame-rate independent");
}
const mobileResponse=environment({journey:true,width:375});mobileResponse.frame();mobileResponse.scrollTo(2800);
const desktopResponse=environment({journey:true});desktopResponse.frame();desktopResponse.scrollTo(2800);
for(let i=0;i<10;i++){mobileResponse.frame();desktopResponse.frame();}
assert.ok(mobileResponse.director().inspect().pose>desktopResponse.director().inspect().pose,"Touch layout uses shorter inertia");
console.log("V2.1 checks passed: independent world/camera/light damping, 30/60/120 Hz equivalence, monotone jump, mid-morph reversal, no backlog, finite settle/sleep, clamped resume and mobile response.");
