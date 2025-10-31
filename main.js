document.addEventListener('DOMContentLoaded', function() {
  if (typeof initBarba === 'function') {
    initBarba();
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateTimezoneTime,
    initBarba,
    initFirstLoadAnimation,
    initializePage
  };
}
