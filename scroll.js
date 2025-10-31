// --- ФУНКЦИИ СКРОЛЛА ---

// Проверка на мобильные устройства и планшеты
function isMobileOrTablet() {
  return window.innerWidth <= 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Сохранение состояния ScrollTrigger анимаций
function saveScrollTriggerState(scope) {
  if (isMobileOrTablet()) return;
  const root = scope || document;
  const scroller = root.querySelector('#scroll');
  if (!scroller) return;

  const state = {
    scrollTop: scroller.scrollTop,
    elements: {}
  };

  // Сохраняем состояние параллакс элементов
  root.querySelectorAll('[data-scroll="parallax-component"]').forEach((el, i) => {
    if (el && el.parentNode) {
      const yPercent = gsap.getProperty(el, "yPercent");
      const y = gsap.getProperty(el, "y");
      state.elements[`parallax-${i}`] = {
        selector: '[data-scroll="parallax-component"]',
        index: i,
        yPercent: yPercent,
        y: y
      };
    }
  });

  // Сохраняем состояние next_page_visual
  root.querySelectorAll('.next_page_visual').forEach((el, i) => {
    if (el && el.parentNode) {
      const clipPath = gsap.getProperty(el, "clipPath");
      const y = gsap.getProperty(el, "y");
      state.elements[`next-visual-${i}`] = {
        selector: '.next_page_visual',
        index: i,
        clipPath: clipPath,
        y: y
      };
    }
  });

  // Сохраняем состояние divider_wrap
  root.querySelectorAll('.divider_wrap').forEach((el, i) => {
    if (el && el.parentNode) {
      const clipPath = gsap.getProperty(el, "clipPath");
      const y = gsap.getProperty(el, "y");
      state.elements[`divider-${i}`] = {
        selector: '.divider_wrap',
        index: i,
        clipPath: clipPath,
        y: y
      };
    }
  });

  // Сохраняем состояние info_wrapper
  root.querySelectorAll('.info_wrapper').forEach((el, i) => {
    if (el && el.parentNode) {
      const opacity = gsap.getProperty(el, "opacity");
      const y = gsap.getProperty(el, "y");
      state.elements[`info-wrapper-${i}`] = {
        selector: '.info_wrapper',
        index: i,
        opacity: opacity,
        y: y
      };
    }
  });

  // Сохраняем состояние next_work-info
  root.querySelectorAll('.next_work-info').forEach((el, i) => {
    if (el && el.parentNode) {
      const opacity = gsap.getProperty(el, "opacity");
      const y = gsap.getProperty(el, "y");
      state.elements[`next-work-info-${i}`] = {
        selector: '.next_work-info',
        index: i,
        opacity: opacity,
        y: y
      };
    }
  });

  // Сохраняем состояние info_divider
  root.querySelectorAll('.info_divider').forEach((el, i) => {
    if (el && el.parentNode) {
      const height = gsap.getProperty(el, "height");
      const y = gsap.getProperty(el, "y");
      state.elements[`info-divider-${i}`] = {
        selector: '.info_divider',
        index: i,
        height: height,
        y: y
      };
    }
  });

  window._scrollState = state;
  barbaLog('ScrollTrigger state saved', {
    scrollTop: state.scrollTop,
    elementsCount: Object.keys(state.elements).length
  });

  return state;
}

// Очистка сохраненного состояния
function clearScrollTriggerState() {
  if (isMobileOrTablet()) return;
  if (window._scrollState) {
    barbaLog('ScrollTrigger state cleared');
    window._scrollState = null;
  }
}

// Плавный скролл для #scroll внутри контейнера
function initCaseSmoothScroll(scope) {
  if (isMobileOrTablet()) return;
  const root = scope || document;
  const el = root.querySelector('#scroll');
  if (!el) return;

  if (el._smoothScrollCleanup) el._smoothScrollCleanup();

  let currentScroll = el.scrollTop;
  let targetScroll = el.scrollTop;
  let isScrolling = false;
  let rafId = null;
  let isScrollBlocked = false;
  const ease = 0.065;

  function smoothScroll() {
    currentScroll += (targetScroll - currentScroll) * ease;
    el.scrollTop = currentScroll;

    if (window.ScrollTrigger) ScrollTrigger.update();

    if (Math.abs(targetScroll - currentScroll) > 0.5) {
      rafId = requestAnimationFrame(smoothScroll);
    } else {
      el.scrollTop = targetScroll;
      isScrolling = false;
      rafId = null;
    }
  }

  function clampTarget() {
    const maxScroll = el.scrollHeight - el.clientHeight;
    targetScroll = Math.max(0, Math.min(targetScroll, Math.max(0, maxScroll)));
  }

  function onWheel(e) {
    if (isScrollBlocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    targetScroll += e.deltaY;
    clampTarget();
    if (!isScrolling) {
      isScrolling = true;
      rafId = requestAnimationFrame(smoothScroll);
    }
  }

  function onResize() {
    clampTarget();
    safeScrollTriggerRefresh();
  }

  function blockScroll() {
    isScrollBlocked = true;
    barbaLog('Scroll blocked for new container');
  }

  function unblockScroll() {
    isScrollBlocked = false;
    barbaLog('Scroll unblocked for new container');
  }

  blockScroll();
  setTimeout(() => {
    unblockScroll();
  }, 800);

  el.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', onResize);

  el._smoothScrollCleanup = function () {
    el.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    if (rafId) cancelAnimationFrame(rafId);
  };

  el._blockScroll = blockScroll;
  el._unblockScroll = unblockScroll;
}

// ScrollTrigger внутри #scroll
function initCaseScrollTriggers(scope) {
  if (isMobileOrTablet()) return;
  const root = scope || document;
  const scroller = root.querySelector('#scroll');
  if (!scroller || !window.ScrollTrigger) return;

  if (scroller._caseSTCleanup) scroller._caseSTCleanup();

  // Применяем сохраненное состояние
  if (window._scrollState && window._scrollState.elements) {
    const state = window._scrollState;
    scroller.scrollTop = state.scrollTop;

    Object.values(state.elements).forEach(elementState => {
      if (elementState.selector && elementState.index !== undefined) {
        const elements = root.querySelectorAll(elementState.selector);
        const element = elements[elementState.index];

        if (element && element.parentNode) {
          if (elementState.yPercent !== undefined) {
            gsap.set(element, { yPercent: elementState.yPercent });
          }
          if (elementState.y !== undefined) {
            gsap.set(element, { y: elementState.y });
          }
          if (elementState.clipPath !== undefined) {
            gsap.set(element, { clipPath: elementState.clipPath });
          }
          if (elementState.opacity !== undefined) {
            gsap.set(element, { opacity: elementState.opacity });
          }
          if (elementState.height !== undefined) {
            gsap.set(element, { height: elementState.height });
          }
        }
      }
    });

    barbaLog('ScrollTrigger state restored', {
      scrollTop: state.scrollTop,
      elementsCount: Object.keys(state.elements).length
    });
  }

  const createdTriggers = [];
  const createdTweens = [];
  const globalOnce = (scroller._caseGlobalOnce = scroller._caseGlobalOnce || {});

  // Параллакс фото
  root.querySelectorAll('[data-scroll="parallax-hero"]').forEach(parallaxEl => {
    const component = parallaxEl.querySelector('[data-scroll="parallax-component"]') ||
      root.querySelector('[data-scroll="parallax-component"]') ||
      document.querySelector('[data-scroll="parallax-component"]');
    if (!component) return;

    gsap.set(component, { yPercent: -30 });

    const tw = gsap.to(component, {
      yPercent: 30,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: parallaxEl,
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.01,
        invalidateOnRefresh: true
      }
    });

    if (tw && tw.scrollTrigger) createdTriggers.push(tw.scrollTrigger);
    if (tw) createdTweens.push(tw);
  });

  // Блок .visual_container_btm
  root.querySelectorAll('.visual_container_btm').forEach(section => {
    const nextVisualLocal = section.querySelector('.next_page_visual');
    const dividerGlobal = section.querySelector('.divider_wrap') || root.querySelector('.divider_wrap') || document.querySelector('.divider_wrap');
    const infoWrapperGlobal = section.querySelector('.info_wrapper') || root.querySelector('.info_wrapper') || document.querySelector('.info_wrapper');
    const nextWorkInfoGlobal = section.querySelector('.next_work-info') || root.querySelector('.next_work-info') || document.querySelector('.next_work-info');

    if (nextVisualLocal) {
      const tw1 = gsap.fromTo(
        nextVisualLocal, { clipPath: 'inset(60% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            scroller,
            start: 'top 50%',
            end: '30% top',
            scrub: true
          }
        }
      );
      if (tw1 && tw1.scrollTrigger) createdTriggers.push(tw1.scrollTrigger);
      if (tw1) createdTweens.push(tw1);
    }

    if (dividerGlobal && !globalOnce.divider) {
      const tw2 = gsap.fromTo(
        dividerGlobal, { clipPath: 'inset(0% 0% 0% 0%)' },
        {
          clipPath: 'inset(100% 0% 0% 0%)',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            scroller,
            start: 'top 88%',
            end: '26% top',
            scrub: true
          }
        }
      );
      globalOnce.divider = true;
      if (tw2 && tw2.scrollTrigger) createdTriggers.push(tw2.scrollTrigger);
      if (tw2) createdTweens.push(tw2);
    }

    if ((infoWrapperGlobal || nextWorkInfoGlobal) && !globalOnce.infoTl) {
      const tl = gsap.timeline({
        defaults: { immediateRender: false },
        scrollTrigger: {
          trigger: section,
          scroller,
          start: 'top 50%',
          end: '30% top',
          scrub: true
        }
      });

      if (infoWrapperGlobal) tl.fromTo(infoWrapperGlobal, { opacity: 1 }, {
        opacity: 0.05,
        ease: 'none'
      }, 0);
      if (nextWorkInfoGlobal) tl.fromTo(nextWorkInfoGlobal, { opacity: 0.1 }, {
        opacity: 1,
        ease: 'none'
      }, 0);

      globalOnce.infoTl = true;
      if (tl.scrollTrigger) createdTriggers.push(tl.scrollTrigger);
      createdTweens.push(tl);
    }

    // Прогресс + мгновенный переход
    let scrollBlockedForSection = false;
    let userClickedLink = false;
    const linkClickHandlers = [];
    
    // Отслеживаем клики по ссылкам в секции, чтобы предотвратить конфликт с автоматическим переходом
    const linksInSection = section.querySelectorAll('a[href]');
    linksInSection.forEach(link => {
      const clickHandler = (e) => {
        // Проверяем, что это не ссылка на текущую страницу
        const currentPath = window.location.pathname;
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (currentPath !== linkPath) {
          userClickedLink = true;
          barbaLog('Link clicked in visual_container_btm - blocking automatic transition');
          // Даем время для обработки клика через Barba
          setTimeout(() => {
            userClickedLink = false;
          }, 1500);
        }
      };
      link.addEventListener('click', clickHandler, { passive: true });
      linkClickHandlers.push({ link, handler: clickHandler });
    });
    
    const st = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top 88%',
      end: '26% top',
      scrub: true,
      onUpdate: self => {
        const progressValue = Math.round(self.progress * 100);
        const progressEls = section.querySelectorAll('[next-page-scroll="progress"]');
        const fallbackEls = progressEls.length ? progressEls :
          (root.querySelectorAll('[next-page-scroll="progress"]').length ?
            root.querySelectorAll('[next-page-scroll="progress"]') :
            document.querySelectorAll('[next-page-scroll="progress"]'));
        fallbackEls.forEach(el => { el.textContent = progressValue; });
        
        // Блокируем скролл когда достигаем точки end
        if (self.progress >= 0.99 && !scrollBlockedForSection && scroller && typeof scroller._blockScroll === 'function') {
          scrollBlockedForSection = true;
          scroller._blockScroll();
        }
      },
      onLeave: () => {
        // Предотвращаем автоматический переход, если:
        // 1. Уже идет переход через Barba
        // 2. Пользователь кликнул на ссылку
        // 3. Уже идет переход через архив
        // 4. Barba уже обрабатывает переход
        const isBarbaTransitioning = window.barba && (
          window.barba.current && window.barba.current.transition ||
          document.querySelector('[data-barba-container].barba-leave') ||
          document.querySelector('[data-barba-container].barba-enter')
        );
        
        if (window._barbaState.instantNavInProgress || 
            userClickedLink || 
            window.window.archiveTransitionInProgress ||
            isBarbaTransitioning) {
          barbaLog('Skipping automatic transition - user interaction or other transition in progress', {
            instantNavInProgress: window._barbaState.instantNavInProgress,
            userClickedLink: userClickedLink,
            archiveTransitionInProgress: window.window.archiveTransitionInProgress,
            isBarbaTransitioning: isBarbaTransitioning
          });
          return;
        }

        // Ищем next_page_visual внутри section
        const nextVisualLocal = section.querySelector('.next_page_visual');
        const nextVisual = nextVisualLocal ||
          root.querySelector('.next_page_visual') ||
          document.querySelector('.next_page_visual');

        if (nextVisual) {
          // Ищем элемент с атрибутом data-next="next-slug"
          const slugElement = nextVisual.querySelector('[data-next="next-slug"]') ||
            root.querySelector('[data-next="next-slug"]') ||
            document.querySelector('[data-next="next-slug"]');

          if (slugElement) {
            // Получаем текст и преобразуем в slug
            const text = slugElement.textContent.trim();
            const slug = text
              .toLowerCase()
              .replace(/[\s\W_]+/g, '-') // заменяем пробелы, спецсимволы на дефис
              .replace(/^-+|-+$/g, ''); // удаляем дефисы в начале и конце
            
            if (slug) {
              const nextPage = `/${slug}`;
              
              // Определяем тип перехода в зависимости от устройства
              const transitionType = isMobileOrTablet() ? 'opacity-crossfade' : 'fade-transition';
              barbaLog('Triggering automatic transition via visual_container_btm', { nextPage, transitionType });
              animateLeaveThenGoViaBarba(nextPage, transitionType);
            }
          }
        }
      }
    });

    // Сохраняем ссылки на обработчики для cleanup
    st._linkClickHandlers = linkClickHandlers;
    createdTriggers.push(st);
  });

  scroller._caseSTCleanup = function () {
    createdTriggers.forEach(t => {
      // Удаляем обработчики кликов по ссылкам, если они были сохранены
      if (t && t._linkClickHandlers) {
        t._linkClickHandlers.forEach(({ link, handler }) => {
          link.removeEventListener('click', handler);
        });
      }
      if (t) t.kill();
    });
    createdTweens.forEach(tw => {
      const targets = tw && tw.targets ? tw.targets() : [];
      targets.forEach(t => t && gsap.set(t, { clearProps: "transform,clipPath,opacity" }));
      if (tw) tw.kill();
    });
    scroller._caseGlobalOnce = {};
  };

  // Анимация .info_divider
  root.querySelectorAll('.info_divider').forEach(divider => {
    const tw = gsap.fromTo(
      divider, { height: '0%' },
      {
        height: '100%',
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: root.querySelector('[data-progress="scroll"]') || divider,
          scroller,
          start: 'top bottom',
          end: '80% top',
          scrub: true
        }
      }
    );
    if (tw && tw.scrollTrigger) createdTriggers.push(tw.scrollTrigger);
    if (tw) createdTweens.push(tw);
  });

  // Архив: прогресс линии, счетчик и переход
  root.querySelectorAll('.archive_imgs_wrap').forEach(archiveWrap => {
    const lineEl = document.getElementById('archive-line');
    const lineWrapEl = document.getElementById('archive-line-wrap');
    const progressElsLocal = archiveWrap.querySelectorAll('[data-scroll="number-progress"]');
    const progressEls = progressElsLocal.length ? progressElsLocal :
      (root.querySelectorAll('[data-scroll="number-progress"]').length ?
        root.querySelectorAll('[data-scroll="number-progress"]') :
        document.querySelectorAll('[data-scroll="number-progress"]'));

    const archiveImgWraps = archiveWrap.querySelectorAll('.archive_img_wrap');
    const archiveImgCount = archiveImgWraps.length;
    const realHeight = archiveImgCount * window.innerHeight;

    if (lineEl) {
      const twLine = gsap.fromTo(
        lineEl, { width: '0%' },
        {
          width: '100%',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: archiveWrap,
            scroller,
            start: 'top bottom',
            end: `+=${realHeight}`,
            scrub: true
          }
        }
      );
      if (twLine && twLine.scrollTrigger) createdTriggers.push(twLine.scrollTrigger);
      if (twLine) createdTweens.push(twLine);
    }

    const stProgress = ScrollTrigger.create({
      trigger: archiveWrap,
      scroller,
      start: 'top bottom',
      end: `+=${realHeight}`,
      scrub: true,
      onUpdate: self => {
        const val = Math.round(self.progress * 100);
        progressEls.forEach(el => { el.textContent = String(val); });
      }
    });
    createdTriggers.push(stProgress);

    const archiveNameEl = archiveWrap.querySelector('[data-scroll="archive-name"]') ||
      root.querySelector('[data-scroll="archive-name"]') ||
      document.querySelector('[data-scroll="archive-name"]');
    
    if (archiveNameEl && archiveImgWraps.length > 0) {
      archiveImgWraps.forEach((imgWrap, index) => {
        const imgTextEl = imgWrap.querySelector('.archive_img_text');
        const imgText = imgTextEl ? imgTextEl.textContent.trim() : null;
        if (imgText) {
          const stName = ScrollTrigger.create({
            trigger: imgWrap,
            scroller,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
              archiveNameEl.textContent = imgText;
              gsap.fromTo(archiveNameEl, 
                { opacity: 0, yPercent: 110 }, 
                { opacity: 1, yPercent: 0, duration: 0.5, ease: 'expo.out' }
              );
            },
            onEnterBack: () => {
              archiveNameEl.textContent = imgText;
              gsap.fromTo(archiveNameEl, 
                { opacity: 0, yPercent: 110 }, 
                { opacity: 1, yPercent: 0, duration: 0.5, ease: 'expo.out' }
              );
            },
            onLeave: () => {
              gsap.to(archiveNameEl, { opacity: 0, yPercent: 110, duration: 0.3, ease: 'expo.in' });
            },
            onLeaveBack: () => {
              gsap.to(archiveNameEl, { opacity: 0, yPercent: 110, duration: 0.3, ease: 'expo.in' });
            }
          });
          createdTriggers.push(stName);
        }
      });
    }

    let doneOnce = false;
    
    function triggerArchiveAnimation() {
      if (doneOnce) return;
      doneOnce = true;
      window.window.archiveTransitionInProgress = true;
      
      if (scroller && typeof scroller._blockScroll === 'function') {
        scroller._blockScroll();
      }

      const titleEl = archiveWrap.querySelectorAll('.archive_progress_number') ||
        root.querySelector('.archive_progress_number') ||
        document.querySelector('.archive_progress_number');
      if (titleEl) {
        gsap.fromTo(titleEl, { yPercent: 0 }, { yPercent: -130, duration: 0.6, ease: 'expo.out' });
      }

      const countdownElLocal = archiveWrap.querySelector('[data-scroll="number-gone"]');
      const countdownEl = countdownElLocal ||
        root.querySelector('[data-scroll="number-gone"]') ||
        document.querySelector('[data-scroll="number-gone"]');

      const id = archiveWrap.id || '';
      const slug = id.startsWith('next--') ? id.replace('next--', '') : id;
      const nextPage = `/${slug}`;
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (!window.window.archiveTransitionInProgress) {
            return;
          }
          if (nextPage && nextPage !== '/') {
            if (window.barba && typeof barba.go === 'function') {
              const virtualLink = document.createElement('a');
              virtualLink.href = nextPage;
              virtualLink.setAttribute('data-barba-link', 'fade');
              virtualLink.style.display = 'none';
              document.body.appendChild(virtualLink);
              virtualLink.click();
              setTimeout(() => {
                document.body.removeChild(virtualLink);
              }, 100);
            } else {
              window.location.href = nextPage;
            }
          }
        }
      });
      
      tl.to({}, { duration: 0.5 });

      if (lineWrapEl) {
        tl.addLabel('start');
        const clipTween = tl.fromTo(
          lineWrapEl,
          { clipPath: 'inset(0% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 100%)', duration: 1, ease: 'expo.Out' },
          'start'
        );

        if (countdownEl) {
          let remaining = 2;
          countdownEl.textContent = String(remaining);
          const interval = setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
              countdownEl.textContent = '0';
              clearInterval(interval);
            } else {
              countdownEl.textContent = String(remaining);
            }
          }, 1000);
          tl.eventCallback('onComplete', () => {
            try { clearInterval(interval); } catch (e) {}
          });
        }
      } else {
        if (countdownEl) {
          let remaining = 2;
          countdownEl.textContent = String(remaining);
          const interval = setInterval(() => {
            remaining -= 1;
            countdownEl.textContent = String(Math.max(remaining, 0));
            if (remaining <= 0) clearInterval(interval);
          }, 1000);
          gsap.delayedCall(3, () => {
            try { clearInterval(interval); } catch (e) {}
            if (!window.archiveTransitionInProgress) {
              return;
            }
            if (nextPage && nextPage !== '/') animateLeaveThenGoViaBarba(nextPage, 'fade-transition');
          });
        } else {
          gsap.delayedCall(1, () => {
            if (!window.archiveTransitionInProgress) {
              return;
            }
            if (nextPage && nextPage !== '/') animateLeaveThenGoViaBarba(nextPage, 'fade-transition');
          });
        }
      }
      
      tl.play();
      
      gsap.delayedCall(1.25, () => {
        if (!window.archiveTransitionInProgress) {
          return;
        }
        if (nextPage && nextPage !== '/') {
          if (window.barba && typeof barba.go === 'function') {
            const virtualLink = document.createElement('a');
            virtualLink.href = nextPage;
            virtualLink.setAttribute('data-barba-link', 'fade');
            virtualLink.style.display = 'none';
            document.body.appendChild(virtualLink);
            virtualLink.click();
            setTimeout(() => {
              document.body.removeChild(virtualLink);
            }, 100);
          } else {
            window.location.href = nextPage;
          }
        }
      });
    }
    
    const stEnd = ScrollTrigger.create({
      trigger: archiveWrap,
      scroller,
      start: 'bottom bottom',
      end: 'bottom bottom',
      onEnter: () => {
        triggerArchiveAnimation();
      },
      onUpdate: (self) => {
        if (self.progress >= 0.99) {
          triggerArchiveAnimation();
        }
      }
    });
    
    const stEndAlt = ScrollTrigger.create({
      trigger: archiveWrap,
      scroller,
      start: 'top bottom',
      end: `+=${realHeight}`,
      onUpdate: (self) => {
        if (self.progress >= 0.99) {
          triggerArchiveAnimation();
        }
      }
    });
    
    createdTriggers.push(stEndAlt);
    createdTriggers.push(stEnd);
  });

  safeScrollTriggerRefresh();
  setTimeout(() => safeScrollTriggerRefresh(), 0);
}

// Комплексная очистка фич скролла
function cleanupCaseScrollFeatures(scope) {
  if (isMobileOrTablet()) return;
  const el = (scope || document).querySelector('#scroll');
  if (!el) return;

  barbaLog('Cleaning up scroll features', { hasScroll: !!el });

  if (el._smoothScrollCleanup) {
    el._smoothScrollCleanup();
    el._smoothScrollCleanup = null;
  }

  if (el._caseSTCleanup) {
    el._caseSTCleanup();
    el._caseSTCleanup = null;
  }

  const scrollElements = el.querySelectorAll(
    '[data-scroll], .visual_container_btm, .info_divider');
  scrollElements.forEach(element => {
    gsap.killTweensOf(element);
  });
}
