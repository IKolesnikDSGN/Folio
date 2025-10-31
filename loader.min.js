// --- АНИМАЦИЯ ЗАГРУЗКИ И ИНИЦИАЛИЗАЦИЯ ---

// Анимация первой загрузки с лоадером
function initFirstLoadAnimation(container) {
  const root = container || document;

  const loaderContainer = root.querySelector('.loader_container');
  const loaderDivider = root.querySelector('.loader_divider');

  if (!loaderContainer || !loaderDivider) {
    barbaLog('Loader elements not found, skipping first load animation');
    return Promise.resolve();
  }

  barbaLog('Starting first load animation with real loading');

  return new Promise((resolve) => {
    let isResolved = false;

    function completeAnimation() {
      if (isResolved) return;
      isResolved = true;

      barbaLog('Loader animation completed');
      resolve();
    }

    loaderContainer.style.display = 'flex';
    gsap.set(loaderDivider, { height: '0%' });

    loadResourcesWithProgress(loaderDivider).then(() => {
      barbaLog('All resources loaded, adding loaded class to divider-wrap');

      const loaderDividerWrap = root.querySelector('.loader_divider-wrap');
      if (loaderDividerWrap) {
        loaderDividerWrap.classList.add('loaded');
        barbaLog('Loaded class added to divider-wrap');
      }

      setTimeout(() => {
        barbaLog('Starting fade out after delay');

        gsap.to(loaderContainer, {
          opacity: 0,
          duration: 0.3,
          ease: "power1.inOut",
          onComplete: () => {
            loaderContainer.style.display = 'none';
            barbaLog('Loader hidden');
          }
        });

        startPageAnimations(root);
        completeAnimation();
      }, 500);
    }).catch((error) => {
      barbaLog('Error in loadResourcesWithProgress, forcing completion', { error });
      completeAnimation();
    });

    setTimeout(() => {
      if (!isResolved) {
        barbaLog('Loader animation timeout, forcing completion');
        completeAnimation();
      }
    }, 10000);
  });
}

// Функция запуска анимаций страницы
function startPageAnimations(container) {
  const root = container || document;

  barbaLog('Starting page animations');

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

// Функция загрузки ресурсов с прогрессом
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

      barbaLog('All resources loaded, ensuring 100% progress');
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

    // Загружаем изображения
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

    // Загружаем шрифты
    if (document.fonts && document.fonts.ready) {
      totalResources++;
      document.fonts.ready.then(() => {
        loadedResources++;
        updateProgress();
      });
    }

    // Загружаем CSS файлы
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

    // Загружаем JavaScript файлы
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

    // Если нет ресурсов для загрузки, сразу завершаем
    if (totalResources === 0) {
      barbaLog('No resources to load, completing immediately');
      setTimeout(() => {
        completeLoading();
      }, 100);
      return;
    }

    // Минимальное время загрузки
    const minLoadTime = 2500;

    setTimeout(() => {
      if (!isCompleted) {
        barbaLog('Minimum load time reached, forcing completion');
        loadedResources = totalResources;
        completeLoading();
      }
    }, minLoadTime);

    // Максимальное время загрузки
    setTimeout(() => {
      if (!isCompleted) {
        barbaLog('Loading timeout reached, forcing completion');
        loadedResources = totalResources;
        completeLoading();
      }
    }, 8000);

    // Дополнительная проверка через document.readyState
    if (document.readyState === 'complete') {
      setTimeout(() => {
        if (!isCompleted) {
          barbaLog('Document ready state complete, forcing completion');
          loadedResources = totalResources;
          completeLoading();
        }
      }, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (!isCompleted) {
            barbaLog('Window load event fired, forcing completion');
            loadedResources = totalResources;
            completeLoading();
          }
        }, 100);
      });
    }
  });
}

// Функция инициализации страницы
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

    barbaLog('Work slides and thumb wraps are now clickable');
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

  barbaLog('Page initialization completed successfully');
}

// Первая загрузка
$(function () {
  barbaLog('Initial page load started');

  try {
    const initialContainer = document.querySelector('[data-barba="container"]') || document;

    initBackButtonHandler();

    const isFirstLoad = !sessionStorage.getItem('pageLoaded');
    const isPageReload = performance.navigation && performance.navigation.type === 1;
    const isManualReload = performance.navigation && performance.navigation.type === 1;
    const isHardReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';

    if (isFirstLoad || isPageReload || isManualReload || isHardReload) {
      barbaLog('First load or page reload detected, starting loader animation', {
        isFirstLoad,
        isPageReload,
        isManualReload,
        isHardReload,
        navigationType: performance.navigation?.type
      });

      initFirstLoadAnimation(initialContainer).then(() => {
        initializePage(initialContainer);
      });
    } else {
      barbaLog('Regular page load, skipping loader animation');
      initializePage(initialContainer);
    }

    sessionStorage.setItem('pageLoaded', 'true');

  } catch (error) {
    console.error('[Barba] Error during initial page load:', error);
    barbaLog('Initial page load failed', { error: error.message });
  }
});
