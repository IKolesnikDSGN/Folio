function initHomeSlider(scope) {
  if (window.innerWidth < 1024) return;
  
  const root = scope || document;
  const thumbs = Array.from(root.querySelectorAll('.work_thumb_wrap'));
  const slides = Array.from(root.querySelectorAll('.work_slide'));
  const divider = root.querySelector('.work_thumb_divider');
  let zIndexCounter = 10;
  let activeIndex = 0;
  let isClicked = false;

  if (!thumbs.length || !slides.length || !divider) return;

  slides.forEach((slide, i) => {
    const img = slide.querySelector('.work_slide_img');
    if (img) {
      img.style.opacity = (i === 0) ? '1' : '0';
    }
    const info = slide.querySelector('.work_slide_info');
    if (info) {
      info.style.opacity = (i === 0) ? '1' : '0';
    }
  });

  slides[0].style.zIndex = zIndexCounter++;
  slides[0].style.clipPath = "inset(0% 0% 0% 0%)";
  thumbs[0].appendChild(divider);

  function disableAllThumbs() {
    isClicked = true;
    
    thumbs.forEach((thumb, index) => {
      if (index !== activeIndex) {
        const workThumbLinks = thumb.querySelectorAll('.work_thumb a');
        const allLinks = thumb.querySelectorAll('a');
        
        workThumbLinks.forEach((link) => {
          link.style.pointerEvents = 'none';
        });
        
        allLinks.forEach((link) => {
          link.style.pointerEvents = 'none';
        });
      }
    });
    
    slides.forEach((slide, index) => {
      if (index !== activeIndex) {
        gsap.to(slide, {
          opacity: 0,
          duration: 0.1,
          ease: "power2.out",
          onComplete: () => {
            slide.style.display = 'none';
          }
        });
      }
    });
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      disableAllThumbs();
    });
    
    thumb.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      disableAllThumbs();
    });

    thumb.addEventListener('mouseenter', () => {
      if (isClicked || activeIndex === i) return;

      const slide = slides[i];
      const prevSlide = slides[activeIndex];

      if (slide.style.display === 'none') {
        slide.style.display = '';
        gsap.set(slide, { opacity: 1 });
      }

      slides.forEach((slideItem, j) => {
        slideItem.style.zIndex = (j === i) ? zIndexCounter++ : 1;
      });

      gsap.fromTo(
        slide, { clipPath: "inset(100% 0% 0% 0%)", autoAlpha: 1 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
          overwrite: true
        }
      );

      const img = slide.querySelector('.work_slide_img');
      if (img) {
        gsap.set(img, { opacity: 1 });
        gsap.fromTo(
          img, { scale: 1.3 },
          {
            scale: 1,
            duration: 1.2,
            ease: "expo.out",
            overwrite: true
          }
        );
      }

      const info = slide.querySelector('.work_slide_info');
      if (info) {
        gsap.fromTo(
          info,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            delay: 0.2,
            ease: "expo.out",
            overwrite: true
          }
        );
      }

      const badges = slide.querySelectorAll('[work-slide-component="badge"]');
      badges.forEach((badge, b) => {
        gsap.fromTo(
          badge, { opacity: 1, y: 0 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: 0.06 * b,
            ease: "expo.out",
            overwrite: true
          }
        );
      });

      const state = Flip.getState(divider);
      thumbs[i].appendChild(divider);
      Flip.from(state, {
        duration: 0.6,
        ease: "expo.out"
      });

      if (activeIndex !== i && prevSlide) {
        const prevImg = prevSlide.querySelector('.work_slide_img');
        if (prevImg) {
          gsap.to(prevImg, {
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            overwrite: true
          });
        }
        const prevInfo = prevSlide.querySelector('.work_slide_info');
        if (prevInfo) {
          gsap.to(prevInfo, {
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            overwrite: true
          });
        }
      }

      activeIndex = i;
    });

    thumb.addEventListener('mouseleave', () => {
      if (isClicked && activeIndex === i) return;
      
      setTimeout(() => {
        const isAnyHovered = thumbs.some(t => t.matches(':hover'));
        
        if (activeIndex === i) {
          if (!isAnyHovered) {
            const targetIndex = 0;
            const targetSlide = slides[targetIndex];
            
            if (targetSlide.style.display === 'none') {
              targetSlide.style.display = '';
              gsap.set(targetSlide, { opacity: 1 });
            }
            
            slides.forEach((slideItem, j) => {
              slideItem.style.zIndex = (j === targetIndex) ? zIndexCounter++ : 1;
            });
            
            gsap.to(targetSlide, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.4,
              ease: "expo.out",
              overwrite: true
            });
            
            const targetImg = targetSlide.querySelector('.work_slide_img');
            if (targetImg) {
              gsap.to(targetImg, {
                opacity: 1,
                duration: 0.9,
                ease: "expo.out",
                overwrite: true
              });
            }
            const targetInfo = targetSlide.querySelector('.work_slide_info');
            if (targetInfo) {
              gsap.to(targetInfo, {
                opacity: 1,
                duration: 0.9,
                ease: "expo.out",
                overwrite: true
              });
            }
            
            if (i !== targetIndex) {
              const currentImg = slides[i].querySelector('.work_slide_img');
              if (currentImg) {
                gsap.to(currentImg, {
                  opacity: 0,
                  duration: 0.9,
                  ease: "expo.out",
                  overwrite: true
                });
              }
              const currentInfo = slides[i].querySelector('.work_slide_info');
              if (currentInfo) {
                gsap.to(currentInfo, {
                  opacity: 0,
                  duration: 0.9,
                  ease: "expo.out",
                  overwrite: true
                });
              }
            }
            
            const state = Flip.getState(divider);
            thumbs[targetIndex].appendChild(divider);
            Flip.from(state, {
              duration: 0.6,
              ease: "expo.out"
            });
            
            activeIndex = targetIndex;
          } else {
            slides[i].style.zIndex = 1;
            gsap.to(slides[i], {
              clipPath: "inset(0% 0% 100% 0%)",
              duration: 1.4,
              ease: "expo.out",
              overwrite: true
            });
            const img = slides[i].querySelector('.work_slide_img');
            if (img) {
              gsap.to(img, {
                opacity: 0,
                duration: 1,
                ease: "expo.out",
                overwrite: true
              });
            }
            const info = slides[i].querySelector('.work_slide_info');
            if (info) {
              gsap.to(info, {
                opacity: 0,
                duration: 0.4,
                delay: 0,
                ease: "expo.out",
                overwrite: true
              });
            }
          }
        }
      }, 10);
    });
  });

  slides.forEach((slide, index) => {
    slide.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      disableAllThumbs();
    });
    
    slide.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      disableAllThumbs();
    });
  });
}

