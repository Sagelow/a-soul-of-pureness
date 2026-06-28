/* =====================================================================
   CELINE'S CONSTELLATION — Lightweight iPad interactions
   Handles the celestial ambience, section reveals, touch feedback,
   smooth constellation navigation, and the active C0–C6 state.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const countdownGate = document.querySelector("#countdown-gate");
  const countdownParts = {
    days: document.querySelector("[data-countdown-days]"),
    hours: document.querySelector("[data-countdown-hours]"),
    minutes: document.querySelector("[data-countdown-minutes]"),
    seconds: document.querySelector("[data-countdown-seconds]")
  };
  const progressBar = document.querySelector(".scroll-progress span");
  const constellationControls = [...document.querySelectorAll("[data-constellation]")];
  const sections = [...document.querySelectorAll("[data-constellation-section]")];
  const starMap = document.querySelector("[data-star-map]");
  const crescentNav = document.querySelector(".crescent-nav");
  let activeConstellation = "0";
  let wakeTimer;
  let isSiteLocked = false;
  let countdownTimer;

  const getUnlockTarget = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 5, 29, 0, 0, 0, 0);
  };

  const formatCountdownValue = (value) => String(value).padStart(2, "0");

  const updateCountdown = () => {
    const now = new Date();
    const target = getUnlockTarget();
    const remaining = target.getTime() - now.getTime();

    if (remaining <= 0) {
      unlockSite();
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (countdownParts.days) countdownParts.days.textContent = formatCountdownValue(days);
    if (countdownParts.hours) countdownParts.hours.textContent = formatCountdownValue(hours);
    if (countdownParts.minutes) countdownParts.minutes.textContent = formatCountdownValue(minutes);
    if (countdownParts.seconds) countdownParts.seconds.textContent = formatCountdownValue(seconds);
  };

  const playAwakeningSequence = () => {
    if (reducedMotion) return;
    body.classList.add("is-unlocking");
    starMap?.classList.add("is-awake");
  };

  const unlockSite = (instant = false) => {
    window.clearInterval(countdownTimer);
    isSiteLocked = false;
    body.classList.remove("is-gate-pending", "is-locked");

    if (instant || reducedMotion) {
      body.classList.add("is-unlocked");
      countdownGate?.setAttribute("aria-hidden", "true");
      countdownGate?.removeAttribute("aria-modal");
      updateCrescentNavVisibility();
      return;
    }

    playAwakeningSequence();
    window.setTimeout(() => {
      body.classList.remove("is-unlocking");
      body.classList.add("is-unlocked");
      countdownGate?.setAttribute("aria-hidden", "true");
      countdownGate?.removeAttribute("aria-modal");
      updateCrescentNavVisibility();
    }, 1450);
    window.setTimeout(() => {
      starMap?.classList.remove("is-awake");
    }, 3600);
  };

  const initCountdownGate = () => {
    const now = new Date();
    const target = getUnlockTarget();

    if (now >= target) {
      unlockSite(true);
      return;
    }

    isSiteLocked = true;
    body.classList.remove("is-gate-pending");
    body.classList.add("is-locked");
    setCrescentNavVisibility(false);
    updateCountdown();
    countdownTimer = window.setInterval(updateCountdown, 1000);
  };

  /* Stable variation keeps the ambient composition consistent on refresh. */
  const randomFrom = (seed) => {
    const value = Math.sin(seed * 999) * 43758.5453;
    return value - Math.floor(value);
  };

  const createParticles = () => {
    const colors = ["#f6a6c8", "#8f5cff", "#ffd6e8", "#c9a7ff", "#d9b56f"];

    document.querySelectorAll("[data-particles]").forEach((field, fieldIndex) => {
      const amount = Number(field.dataset.particles) || 24;

      for (let index = 0; index < amount; index += 1) {
        const seed = index + fieldIndex * 53;
        const particle = document.createElement("i");
        const size = 1.2 + randomFrom(seed + 1) * 2.8;

        particle.className = index % 7 === 0 ? "particle particle--spark" : "particle";
        particle.setAttribute("aria-hidden", "true");
        particle.style.setProperty("--left", `${randomFrom(seed + 8) * 100}%`);
        particle.style.setProperty("--top", `${randomFrom(seed + 16) * 100}%`);
        particle.style.setProperty("--size", `${size}px`);
        particle.style.setProperty("--opacity", 0.16 + randomFrom(seed + 24) * 0.45);
        particle.style.setProperty("--duration", `${6 + randomFrom(seed + 32) * 7}s`);
        particle.style.setProperty("--delay", `${randomFrom(seed + 40) * -8}s`);
        particle.style.setProperty("--drift-x", `${-13 + randomFrom(seed + 48) * 26}px`);
        particle.style.setProperty("--color", colors[index % colors.length]);
        field.appendChild(particle);
      }
    });
  };

  const createPetals = () => {
    document.querySelectorAll("[data-petals]").forEach((field, fieldIndex) => {
      const amount = Number(field.dataset.petals) || 14;

      for (let index = 0; index < amount; index += 1) {
        const seed = index + fieldIndex * 71;
        const petal = document.createElement("i");
        petal.className = "sakura-petal";
        petal.setAttribute("aria-hidden", "true");
        petal.style.setProperty("--left", `${randomFrom(seed + 2) * 100}%`);
        petal.style.setProperty("--size", `${6 + randomFrom(seed + 5) * 9}px`);
        petal.style.setProperty("--opacity", 0.24 + randomFrom(seed + 8) * 0.46);
        petal.style.setProperty("--duration", `${12 + randomFrom(seed + 11) * 10}s`);
        petal.style.setProperty("--delay", `${randomFrom(seed + 14) * -20}s`);
        petal.style.setProperty("--sway", `${-45 + randomFrom(seed + 17) * 90}px`);
        field.appendChild(petal);
      }
    });
  };

  const initReveal = () => {
    const elements = document.querySelectorAll(".reveal");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7%" });

    elements.forEach((element) => revealObserver.observe(element));
  };

  const wakeConstellation = () => {
    if (reducedMotion || isSiteLocked) return;
    window.clearTimeout(wakeTimer);
    starMap?.classList.add("is-awake");
    crescentNav?.classList.add("is-awake");
    wakeTimer = window.setTimeout(() => {
      starMap?.classList.remove("is-awake");
      crescentNav?.classList.remove("is-awake");
    }, 650);
  };

  const setCrescentNavVisibility = (shouldShow) => {
    if (!crescentNav) return;
    if (isSiteLocked) shouldShow = false;
    crescentNav.classList.toggle("is-visible", shouldShow);
    crescentNav.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  };

  const isInsideConstellationJourney = () => {
    const firstConstellation = document.querySelector("#c1");
    const letterSection = document.querySelector(".letter-section");
    if (!firstConstellation) return false;

    if (letterSection) {
      const letterRect = letterSection.getBoundingClientRect();
      const letterIsEntering = letterRect.top <= window.innerHeight && letterRect.bottom >= 0;
      if (letterIsEntering) return false;
    }

    const journeyStart = firstConstellation.offsetTop - 16;
    const journeyEnd = letterSection
      ? letterSection.offsetTop - 24
      : document.documentElement.scrollHeight;

    return window.scrollY >= journeyStart && window.scrollY < journeyEnd;
  };

  const updateCrescentNavVisibility = () => {
    setCrescentNavVisibility(isInsideConstellationJourney());
  };

  const setActiveConstellation = (value, animateMap = false) => {
    const nextValue = String(value);
    if (!/^[0-6]$/.test(nextValue)) return;

    activeConstellation = nextValue;
    setCrescentNavVisibility(nextValue !== "0" && isInsideConstellationJourney());

    constellationControls.forEach((control) => {
      const isActive = control.dataset.constellation === nextValue;
      control.classList.toggle("is-active", isActive);

      if (isActive) {
        control.setAttribute("aria-current", "true");
      } else {
        control.removeAttribute("aria-current");
      }
    });

    if (starMap) starMap.dataset.active = nextValue;
    if (animateMap) wakeConstellation();
  };

  const scrollToConstellation = (value) => {
    if (isSiteLocked) return;
    const target = document.querySelector(`#c${value}`);
    if (!target) return;

    setActiveConstellation(value, true);
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
  };

  const initConstellationNavigation = () => {
    constellationControls.forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        scrollToConstellation(control.dataset.constellation);
      });

      /* The pressed state gives immediate feedback under a finger on iPad. */
      const press = () => control.classList.add("is-pressed");
      const release = () => control.classList.remove("is-pressed");
      control.addEventListener("pointerdown", press, { passive: true });
      control.addEventListener("pointerup", release, { passive: true });
      control.addEventListener("pointercancel", release, { passive: true });
      control.addEventListener("pointerleave", release, { passive: true });
    });
  };

  const initTouchCards = () => {
    const cards = document.querySelectorAll(".drawing-card, .quality-card, .muse-card");

    cards.forEach((card) => {
      const press = () => card.classList.add("is-pressed");
      const release = () => card.classList.remove("is-pressed");
      card.addEventListener("pointerdown", press, { passive: true });
      card.addEventListener("pointerup", release, { passive: true });
      card.addEventListener("pointercancel", release, { passive: true });
      card.addEventListener("pointerleave", release, { passive: true });
    });
  };

  const initActiveSectionObserver = () => {
    if (!("IntersectionObserver" in window)) {
      setActiveConstellation("0");
      return;
    }

    const visibleSections = new Map();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const value = entry.target.dataset.constellationSection;
        if (entry.isIntersecting) {
          visibleSections.set(value, entry.intersectionRatio);
        } else {
          visibleSections.delete(value);
        }
      });

      if (!visibleSections.size) return;
      const [mostVisible] = [...visibleSections].sort((a, b) => b[1] - a[1])[0];
      if (mostVisible !== activeConstellation) setActiveConstellation(mostVisible);
    }, {
      threshold: [0.18, 0.32, 0.5, 0.68],
      rootMargin: "-16% 0px -24% 0px"
    });

    sections.forEach((section) => sectionObserver.observe(section));
  };

  const updateProgress = () => {
    if (!progressBar) return;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
  };

  createParticles();
  if (!reducedMotion) createPetals();
  initCountdownGate();
  initReveal();
  initConstellationNavigation();
  initTouchCards();
  initActiveSectionObserver();
  setActiveConstellation("0");
  updateProgress();
  updateCrescentNavVisibility();
  window.requestAnimationFrame(updateCrescentNavVisibility);
  window.setTimeout(updateCrescentNavVisibility, 250);

  window.addEventListener("scroll", () => {
    updateProgress();
    updateCrescentNavVisibility();
  }, { passive: true });
  window.addEventListener("resize", () => {
    updateProgress();
    updateCrescentNavVisibility();
  }, { passive: true });
  window.addEventListener("load", updateCrescentNavVisibility, { once: true });
});
