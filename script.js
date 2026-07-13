/* ============================================================
   Portfolio animations — GSAP + ScrollTrigger + SplitText +
   ScrambleText + Lenis smooth scroll.
   Everything degrades gracefully: if the CDN is blocked or the
   user prefers reduced motion, the page renders fully static.
   ============================================================ */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

/* ---------- Copy email to clipboard (always active) ---------- */
const copyBtn = document.getElementById("copy-email");
const tooltip = document.getElementById("copy-tooltip");
const emailText = document.getElementById("email-text");

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(emailText.textContent.trim());
      tooltip.classList.add("show");
      setTimeout(() => tooltip.classList.remove("show"), 1500);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(emailText);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
}

/* ---------- Scrollspy (always active) ---------- */
const navLinks = document.querySelectorAll(".nav-link");
const spySections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const spyObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      }
    }
  },
  { rootMargin: "-30% 0px -60% 0px" }
);

spySections.forEach((section) => spyObserver.observe(section));

/* ============================================================
   Animation bootstrap
   ============================================================ */
if (hasGSAP && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
  initAnimations();
}

function initAnimations() {
  /* ---------- Lenis smooth scrolling ---------- */
  const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links scroll through Lenis so easing stays consistent
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.getAttribute("href");
      if (target.length > 1 && document.querySelector(target)) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -110, duration: 1.4 });
      }
    });
  });

  /* ---------- Preloader ---------- */
  const preloaderDone = runPreloader(lenis);

  /* ---------- Everything that needs fonts loaded ---------- */
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

  fontsReady.then(() => {
    const heroTl = buildHeroTimeline();
    preloaderDone.then(() => heroTl.play());

    buildMarquee(lenis);
    buildSectionAnimations();
    buildContactAnimations();
    buildNavBehavior();
    buildProgressBar();

    if (finePointer) {
      buildCustomCursor();
      buildMagneticButtons();
      buildPhotoTilt();
    }

    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ============================================================
   Preloader — ink curtain with counter, then sweeps up
   ============================================================ */
function runPreloader(lenis) {
  const pre = document.createElement("div");
  pre.className = "preloader";
  pre.innerHTML =
    '<div class="preloader-inner"><div class="pre-logo">MA</div><div class="pre-count">0%</div></div>';
  document.body.appendChild(pre);
  lenis.stop();

  return new Promise((resolve) => {
    const count = { v: 0 };
    const countEl = pre.querySelector(".pre-count");

    gsap
      .timeline({
        onComplete: () => {
          pre.remove();
          lenis.start();
          resolve();
        },
      })
      .from(pre.querySelector(".pre-logo"), {
        scale: 0,
        rotation: -15,
        duration: 0.5,
        ease: "back.out(2)",
      })
      .to(count, {
        v: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => (countEl.textContent = `${Math.round(count.v)}%`),
      }, "<")
      .to(pre.querySelector(".preloader-inner"), {
        yPercent: -40,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power2.in",
      })
      .to(pre, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.15");
  });
}

/* ============================================================
   Hero — masked char reveal, scramble kicker, photo clip
   ============================================================ */
function buildHeroTimeline() {
  const kicker = document.querySelector(".hero-kicker");
  const kickerText = kicker.textContent;
  const titleSplit = new SplitText(".hero-title .title-line", { type: "chars", mask: "chars" });

  // Pre-hide (JS-only so no-JS visitors see everything)
  gsap.set(titleSplit.chars, { yPercent: 130, rotation: 4 });
  gsap.set(kicker, { autoAlpha: 0 });
  gsap.set([".hero-summary", ".hero-cta"], { autoAlpha: 0, y: 30 });
  gsap.set(".hero-photo-frame", { clipPath: "inset(100% 0% 0% 0%)" });
  gsap.set(".hero-badge", { scale: 0, rotation: -10 });
  gsap.set(".hero-photo-wrap", { "--dash-o": 0 });
  gsap.set(".navbar", { yPercent: -160, autoAlpha: 0 });

  return gsap
    .timeline({ paused: true, defaults: { ease: "power4.out" } })
    .to(".navbar", { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" })
    .to(kicker, { autoAlpha: 1, duration: 0.01 }, 0.15)
    .to(kicker, {
      duration: 1.4,
      scrambleText: { text: kickerText, chars: "upperCase", speed: 0.6 },
    }, 0.15)
    .to(titleSplit.chars, {
      yPercent: 0,
      rotation: 0,
      duration: 1.1,
      stagger: 0.035,
    }, 0.25)
    .to(".hero-summary", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.75)
    .to(".hero-cta", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.9)
    .to(".hero-photo-frame", {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.1,
      ease: "power3.inOut",
    }, 0.45)
    .to(".hero-photo-wrap", { "--dash-o": 1, duration: 0.6 }, 1.2)
    .to(".hero-badge", {
      scale: 1,
      rotation: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    }, 1.25);
}

/* ============================================================
   Marquee — infinite loop that reacts to scroll velocity
   ============================================================ */
function buildMarquee(lenis) {
  const track = document.querySelector(".marquee-track");
  if (!track) return;

  // Fill at least one viewport width, then duplicate the whole thing once —
  // the track must be two identical halves for the -50% loop to be seamless
  const chunk = track.querySelector(".marquee-chunk");
  while (track.scrollWidth < window.innerWidth * 1.1) {
    track.appendChild(chunk.cloneNode(true));
  }
  track.innerHTML += track.innerHTML;

  const tween = gsap.to(track, {
    xPercent: -50,
    duration: 22,
    ease: "none",
    repeat: -1,
  });

  const skewTo = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });

  lenis.on("scroll", (e) => {
    const boost = gsap.utils.clamp(-3, 3, e.velocity / 22);
    gsap.to(tween, {
      timeScale: boost < 0 ? Math.min(boost, -0.6) : Math.max(1, boost + 1),
      duration: 0.35,
      overwrite: true,
    });
    skewTo(gsap.utils.clamp(-6, 6, e.velocity / 12));
  });
}

/* ============================================================
   Scroll-driven section animations
   ============================================================ */
function buildSectionAnimations() {
  // Section headings: icon spins in, title chars rise out of a mask
  document.querySelectorAll(".section-heading").forEach((heading) => {
    const icon = heading.querySelector(".section-icon");
    const title = heading.querySelector(".section-title");
    const split = new SplitText(title, { type: "chars", mask: "chars" });

    gsap
      .timeline({
        scrollTrigger: { trigger: heading, start: "top 85%" },
        defaults: { ease: "power4.out" },
      })
      .from(icon, { scale: 0, rotation: -120, duration: 0.8, ease: "back.out(2)" })
      .from(split.chars, { yPercent: 120, duration: 0.9, stagger: 0.02 }, 0.1);
  });

  // Cards: rise in with a slight alternating rotation
  gsap.utils.toArray(".card").forEach((card, i) => {
    gsap.from(card, {
      y: 70,
      autoAlpha: 0,
      rotation: i % 2 ? 1.5 : -1.5,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%" },
    });
  });

  // Tech chips pop in one by one
  gsap.utils.toArray(".chip-row").forEach((row) => {
    gsap.from(row.querySelectorAll(".chip"), {
      scale: 0,
      y: 12,
      duration: 0.55,
      ease: "back.out(2.5)",
      stagger: 0.05,
      scrollTrigger: { trigger: row, start: "top 92%" },
    });
  });

  // Dark pills (CGPA, percentages, badges) snap in
  gsap.utils.toArray(".pill-dark").forEach((pill) => {
    gsap.from(pill, {
      scale: 0,
      rotation: -6,
      duration: 0.7,
      ease: "back.out(2.5)",
      scrollTrigger: { trigger: pill, start: "top 92%" },
    });
  });

  // Experience: logo pops, bullets cascade in from the left
  gsap.utils.toArray(".exp-card").forEach((card) => {
    gsap.from(card.querySelector(".exp-logo"), {
      scale: 0,
      rotation: -12,
      duration: 0.8,
      ease: "back.out(2)",
      scrollTrigger: { trigger: card, start: "top 85%" },
    });
    gsap.from(card.querySelectorAll(".exp-bullets li"), {
      x: -28,
      autoAlpha: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: card, start: "top 80%" },
    });
  });

  // Honors: medals spin in with elastic, underline draws, watermark drifts
  gsap.utils.toArray(".honor-card").forEach((card) => {
    gsap.from(card.querySelector(".honor-medal"), {
      scale: 0,
      rotation: -150,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
      scrollTrigger: { trigger: card, start: "top 82%" },
    });
    gsap.from(card.querySelector(".honor-underline"), {
      scaleX: 0,
      transformOrigin: "0 50%",
      duration: 0.7,
      ease: "power3.inOut",
      scrollTrigger: { trigger: card, start: "top 80%" },
    });
    gsap.fromTo(
      card.querySelector(".honor-watermark"),
      { y: 40, rotation: -8 },
      {
        y: -20,
        rotation: 6,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 },
      }
    );
  });
}

/* ============================================================
   Contact section
   ============================================================ */
function buildContactAnimations() {
  const card = document.querySelector(".contact-card");
  const split = new SplitText(".contact-title", { type: "chars" });

  gsap.from(card, {
    y: 90,
    scale: 0.94,
    autoAlpha: 0,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: card, start: "top 80%" },
  });

  gsap.from(split.chars, {
    y: 90,
    autoAlpha: 0,
    rotation: () => gsap.utils.random(-14, 14),
    duration: 0.9,
    ease: "back.out(1.8)",
    stagger: { each: 0.045, from: "center" },
    scrollTrigger: { trigger: card, start: "top 65%" },
  });

  gsap.from(".contact-sub", {
    autoAlpha: 0,
    y: 30,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: card, start: "top 60%" },
  });

  gsap.from(".email-pill", {
    scale: 0.7,
    autoAlpha: 0,
    duration: 1,
    ease: "elastic.out(1, 0.55)",
    scrollTrigger: { trigger: card, start: "top 55%" },
  });

  gsap.from(".socials a", {
    y: 30,
    autoAlpha: 0,
    duration: 0.6,
    ease: "back.out(2.5)",
    stagger: 0.09,
    scrollTrigger: { trigger: card, start: "top 50%" },
  });
}