function initNav(scope) {
  if (window.innerWidth < 1024) return;
  
  const root = scope || document;

  const nav = root.querySelector('.nav');
  const trigger = root.querySelector('[data-nav-reveal="trigger"]');
  const menuBg = root.querySelector('.menu-bg');
  const aboutContainer = root.querySelector('.about_container');
  const btnTexts = root.querySelectorAll('[data-nav-reveal="btn-text"]');
  const items = root.querySelectorAll('[data-nav-reveal="item"]');
  const paths = root.querySelectorAll('[data-nav-reveal="path"]');
  const pathPosters = root.querySelectorAll('[data-nav-reveal="path-poster"]');
  const imgs = root.querySelectorAll('[data-nav-reveal="img"]');
  const aboutTabs = root.querySelectorAll('.about-tab');
  const aboutPlanes = root.querySelectorAll('.about_plane');
  const tabDivider = root.querySelector('.tab_divider');
  const aboutMainPWrap = root.querySelector('.about_main-p_wrap');

  if (!nav || !trigger) return;

  if (trigger._navCleanup) trigger._navCleanup();

  // Начальные состояния
  gsap.set(nav, { height: "2.5rem" });
  gsap.set(aboutContainer, { opacity: 0 });
  gsap.set(btnTexts, { yPercent: 0 });
  gsap.set(items, { opacity: 0 });
  gsap.set(paths, { yPercent: 0 });
  gsap.set(pathPosters, { yPercent: 130 });
  gsap.set(imgs, { opacity: 0 });
  gsap.set(aboutMainPWrap, { opacity: 1 });
  aboutPlanes.forEach((plane, i) => {
    plane.classList.toggle('is-active', i === 0);
  });

  let navOpen = false;

  // Открытие NAV
  function openNav() {
    navOpen = true;

    gsap.to(nav, { height: "80vh", duration: 1.2, ease: "expo.inOut" });
    gsap.to(aboutContainer, { opacity: 1, duration: 0.5, delay: 0.45, ease: "power2.out" });
    gsap.to(btnTexts, { yPercent: -100, duration: 0.8, ease: "expo.out" });
    gsap.to(items, { opacity: 1, duration: 1, delay: 0.45, stagger: 0.1, ease: "power1.out" });
    gsap.to(paths, {
      yPercent: -100,
      duration: 1,
      delay: 0.45,
      stagger: { amount: 0.12, from: "center" },
      ease: "expo.out"
    });
    gsap.to(pathPosters, {
      yPercent: 0,
      from: { yPercent: 130 },
      duration: 1.8,
      delay: 0.45,
      stagger: { amount: 0.18, from: "center" },
      ease: "expo.out"
    });
    gsap.to(imgs, { opacity: 1, duration: 0.4, delay: 0.8 });

    if (menuBg) {
      menuBg.classList.add('active');
    }

    setActiveTab(0, true);
  }

  // Закрытие NAV
  function closeNav() {
    navOpen = false;

    gsap.to(aboutContainer, { opacity: 0, duration: 0.3, ease: "power1.out" });
    gsap.to(btnTexts, { yPercent: 0, duration: 0.6, ease: "expo.out" });
    gsap.to(paths, {
      yPercent: 0,
      from: { yPercent: 100 },
      duration: 1,
      delay: 0.5,
      stagger: { amount: 0.15, from: "center" },
      ease: "expo.out"
    });
    gsap.to(pathPosters, {
      yPercent: 130,
      from: { yPercent: 0 },
      duration: 0.8,
      stagger: { amount: 0.12, from: "center" },
      ease: "expo.in"
    });
    gsap.to(nav, { height: "2.5rem", duration: 0.5, ease: "expo.out" });
    gsap.to(items, { opacity: 0, duration: 0.3, ease: "power1.out" });
    gsap.to(aboutMainPWrap, { opacity: 1, duration: 0.3 });

    if (menuBg) {
      menuBg.classList.remove('active');
    }
  }

  // Переключение NAV
  function toggleNav() {
    if (navOpen) {
      closeNav();
    } else {
      openNav();
    }
  }

  // Клик вне NAV для закрытия
  function handleClickOutside(e) {
    if (navOpen && !nav.contains(e.target)) {
      closeNav();
    }
  }

  // Клик по триггеру
  function handleTriggerClick(e) {
    e.stopPropagation();
    toggleNav();
  }

  // Табы
  function setActiveTab(idx, force = false) {
    aboutPlanes.forEach((plane, i) => {
      plane.classList.toggle('is-active', i === idx);
    });

    if (tabDivider && aboutTabs[idx]) {
      const state = Flip.getState(tabDivider);
      aboutTabs[idx].appendChild(tabDivider);
      Flip.from(state, {
        duration: 0.6,
        ease: "expo.out"
      });
    }

    if (idx === 0 || force) {
      gsap.to(aboutMainPWrap, { opacity: 1, duration: 0.3 });
    } else {
      gsap.to(aboutMainPWrap, { opacity: 0, duration: 0.3 });
    }
  }

  // Добавляем обработчики событий
  document.addEventListener('click', handleClickOutside);
  trigger.addEventListener('click', handleTriggerClick);

  aboutTabs.forEach((tab, idx) => {
    tab.addEventListener('click', function () {
      setActiveTab(idx);
    });
  });

  // Сохраняем функцию очистки
  trigger._navCleanup = function () {
    document.removeEventListener('click', handleClickOutside);
    trigger.removeEventListener('click', handleTriggerClick);
    aboutTabs.forEach((tab, idx) => {
      tab.removeEventListener('click', function () {
        setActiveTab(idx);
      });
    });
  };

}

