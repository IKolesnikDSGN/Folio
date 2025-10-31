// --- ОСНОВНОЙ ФАЙЛ ПРОЕКТА ---
// Импорт всех модулей

// Подключение модулей (в порядке зависимостей)
// 1. Утилиты и хелперы
// 2. Функции скролла
// 3. Анимации
// 4. Компоненты интерфейса
// 5. Конфигурация Barba
// 6. Анимация загрузки и инициализация

// Примечание: В реальном проекте эти модули должны быть подключены через:
// <script src="utils.js"></script>
// <script src="scroll.js"></script>
// <script src="animations.js"></script>
// <script src="components.js"></script>
// <script src="barba.js"></script>
// <script src="loader.js"></script>

// Или через модульную систему (ES6 modules, CommonJS, AMD)

// Для совместимости с текущей структурой проекта,
// все функции остаются доступными глобально

// Инициализация Barba после загрузки всех модулей
document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем Barba только если все модули загружены
  if (typeof initBarba === 'function') {
    initBarba();
      } else {
    console.warn('Barba module not loaded, falling back to default initialization');
  }
});

// Экспорт для модульных систем (если используется)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Экспортируем основные функции для внешнего использования
    updateTimezoneTime,
    initBarba,
    initFirstLoadAnimation,
    initializePage
  };
}
