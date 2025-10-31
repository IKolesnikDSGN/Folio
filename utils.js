// --- УТИЛИТЫ И ХЕЛПЕРЫ ---

// Регистрация плагинов GSAP
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// Обновление времени по GMT+3
function updateTimezoneTime() {
  const timezoneSpan = document.querySelector('.timezone_span');
  if (!timezoneSpan) return;

  function formatTime() {
    const now = new Date();
    const gmtPlus3 = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hours = gmtPlus3.getUTCHours().toString().padStart(2, '0');
    const minutes = gmtPlus3.getUTCMinutes().toString().padStart(2, '0');
    return `${hours} : ${minutes}`;
  }

  timezoneSpan.textContent = formatTime();
  setInterval(() => {
    timezoneSpan.textContent = formatTime();
  }, 60000);
}

// Система управления состоянием Barba
window._barbaState = {
  isSamePageTransition: false,
  instantNavInProgress: false,
  currentTransition: null,
  debug: false,
  isBackNavigation: false,
  navigationHistory: []
};

// Функция логирования (можно включить/выключить)
function barbaLog(message, data = null) {
  if (window._barbaState.debug) {
    console.log(`[Barba] ${message}`, data);
  }
}

// Управление историей навигации
function addToNavigationHistory(url) {
  const currentPath = window.location.pathname;
  if (currentPath !== url) {
    window._barbaState.navigationHistory.push(currentPath);
    if (window._barbaState.navigationHistory.length > 10) {
      window._barbaState.navigationHistory.shift();
    }
    barbaLog('Added to navigation history', {
      url,
      history: window._barbaState.navigationHistory
    });
  }
}

function isBackNavigation(targetUrl) {
  const history = window._barbaState.navigationHistory;
  const isBack = history.includes(targetUrl);
  barbaLog('Checking back navigation', { targetUrl, isBack, history });
  return isBack;
}

// Обработчик кнопки назад в браузере
function initBackButtonHandler() {
  window.addEventListener('popstate', function (event) {
    barbaLog('Popstate event detected', {
      state: event.state,
      currentPath: window.location.pathname
    });

    window._barbaState.isBackNavigation = true;

    if (window.barba && typeof barba.go === 'function') {
      barbaLog('Triggering crossfade transition for back navigation');
      barba.go(window.location.href, 'opacity-crossfade');
    } else {
      window.location.reload();
    }
  });

  barbaLog('Back button handler initialized');
}

// Обновление текущего класса навигации
function updateCurrentClass() {
  $(".page_link").removeClass("w--current");
  $(".page_link").each(function () {
    if ($(this).attr("href") === window.location.pathname) {
      $(this).addClass("w--current");
    }
  });
}

// Обновление страницы
function updatePage() {
  $(window).scrollTop(0);
}

// Синхронизация класса проекта
function syncProjectClass(scope) {
  const root = scope || document;
  const projectElement = root.querySelector('[data-project-class]');
  if (!projectElement) {
    barbaLog('No project-class element found');
    return;
  }

  const projectClass = projectElement.getAttribute('data-project-class');
  const projectWrapper = document.querySelector('.project-wrapper');

  if (projectWrapper) {
    barbaLog('Syncing project class', {
      currentClasses: projectWrapper.className,
      newClass: projectClass
    });

    projectWrapper.classList.remove('show', 'hide');
    if (projectClass === 'show' || projectClass === 'hide') {
      projectWrapper.classList.add(projectClass);
      barbaLog('Project wrapper class updated', {
        newClasses: projectWrapper.className
      });
    }
  } else {
    barbaLog('Project wrapper not found');
  }
}

// Проверка мобильного/планшетного устройства
function isMobileOrTablet() {
  // Проверка ширины экрана (планшет обычно < 1024px, мобильный < 768px)
  const width = window.innerWidth || document.documentElement.clientWidth;
  return width < 1024;
}

// Утилиты для дебага
window.toggleBarbaDebug = function () {
  window._barbaState.debug = !window._barbaState.debug;
  console.log(`[Barba] Debug mode ${window._barbaState.debug ? 'enabled' : 'disabled'}`);
  return window._barbaState.debug;
};

window.resetBarbaState = function () {
  window._barbaState.isSamePageTransition = false;
  window._barbaState.instantNavInProgress = false;
  window._barbaState.currentTransition = null;
  window._barbaState.isBackNavigation = false;
  window._barbaState.navigationHistory = [];
  console.log('[Barba] State reset');
};

window.findBarbaLinks = function () {
  const allLinks = document.querySelectorAll('a[data-barba-link]');
  const projectWrapperLinks = document.querySelectorAll('.project-wrapper a[data-barba-link]');
  const visibleProjectLinks = Array.from(projectWrapperLinks).filter(link => {
    const wrapper = link.closest('.project-wrapper');
    return wrapper && !wrapper.classList.contains('hide') &&
      wrapper.style.display !== 'none' &&
      wrapper.style.visibility !== 'hidden';
  });

  console.log('[Barba] Found links:', {
    total: allLinks.length,
    inProjectWrapper: projectWrapperLinks.length,
    visibleInProjectWrapper: visibleProjectLinks.length,
    projectWrapperState: document.querySelector('.project-wrapper')?.className || 'not found'
  });

  return {
    all: allLinks,
    inProjectWrapper: projectWrapperLinks,
    visibleInProjectWrapper: visibleProjectLinks
  };
};

// Функция обновления ScrollTrigger
function safeScrollTriggerRefresh() {
  if (window.ScrollTrigger) {
    try {
      ScrollTrigger.refresh();
      barbaLog('ScrollTrigger refreshed successfully');
    } catch (error) {
      console.error('[Barba] ScrollTrigger refresh error:', error);
    }
  }
}