function initDropdown(scope) {
  if (window.innerWidth < 1024) return;
  
  const root = scope || document;
  const dropdownBtn = root.querySelector('.dropdown_btn');
  const dropdownPopUp = root.querySelector('.dropdown_pop-up');
  const dropdownIcon = root.querySelector('.dropdown_icon');
  const popUpItems = root.querySelectorAll('.pop-up_item');
  const visualImgs = root.querySelectorAll('.dropdown_visual_img');

  if (!dropdownBtn || !dropdownPopUp) return;

  if (dropdownBtn._dropdownCleanup) dropdownBtn._dropdownCleanup();

  // Функция для добавления opened
  function openDropdown() {
    dropdownPopUp.classList.add('opened');
    dropdownIcon.classList.add('opened');
  }

  // Функция для удаления opened
  function closeDropdown() {
    dropdownPopUp.classList.remove('opened');
    dropdownIcon.classList.remove('opened');
  }

  // Наведение на кнопку или попап — открываем
  dropdownBtn.addEventListener('mouseenter', openDropdown);
  dropdownPopUp.addEventListener('mouseenter', openDropdown);

  // Покидание кнопки или попапа — закрываем
  dropdownBtn.addEventListener('mouseleave', closeDropdown);
  dropdownPopUp.addEventListener('mouseleave', closeDropdown);

  // Наведение на item внутри попапа
  popUpItems.forEach((item, idx) => {
    item.addEventListener('mouseenter', () => {
      visualImgs.forEach(img => {
        gsap.to(img, { opacity: 0, duration: 0 });
      });
      gsap.to(visualImgs[idx], { opacity: 1, duration: 0 });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(visualImgs[idx], { opacity: 0, duration: 0.3 });
    });
  });

  // Сохраняем функцию очистки
  dropdownBtn._dropdownCleanup = function () {
    dropdownBtn.removeEventListener('mouseenter', openDropdown);
    dropdownPopUp.removeEventListener('mouseenter', openDropdown);
    dropdownBtn.removeEventListener('mouseleave', closeDropdown);
    dropdownPopUp.removeEventListener('mouseleave', closeDropdown);

    popUpItems.forEach((item, idx) => {
      item.removeEventListener('mouseenter', () => {});
      item.removeEventListener('mouseleave', () => {});
    });
  };
}

