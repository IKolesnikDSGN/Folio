document.addEventListener('click', function (e) {
  const link = e.target.closest('a[data-barba-link="seamless"]');
  if (!link) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (link.target && link.target !== '_self') return;

  const currentPath = window.location.pathname;
  const linkPath = new URL(link.href, window.location.origin).pathname;
  if (currentPath === linkPath) {
    window._barbaState.isSamePageTransition = true;
    return;
  }

  addToNavigationHistory(linkPath);
  e.preventDefault();
  e.stopPropagation();
  
  if (isMobileOrTablet()) {
    if (window.barba && typeof barba.go === 'function') {
      barba.go(link.href, 'opacity-crossfade');
    } else {
      window.location.href = link.href;
    }
  } else {
    animateLeaveAndGo(link.href);
  }
}, true);

document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href]');
  if (!link) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (link.target && link.target !== '_self') return;

  const currentPath = window.location.pathname;
  const linkPath = new URL(link.href, window.location.origin).pathname;
  if (currentPath === linkPath) {
    e.preventDefault();
    e.stopPropagation();
    window._barbaState.isSamePageTransition = true;
    return false;
  }

  if (!link.getAttribute('data-barba-link') || link.getAttribute('data-barba-link') !== 'seamless') {
    addToNavigationHistory(linkPath);
  }
}, true);