/* ============================================================
   Navbar — hides on scroll down, returns on scroll up
   ============================================================ */
function buildNavBehavior() {
  let hidden = false;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      const shouldHide = self.direction === 1 && self.scroll() > 300;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        gsap.to(".navbar", {
          yPercent: hidden ? -160 : 0,
          autoAlpha: hidden ? 0 : 1,
          duration: 0.5,
          ease: "power3.out",
          overwrite: true,
        });
      }
    },
  });
}

/* ============================================================
   Scroll progress bar
   ============================================================ */
function buildProgressBar() {
  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });
}

/* ============================================================
   Custom cursor — orange dot + difference ring
   ============================================================ */
function buildCustomCursor() {
  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(dot, ring);
  document.documentElement.classList.add("has-custom-cursor");

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

  const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
  const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

  window.addEventListener("mousemove", (e) => {
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  });

  // Grow the ring over anything interactive
  const isInteractive = (el) => el.closest("a, button, .chip, .email-pill");
  document.addEventListener("mouseover", (e) => {
    if (isInteractive(e.target)) gsap.to(ring, { scale: 1.9, duration: 0.3, ease: "power3.out" });
  });
  document.addEventListener("mouseout", (e) => {
    if (isInteractive(e.target)) gsap.to(ring, { scale: 1, duration: 0.3, ease: "power3.out" });
  });
}

/* ============================================================
   Magnetic buttons
   ============================================================ */
function buildMagneticButtons() {
  document
    .querySelectorAll(".btn-resume, .btn-contact, .circle-btn, .socials a, .copy-btn")
    .forEach((el) => {
      const strength = el.classList.contains("btn-resume") ? 0.45 : 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)", overwrite: true });
      });
    });
}

/* ============================================================
   Hero photo 3D tilt
   ============================================================ */
function buildPhotoTilt() {
  const wrap = document.querySelector(".hero-photo-wrap");
  const frame = document.querySelector(".hero-photo-frame");
  if (!wrap || !frame) return;

  gsap.set(frame, { transformPerspective: 700 });
  const rotX = gsap.quickTo(frame, "rotationX", { duration: 0.5, ease: "power3" });
  const rotY = gsap.quickTo(frame, "rotationY", { duration: 0.5, ease: "power3" });

  wrap.addEventListener("mousemove", (e) => {
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY(px * 14);
    rotX(py * -14);
  });
  wrap.addEventListener("mouseleave", () => {
    rotX(0);
    rotY(0);
  });
}