function initVisualSlider(scope) {
  if (window.innerWidth < 1024) return;
  
  const root = scope || document;
  const $body = $("body", root);
  const $lightbox = $(".visual_slider", root);
  const $lightboxBg = $lightbox.find(".visual_slider_bg");
  const $sliderItems = $lightbox.find(".visual_img-wrap.is-slider");
  const $listItems = $(".visual_imgs_wrapper .visual_img-wrap", root);
  const $closeBtn = $lightbox.find('[slider-cntrl="close"]');
  const $prevBtn = $lightbox.find('[slider-cntrl="prev"]');
  const $nextBtn = $lightbox.find('[slider-cntrl="next"]');

  let currentIndex = -1;
  let $srcWrap = null;
  let $srcImg = null;
  let $lightboxItem = null;
  let $lightboxImg = null;
  let isAnimating = false;

  function getDiffRect(fromEl, toEl) {
    const f = fromEl.getBoundingClientRect();
    const t = toEl.getBoundingClientRect();
    return {
      x: f.left - t.left,
      y: f.top - t.top,
      w: f.width,
      h: f.height
    };
  }

  // Обработчик клавиатуры
  function handleKeyboard(e) {
    if (!$lightbox.is(":visible") || isAnimating) return;
    
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        closeLightbox();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        showSlide(currentIndex - 1, "prev");
        break;
      case 'ArrowRight':
        e.preventDefault();
        showSlide(currentIndex + 1, "next");
        break;
    }
  }

  function openLightbox(index, $clickedWrap) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = index;
    $srcWrap = $clickedWrap;
    $srcImg = $srcWrap.find(".visual_img");
    $lightboxItem = $sliderItems.eq(currentIndex);
    $lightboxImg = $lightboxItem.find(".visual_img");

    $sliderItems.removeClass("active").css({ opacity: 0, zIndex: 1 });
    $lightboxItem.addClass("active").css({ opacity: 1, zIndex: 2 });

    $lightbox.css("display", "block");
    $body.addClass("no-scroll lightbox-open");

    // Добавляем обработчик клавиатуры при открытии
    $(document).on("keydown.lightbox", handleKeyboard);

    gsap.fromTo($lightboxBg, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "expo.out" });

    [$closeBtn, $prevBtn, $nextBtn].forEach($btn => {
      gsap.fromTo($btn, { scale: 0 }, { scale: 1, duration: 0.6, ease: "expo.out" });
    });

    const diff = getDiffRect($srcWrap[0], $lightboxItem[0]);
    const popupW = $lightboxItem.outerWidth();
    const popupH = $lightboxItem.outerHeight();

    $srcImg.css("opacity", 0);
    gsap.set($lightboxItem, { willChange: "transform,width,height,clipPath" });

    gsap.fromTo(
      $lightboxItem, { x: diff.x, y: diff.y, width: diff.w, height: diff.h },
      {
        x: 0,
        y: 0,
        width: popupW,
        height: popupH,
        duration: 1.2,
        ease: "expo.out",
        onComplete: () => {
          gsap.set($lightboxItem, { clearProps: "transform,width,height,willChange" });
          isAnimating = false;
        }
      }
    );

    const $title = $lightboxItem.find('[slide-info="title"]');
    gsap.fromTo($title, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "expo.in" });
  }

  function closeLightbox() {
    if (isAnimating) return;
    isAnimating = true;

    // Удаляем обработчик клавиатуры при закрытии
    $(document).off("keydown.lightbox");

    if ($srcImg) $srcImg.css("opacity", 1);

    gsap.to($lightbox, {
      opacity: 0,
      duration: 0.3,
      ease: "expo.out",
      onComplete: () => {
        $lightbox.css("display", "none").css("opacity", 1);
        $sliderItems.removeClass("active").css({ opacity: 0, zIndex: 1 });
        $body.removeClass("no-scroll lightbox-open");
        gsap.set($lightboxBg, { opacity: 0 });
        gsap.set([$closeBtn, $prevBtn, $nextBtn], { scale: 0 });
        isAnimating = false;
        currentIndex = -1;
        $srcWrap = null;
        $srcImg = null;
        $lightboxItem = null;
        $lightboxImg = null;
      }
    });
  }

  function showSlide(newIndex, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const total = $sliderItems.length;
    if (newIndex < 0) newIndex = total - 1;
    if (newIndex >= total) newIndex = 0;

    const $currentItem = $sliderItems.eq(currentIndex);
    const $nextItem = $sliderItems.eq(newIndex);
    const $nextImg = $nextItem.find(".visual_img");

    $sliderItems.css({ zIndex: 1 });
    $nextItem.css({ zIndex: 3, opacity: 1 }).addClass("active");
    $currentItem.css({ zIndex: 2 });

    let clipFrom, clipTo, moveFrom;
    if (direction === "next") {
      clipFrom = "inset(0% 0% 0% 100%)";
      clipTo = "inset(0% 0% 0% 0%)";
      moveFrom = 500;
    } else {
      clipFrom = "inset(0% 100% 0% 0%)";
      clipTo = "inset(0% 0% 0% 0%)";
      moveFrom = -500;
    }

    gsap.set($nextItem, { clipPath: clipFrom });
    gsap.set($nextImg, { x: moveFrom });

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        $sliderItems.removeClass("active").css({ opacity: 0, zIndex: 1 });
        $nextItem.addClass("active").css({ opacity: 1, zIndex: 2 });
        gsap.set($nextItem, { clearProps: "clipPath" });
        gsap.set($nextImg, { clearProps: "x" });
        isAnimating = false;
        currentIndex = newIndex;
      }
    });

    tl.to($nextItem, { clipPath: clipTo, duration: 1.2 }, 0);
    tl.to($nextImg, { x: 0, duration: 1 }, 0);
  }

  $listItems.on("click", function () {
    const index = $(this).index();
    openLightbox(index, $(this));
  });

  $closeBtn.on("click", function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  $nextBtn.on("click", function (e) {
    e.stopPropagation();
    showSlide(currentIndex + 1, "next");
  });

  $prevBtn.on("click", function (e) {
    e.stopPropagation();
    showSlide(currentIndex - 1, "prev");
  });
}