function initBarba() {
  barba.init({
    schema: { prefix: 'data-barba' },
    prevent: ({ el }) => {
      if (window.window.archiveTransitionInProgress) {
        window.window.archiveTransitionInProgress = false;
      }

      if (el && el.getAttribute('data-barba-link') === 'seamless') {
        if (!isMobileOrTablet()) {
          return true;
        } else {
          return false;
        }
      }

      if (el && el.closest('.project-wrapper')) {
        const projectWrapper = el.closest('.project-wrapper');
        const isHidden = projectWrapper.classList.contains('hide') ||
          projectWrapper.style.display === 'none' ||
          projectWrapper.style.visibility === 'hidden';

        if (isHidden) {
          return true;
        }
      }

      if (el && el.href) {
        const currentPath = window.location.pathname;
        const linkPath = new URL(el.href, window.location.origin).pathname;
        if (currentPath === linkPath) {
          window._barbaState.isSamePageTransition = true;
          return true;
        }
      }

      if (window._barbaState.isSamePageTransition) {
        return true;
      }

      if (!window._barbaState.isSamePageTransition) {
        window._barbaState.isSamePageTransition = false;
      }

      return false;
    },
    transitions: [
      {
        name: 'fade-transition',
        sync: true,
        custom: ({ trigger }) => {
          if (isMobileOrTablet()) {
            return false;
          }
          const isFadeLink = trigger && trigger.getAttribute('data-barba-link') === 'fade';
          const isProgrammaticFade = window._barbaState.useFadeTransition;
          return isFadeLink || isProgrammaticFade;
        },
        beforeLeave: ({ current }) => {
          saveScrollTriggerState(current.container);
          window._oldContainer = current.container;
          gsap.killTweensOf(current.container);

          return gsap.set(current.container, { zIndex: 1 });
        },
        leave: ({ current }) => {
          const tl = gsap.timeline();
          const overlay = current.container.querySelector('.overlay');
          const lightbox = current.container.querySelector('[data-out-reveal="out"]');

          tl.to(current.container, {
            y: -250,
            opacity: 0.2,
            duration: 1.1,
            ease: "power3.inOut"
          }, 0);

          const scrollElements = current.container.querySelectorAll(
            '.next_page_visual, .divider_wrap, .info_wrapper, .info_divider'
          );

          scrollElements.forEach(element => {
            tl.to(element, {
              y: 0,
              duration: 1.1,
              ease: "power3.inOut"
            }, 0);
          });

          if (lightbox && lightbox.style.display === 'block') {
            tl.to(lightbox, {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: "power3.inOut",
              force3D: true,
              overwrite: "auto"
            }, 0);
          }

          if (overlay) {
            tl.to(overlay, {
              opacity: 1,
              duration: 0.1,
              ease: "power3.inOut"
            }, 0);
          }
          return tl;
        },
        enter: ({ next }) => {
          $(next.container).addClass("fixed");
          updateTimezoneTime();
          animatePageIntroForFade(next.container, window._barbaState.isSamePageTransition);
          initCaseSmoothScroll(next.container);
          initCaseScrollTriggers(next.container);
          initVisualSlider(next.container);
          initDropdown(next.container);
          initHomeSlider(next.container);
          initNav(next.container);
          initFieldFillerAnimation(next.container);
          initArchiveThumb(next.container);

          addDelayedLoadedClass(next.container, 500);
          splitLinesAnimation(next.container, 400);

          return gsap.from(next.container, {
            zIndex: 3,
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.1,
            ease: "expo.inOut",
            onComplete: function () {
              updateCurrentClass();
              updatePage();
              $(next.container).removeClass("fixed");
              syncProjectClass(next.container);

              const workSlides = next.container.querySelectorAll('.work_slide');
              const workThumbWraps = next.container.querySelectorAll('.work_thumb_wrap');

              workSlides.forEach(slide => {
                slide.style.pointerEvents = 'none';
                slide.style.cursor = 'default';
              });

              workThumbWraps.forEach(thumb => {
                thumb.style.pointerEvents = 'none';
                thumb.style.cursor = 'default';
              });

              setTimeout(() => {
                workSlides.forEach(slide => {
                  slide.style.pointerEvents = 'auto';
                  slide.style.cursor = 'pointer';
                });

                workThumbWraps.forEach(thumb => {
                  thumb.style.pointerEvents = 'auto';
                  thumb.style.cursor = 'pointer';
                });

              }, 1200);

              if (window._oldContainer) {
                cleanupCaseScrollFeatures(window._oldContainer);
                window._oldContainer = null;
              }

              window._barbaState.instantNavInProgress = false;
              window._barbaState.isSamePageTransition = false;
              window._barbaState.useFadeTransition = false;
              clearScrollTriggerState();
              safeScrollTriggerRefresh();
            }
          });
        }
      },
      {
        name: 'opacity-crossfade',
        sync: true,
        custom: ({ trigger }) => {
          if (isMobileOrTablet()) {
            return true;
          }
          if (window._barbaState.isBackNavigation) {
            return true;
          }
          if (window._barbaState.useFadeTransition) {
            return true;
          }
          return trigger && trigger.getAttribute('data-barba-link') === 'trans';
        },
        beforeLeave: ({ current }) => {
          cleanupCaseScrollFeatures(current.container);
          gsap.killTweensOf(current.container);

          return gsap.set(current.container, { zIndex: 1, opacity: 1 });
        },
        leave: ({ current }) => {
          const duration = isMobileOrTablet() ? 0.5 : 0.6;
          return gsap.to(current.container, {
            opacity: 0,
            duration: duration,
            ease: "power1.out"
          });
        },
        enter: ({ next }) => {
          $(next.container).addClass("fixed");
          gsap.set(next.container, { zIndex: 3, opacity: 0 });
          updateTimezoneTime();
          animatePageIntro(next.container, window._barbaState.isSamePageTransition);
          
          if (isMobileOrTablet()) {
            addDelayedLoadedClass(next.container, 500);
            splitLinesAnimation(next.container, 400);
          }
          
          initCaseSmoothScroll(next.container);
          initCaseScrollTriggers(next.container);
          initVisualSlider(next.container);
          initDropdown(next.container);
          initHomeSlider(next.container);
          initNav(next.container);
          initFieldFillerAnimation(next.container);
          initArchiveThumb(next.container);
          const duration = isMobileOrTablet() ? 0.5 : 0.6;
          return gsap.to(next.container, {
            opacity: 1,
            duration: duration,
            ease: "power1.out",
            onComplete: function () {
              updateCurrentClass();
              updatePage();
              $(next.container).removeClass("fixed");
              syncProjectClass(next.container);

              const workSlides = next.container.querySelectorAll('.work_slide');
              const workThumbWraps = next.container.querySelectorAll('.work_thumb_wrap');

              workSlides.forEach(slide => {
                slide.style.pointerEvents = 'none';
                slide.style.cursor = 'default';
              });

              workThumbWraps.forEach(thumb => {
                thumb.style.pointerEvents = 'none';
                thumb.style.cursor = 'default';
              });

              setTimeout(() => {
                workSlides.forEach(slide => {
                  slide.style.pointerEvents = 'auto';
                  slide.style.cursor = 'pointer';
                });

                workThumbWraps.forEach(thumb => {
                  thumb.style.pointerEvents = 'auto';
                  thumb.style.cursor = 'pointer';
                });

              }, 1200);

              window._barbaState.instantNavInProgress = false;
              window._barbaState.isSamePageTransition = false;
              window._barbaState.isBackNavigation = false;
              window._barbaState.useFadeTransition = false;
              safeScrollTriggerRefresh();
            }
          });
        }
      },
      {
        name: 'instant-transition',
        sync: true,
        custom: ({ trigger }) => {
          if (isMobileOrTablet()) {
            return false;
          }
          return !trigger || (
            trigger.getAttribute('data-barba-link') !== 'fade' &&
            trigger.getAttribute('data-barba-link') !== 'seamless' &&
            trigger.getAttribute('data-barba-link') !== 'trans'
          );
        },
        beforeLeave: ({ current }) => {
          cleanupCaseScrollFeatures(current.container);
          gsap.killTweensOf(current.container);
        },
        enter: ({ next }) => {
          updateCurrentClass();
          updatePage();
          updateTimezoneTime();
          animatePageIntro(next.container, window._barbaState.isSamePageTransition);
          initCaseSmoothScroll(next.container);
          initCaseScrollTriggers(next.container);
          initVisualSlider(next.container);
          initDropdown(next.container);
          initHomeSlider(next.container);
          initNav(next.container);
          initFieldFillerAnimation(next.container);
          initArchiveThumb(next.container);
          syncProjectClass(next.container);

          const workSlides = next.container.querySelectorAll('.work_slide');
          const workThumbWraps = next.container.querySelectorAll('.work_thumb_wrap');

          workSlides.forEach(slide => {
            slide.style.pointerEvents = 'none';
            slide.style.cursor = 'default';
          });

          workThumbWraps.forEach(thumb => {
            thumb.style.pointerEvents = 'none';
            thumb.style.cursor = 'default';
          });

          setTimeout(() => {
            workSlides.forEach(slide => {
              slide.style.pointerEvents = 'auto';
              slide.style.cursor = 'pointer';
            });

            workThumbWraps.forEach(thumb => {
              thumb.style.pointerEvents = 'auto';
              thumb.style.cursor = 'pointer';
            });

          }, 1200);

          window._barbaState.instantNavInProgress = false;
          window._barbaState.isSamePageTransition = false;
          safeScrollTriggerRefresh();
        }
      }]
  });
}
