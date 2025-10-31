function splitLinesAnimation(container, delay = 0) {
  const root = container || document;

  return new Promise((resolve) => {
    setTimeout(() => {
      const texts = Array.from(root.querySelectorAll("[data-line-reveal='true']"));
      let allLines = [];

      texts.forEach((text) => {
        const split = SplitText.create(text, {
          type: "lines",
          autoSplit: true,
          mask: "lines",
          linesClass: "line"
        });
        allLines = allLines.concat(split.lines);
        gsap.set(text, { visibility: "visible" });
      });

      window.splitLines = allLines;

      if (allLines.length) {
        gsap.fromTo(
          allLines, { yPercent: 130 }, {
            yPercent: 0,
            duration: 1.5,
            ease: "expo.out",
            stagger: 0.045,
            onComplete: () => {
              resolve();
            }
          }
        );
      } else {
        resolve();
      }
    }, delay);
  });
}

function addDelayedLoadedClass(container, delay = 500) {
  const root = container || document;

  const items = Array.from(root.querySelectorAll("[data-barba-animation='item']"));
  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add("is-loaded");
    }, delay);
  });
}

function animatePageIntroForFade(container, skipAnimation = false) {
  const root = container || document;

  if (skipAnimation) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
  }

  return document.fonts.ready.then(() => {
    const texts = Array.from(root.querySelectorAll("[data-line-reveal='true']"));
    let allLines = [];

    texts.forEach((text) => {
      const split = SplitText.create(text, {
        type: "lines",
        autoSplit: true,
        mask: "lines",
        linesClass: "line"
      });
      allLines = allLines.concat(split.lines);
      gsap.set(text, { visibility: "visible" });
    });

    window.splitLines = allLines;

    if (allLines.length) {
      gsap.fromTo(
        allLines, { yPercent: 130 }, {
          yPercent: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.045
        }
      );
    }
  });
}

function animatePageIntro(container, skipAnimation = false) {
  const root = container || document;

  if (skipAnimation) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
  }

  return document.fonts.ready.then(() => {
    const texts = Array.from(root.querySelectorAll("[data-line-reveal='true']"));
    let allLines = [];

    texts.forEach((text) => {
      const split = SplitText.create(text, {
        type: "lines",
        autoSplit: true,
        mask: "lines",
        linesClass: "line"
      });
      allLines = allLines.concat(split.lines);
      gsap.set(text, { visibility: "visible" });
    });

    window.splitLines = allLines;

    if (allLines.length) {
      gsap.fromTo(
        allLines, { yPercent: 130 }, {
          yPercent: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.045
        }
      );
    }

    const items = Array.from(root.querySelectorAll("[data-barba-animation='item']"));
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add("is-loaded");
      }, i * 15);
    });
  });
}

function animateLeaveAndGo(nextUrl) {
  const goneItems = document.querySelectorAll('[data-barba-animation-gone="item"].is-loaded');
  goneItems.forEach((el) => {
    el.classList.remove('is-loaded');
    gsap.to(el, { opacity: 0, duration: 0.3, ease: "power1.in" });
  });

  if (window.splitLines && window.splitLines.length) {
    gsap.to(window.splitLines, {
      yPercent: -110,
      duration: 0.5,
      ease: "expo.in",
      stagger: 0.0025,
      onComplete: function () {
        window.location.href = nextUrl;
      }
    });
  } else {
    setTimeout(() => {
      window.location.href = nextUrl;
    }, 200);
  }
}

function animateLeaveThenGoViaBarba(nextUrl, transitionName) {
  if (window._barbaState.instantNavInProgress) return;
  window._barbaState.instantNavInProgress = true;

  const tl = gsap.timeline({
    onComplete: () => {
      if (window.barba && typeof barba.go === 'function') {
        if (transitionName) {
          barba.go(nextUrl, transitionName);
        } else {
          barba.go(nextUrl);
        }
      } else {
        window.location.href = nextUrl;
      }
    }
  });

  const goneItems = Array.from(document.querySelectorAll(
    '[data-barba-animation-gone="item"].is-loaded'));
  goneItems.forEach((el) => {
    el.classList.remove('is-loaded');
    tl.to(el, { opacity: 0, duration: 0.3, ease: "power1.in" }, 0);
  });

  if (window.splitLines && window.splitLines.length) {
    tl.to(window.splitLines, {
      yPercent: -110,
      duration: 0.8,
      ease: "expo.in",
      stagger: 0.0025
    }, 0.1);
  } else {
    tl.to({}, { duration: 0.32 });
  }
}

function initFieldFillerAnimation(scope) {
  const root = scope || document;
  const fieldFillers = Array.from(root.querySelectorAll('.field_filler'));
  const fieldWraps = Array.from(root.querySelectorAll('.field_wrap'));

  if (!fieldFillers.length || !fieldWraps.length) return;

  fieldFillers.forEach((filler, index) => {
    gsap.set(filler, { opacity: 1 });

    gsap.to(filler, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
      delay: index * 0.2
    });
  });

  fieldWraps.forEach((wrap, index) => {
    const filler = wrap.querySelector('.field_filler');
    if (!filler) return;

    function hideFiller() {
      if (filler.style.display === 'none') return;

      gsap.to(filler, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          filler.style.display = 'none';
        }
      });
    }

    wrap.addEventListener('click', hideFiller, { once: false });

    const input = wrap.querySelector('input');
    if (input) {
      input.addEventListener('focus', hideFiller, { once: false });
    }
  });
}