function initArchiveThumb(scope) {
  if (window.innerWidth < 1024) return;
  
  const root = scope || document;
  const archiveThumbs = root.querySelectorAll('.archive_thumb');
  const archiveTextEls = root.querySelectorAll('[data-hover="archive"]');

  if (!archiveThumbs.length || !archiveTextEls.length) return;

  // Сохраняем исходные значения текста для всех элементов
  const originalTexts = Array.from(archiveTextEls).map(el => el.textContent.trim());

  archiveThumbs.forEach((thumb) => {
    thumb.addEventListener('mouseenter', () => {
      // Меняем текст на "archive" для всех элементов
      archiveTextEls.forEach((el) => {
        el.textContent = 'Аrchive';
        
        // Анимация появления (похожая на scroll.js строки 486-489)
        gsap.fromTo(
          el,
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.7, ease: 'expo.out' }
        );
      });
    });

    thumb.addEventListener('mouseleave', () => {
      // Анимация исчезновения (похожая на scroll.js строки 498-499)
      archiveTextEls.forEach((el, index) => {
        gsap.to(el, {
          opacity: 0,
          yPercent: 110,
          duration: 0.3,
          ease: 'expo.in',
          onComplete: () => {
            // Возвращаем исходное значение текста после завершения анимации
            el.textContent = originalTexts[index];
            
            // Анимируем появление исходного текста
            gsap.fromTo(
              el,
              { opacity: 0, yPercent: 110 },
              { opacity: 1, yPercent: 0, duration: 0.5, ease: 'expo.out' }
            );
          }
        });
      });
    });
  });

}
