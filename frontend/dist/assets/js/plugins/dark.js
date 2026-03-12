(() => {
    'use strict'
  
    const setStoredTheme = theme => localStorage.setItem('theme', theme)
  
    // Принудительно устанавливаем темную тему
    const FORCE_DARK_THEME = 'dark'
  
    const setTheme = theme => {
      // Всегда устанавливаем темную тему
      document.documentElement.setAttribute('data-bs-theme', FORCE_DARK_THEME)
      setStoredTheme(FORCE_DARK_THEME)
    }
  
    // Устанавливаем темную тему сразу при загрузке скрипта
    setTheme(FORCE_DARK_THEME)
  
    // Устанавливаем темную тему при загрузке DOM
    window.addEventListener('DOMContentLoaded', () => {
      setTheme(FORCE_DARK_THEME)
      
      // Скрываем все кнопки переключения темы
      document.querySelectorAll('.change-mode, .btn-mode, [data-bs-theme-value]').forEach(btn => {
        if (btn.closest('.top-button-mode')) {
          btn.closest('.top-button-mode').style.display = 'none'
        } else {
          btn.style.display = 'none'
        }
      })
    })
  
    // Отслеживаем изменения системной темы, но все равно устанавливаем темную
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      setTheme(FORCE_DARK_THEME)
    })
  })()