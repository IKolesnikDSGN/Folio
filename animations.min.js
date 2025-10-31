// --- АНИМАЦИИ ---

// Анимация split lines
function splitLinesAnimation(container, delay = 0) {
  const root = container || document;

  barbaLog('splitLinesAnimation called', { delay, container: !!container });

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
              barbaLog('splitLinesAnimation completed');
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

// Функция для добавления класса is-loaded с задержкой
function addDelayedLoadedClass(container, delay = 500) {
  const root = container || document;

  barbaLog('addDelayedLoadedClass called', { delay, container: !!container });

  const items = Array.from(root.querySelectorAll("[data-barba-animation='item']"));
  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add("is-loaded");
      barbaLog(`Added is-loaded class to item ${i} after delay ${delay}ms`);
    }, delay);
  });

  barbaLog('Delayed loaded class animation scheduled', { itemsCount: items.length, delay });
}

// Анимация текста для fade-transition
function animatePageIntroForFade(container, skipAnimation = false) {
  const root = container || document;

  barbaLog('animatePageIntroForFade called', { skipAnimation, container: !!container });

  if (skipAnimation) {
    barbaLog('Skipping animations due to skipAnimation flag');
    return new Promise(resolve => {
      setTimeout(() => {
        barbaLog('Skip animation completed');
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

    barbaLog('Page intro animation for fade completed', {
      textsCount: texts.length,
      itemsCount: Array.from(root.querySelectorAll("[data-barba-animation='item']")).length
    });
  });
}

// Анимация текста и элементов для контейнера
function animatePageIntro(container, skipAnimation = false) {
  const root = container || document;

  barbaLog('animatePageIntro called', { skipAnimation, container: !!container });

  if (skipAnimation) {
    barbaLog('Skipping animations due to skipAnimation flag');
    return new Promise(resolve => {
      setTimeout(() => {
        barbaLog('Skip animation completed');
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

    barbaLog('Page intro animation completed', {
      textsCount: texts.length,
      itemsCount: items.length
    });
  });
}

// Seamless: анимации в старом контейнере и прямой переход
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

// Seamless-анимации в старом контейнере, затем навигация через Barba
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

// Анимация field_filler
function initFieldFillerAnimation(scope) {
  const root = scope || document;
  const fieldFillers = Array.from(root.querySelectorAll('.field_filler'));
  const fieldWraps = Array.from(root.querySelectorAll('.field_wrap'));

  if (!fieldFillers.length || !fieldWraps.length) return;

  barbaLog('Initializing field filler animation', {
    fillersCount: fieldFillers.length,
    wrapsCount: fieldWraps.length
  });

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

    barbaLog(`Field filler ${index} animation started`);
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
          barbaLog(`Field filler ${index} hidden after click`);
        }
      });
    }

    wrap.addEventListener('click', hideFiller, { once: false });

    const input = wrap.querySelector('input');
    if (input) {
      input.addEventListener('focus', hideFiller, { once: false });
    }

    barbaLog(`Field wrap ${index} click handlers added`);
  });
}
