if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

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

window._barbaState = {
  isSamePageTransition: false,
  instantNavInProgress: false,
  currentTransition: null,
  debug: false,
  isBackNavigation: false,
  navigationHistory: []
};

function barbaLog(message, data = null) {
  if (window._barbaState.debug) {
    console.log(`[Barba] ${message}`, data);
  }
}

function addToNavigationHistory(url) {
  const currentPath = window.location.pathname;
  if (currentPath !== url) {
    window._barbaState.navigationHistory.push(currentPath);
    if (window._barbaState.navigationHistory.length > 10) {
      window._barbaState.navigationHistory.shift();
    }
  }
}

function isBackNavigation(targetUrl) {
  const history = window._barbaState.navigationHistory;
  const isBack = history.includes(targetUrl);
  return isBack;
}

function initBackButtonHandler() {
  window.addEventListener('popstate', function (event) {
    window._barbaState.isBackNavigation = true;

    if (window.barba && typeof barba.go === 'function') {
      barba.go(window.location.href, 'opacity-crossfade');
    } else {
      window.location.reload();
    }
  });
}

function updateCurrentClass() {
  $(".page_link").removeClass("w--current");
  $(".page_link").each(function () {
    if ($(this).attr("href") === window.location.pathname) {
      $(this).addClass("w--current");
    }
  });
}

function updatePage() {
  $(window).scrollTop(0);
}

function syncProjectClass(scope) {
  const root = scope || document;
  const projectElement = root.querySelector('[data-project-class]');
  if (!projectElement) {
    return;
  }

  const projectClass = projectElement.getAttribute('data-project-class');
  const projectWrapper = document.querySelector('.project-wrapper');

  if (projectWrapper) {
    projectWrapper.classList.remove('show', 'hide');
    if (projectClass === 'show' || projectClass === 'hide') {
      projectWrapper.classList.add(projectClass);
    }
  }
}

function isMobileOrTablet() {
  const width = window.innerWidth || document.documentElement.clientWidth;
  return width < 1024;
}

window.toggleBarbaDebug = function () {
  window._barbaState.debug = !window._barbaState.debug;
  return window._barbaState.debug;
};

window.resetBarbaState = function () {
  window._barbaState.isSamePageTransition = false;
  window._barbaState.instantNavInProgress = false;
  window._barbaState.currentTransition = null;
  window._barbaState.isBackNavigation = false;
  window._barbaState.navigationHistory = [];
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

  return {
    all: allLinks,
    inProjectWrapper: projectWrapperLinks,
    visibleInProjectWrapper: visibleProjectLinks
  };
};

function safeScrollTriggerRefresh() {
  if (window.ScrollTrigger) {
    try {
      ScrollTrigger.refresh();
    } catch (error) {
    }
  }
}
