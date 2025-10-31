function initFirstLoadAnimation(container) {
  const root = container || document;

  const loaderContainer = root.querySelector('.loader_container');
  const loaderDivider = root.querySelector('.loader_divider');

  if (!loaderContainer || !loaderDivider) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let isResolved = false;

    function completeAnimation() {
      if (isResolved) return;
      isResolved = true;
      resolve();
    }

    loaderContainer.style.display = 'flex';
    gsap.set(loaderDivider, { height: '0%' });

    loadResourcesWithProgress(loaderDivider).then(() => {
      const loaderDividerWrap = root.querySelector('.loader_divider-wrap');
      if (loaderDividerWrap) {
        loaderDividerWrap.classList.add('loaded');
      }

      setTimeout(() => {
        gsap.to(loaderContainer, {
          opacity: 0,
          duration: 0.3,
          ease: "power1.inOut",
          onComplete: () => {
            loaderContainer.style.display = 'none';
          }
        });

        startPageAnimations(root);
        completeAnimation();
      }, 500);
    }).catch((error) => {
      completeAnimation();
    });

    setTimeout(() => {
      if (!isResolved) {
        completeAnimation();
      }
    }, 10000);
  });
}

function startPageAnimations(container) {
  const root = container || document;

  return new Promise((resolve) => {
    updateCurrentClass();
    updatePage();
    updateTimezoneTime();
    animatePageIntro(root);
    initCaseSmoothScroll(root);
    initCaseScrollTriggers(root);
    initVisualSlider(root);
    initDropdown(root);
    initHomeSlider(root);
    initNav(root);
    initFieldFillerAnimation(root);
    initArchiveThumb(root);
    syncProjectClass(root);

    if (window.ScrollTrigger) {
      safeScrollTriggerRefresh();
      setTimeout(() => {
        safeScrollTriggerRefresh();
      }, 100);
    }

    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

function loadResourcesWithProgress(progressElement) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let loadedResources = 0;
    let totalResources = 0;
    let progress = 0;
    let isCompleted = false;

    function updateProgress() {
      progress = (loadedResources / totalResources) * 100;
      gsap.to(progressElement, {
        height: `${Math.min(progress, 100)}%`,
        duration: 0.3,
        ease: "power2.out"
      });

      if (loadedResources >= totalResources && !isCompleted) {
        completeLoading();
      }
    }

    function completeLoading() {
      if (isCompleted) return;
      isCompleted = true;

      gsap.to(progressElement, {
        height: '100%',
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          setTimeout(() => {
            resolve();
          }, 200);
        }
      });
    }

    const images = document.querySelectorAll('img');
    totalResources += images.length;

    images.forEach(img => {
      if (img.complete) {
        loadedResources++;
        updateProgress();
      } else {
        img.addEventListener('load', () => {
          loadedResources++;
          updateProgress();
        });
        img.addEventListener('error', () => {
          loadedResources++;
          updateProgress();
        });
      }
    });

    if (document.fonts && document.fonts.ready) {
      totalResources++;
      document.fonts.ready.then(() => {
        loadedResources++;
        updateProgress();
      });
    }

    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    totalResources += cssLinks.length;

    cssLinks.forEach(link => {
      if (link.sheet) {
        loadedResources++;
        updateProgress();
      } else {
        link.addEventListener('load', () => {
          loadedResources++;
          updateProgress();
        });
        link.addEventListener('error', () => {
          loadedResources++;
          updateProgress();
        });
      }
    });

    const jsScripts = document.querySelectorAll('script[src]');
    totalResources += jsScripts.length;

    jsScripts.forEach(script => {
      if (script.readyState === 'complete' || script.readyState === 'loaded') {
        loadedResources++;
        updateProgress();
      } else {
        script.addEventListener('load', () => {
          loadedResources++;
          updateProgress();
        });
        script.addEventListener('error', () => {
          loadedResources++;
          updateProgress();
        });
      }
    });

    if (totalResources === 0) {
      setTimeout(() => {
        completeLoading();
      }, 100);
      return;
    }

    const minLoadTime = 2500;

    setTimeout(() => {
      if (!isCompleted) {
        loadedResources = totalResources;
        completeLoading();
      }
    }, minLoadTime);

    setTimeout(() => {
      if (!isCompleted) {
        loadedResources = totalResources;
        completeLoading();
      }
    }, 8000);

    if (document.readyState === 'complete') {
      setTimeout(() => {
        if (!isCompleted) {
          loadedResources = totalResources;
          completeLoading();
        }
      }, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (!isCompleted) {
            loadedResources = totalResources;
            completeLoading();
          }
        }, 100);
      });
    }
  });
}

function initializePage(container) {
  const initialContainer = container || document.querySelector('[data-barba="container"]') || document;

  const workSlides = initialContainer.querySelectorAll('.work_slide');
  const workThumbWraps = initialContainer.querySelectorAll('.work_thumb_wrap');

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
  }, 900);

  updateCurrentClass();
  updatePage();
  updateTimezoneTime();
  animatePageIntro(initialContainer);
  initCaseSmoothScroll(initialContainer);
  initCaseScrollTriggers(initialContainer);
  initVisualSlider(initialContainer);
  initDropdown(initialContainer);
  initHomeSlider(initialContainer);
  initNav(initialContainer);
  initFieldFillerAnimation(initialContainer);
  initArchiveThumb(initialContainer);
  syncProjectClass(initialContainer);

  if (window.ScrollTrigger) {
    safeScrollTriggerRefresh();
    setTimeout(() => {
      safeScrollTriggerRefresh();
    }, 100);
  }
}

$(function () {
  try {
    const initialContainer = document.querySelector('[data-barba="container"]') || document;

    initBackButtonHandler();

    const isFirstLoad = !sessionStorage.getItem('pageLoaded');
    const isPageReload = performance.navigation && performance.navigation.type === 1;
    const isManualReload = performance.navigation && performance.navigation.type === 1;
    const isHardReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';

    if (isFirstLoad || isPageReload || isManualReload || isHardReload) {
      initFirstLoadAnimation(initialContainer).then(() => {
        initializePage(initialContainer);
      });
    } else {
      initializePage(initialContainer);
    }

    sessionStorage.setItem('pageLoaded', 'true');

  } catch (error) {
  }
});
