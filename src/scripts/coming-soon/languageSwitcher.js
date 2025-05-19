document.addEventListener('DOMContentLoaded', () => {
  // Simple language switcher that cycles through languages
  const languageSwitcher = document.getElementById('language-switcher')
  const currentLocaleDisplay = document.getElementById('current-locale')
  
  if (!languageSwitcher || !currentLocaleDisplay) {
    console.error('Language switcher elements not found')
    return
  }
  
  // Define the language cycle order
  const languageCycle = ['ca', 'es', 'en']
  
  // Get current locale from URL or default to Catalan
  function getCurrentLocale() {
    const path = window.location.pathname
    
    // Check for language prefix in URL
    if (path.startsWith('/en/')) return 'en'
    if (path.startsWith('/es/')) return 'es'
    
    // No prefix means we're in the default locale (Catalan)
    return 'ca'
  }
  
  // Get next locale in the cycle
  function getNextLocale(currentLocale) {
    const currentIndex = languageCycle.indexOf(currentLocale)
    if (currentIndex === -1) return 'ca' // Fallback to default
    
    // Get next locale in cycle
    const nextIndex = (currentIndex + 1) % languageCycle.length
    return languageCycle[nextIndex]
  }
  
  // Navigate to the new locale
  function navigateToLocale(newLocale) {
    const currentPath = window.location.pathname
    let newPath
    
    // Handle default locale (Catalan - no prefix)
    if (newLocale === 'ca') {
      // Remove language prefix if present
      if (currentPath.startsWith('/en/') || currentPath.startsWith('/es/')) {
        newPath = currentPath.replace(/^\/(en|es)/, '')
        if (!newPath) newPath = '/'
      } else {
        newPath = currentPath
      }
    } 
    // Handle non-default locales (add prefix)
    else {
      if (currentPath === '/') {
        newPath = `/${newLocale}/`
      } else if (currentPath.startsWith('/en/') || currentPath.startsWith('/es/')) {
        // Replace existing prefix
        newPath = currentPath.replace(/^\/(en|es)/, `/${newLocale}`)
      } else {
        // Add prefix to path
        newPath = `/${newLocale}${currentPath}`
      }
    }
    
    // Navigate to new URL
    window.location.href = newPath
  }
  
  // Set up click handler
  languageSwitcher.addEventListener('click', () => {
    const currentLocale = getCurrentLocale()
    const nextLocale = getNextLocale(currentLocale)
    
    // Update display immediately for better UX
    currentLocaleDisplay.textContent = nextLocale.toUpperCase()
    
    // Navigate to the new locale
    navigateToLocale(nextLocale)
  })
  
  // Initialize with current locale
  const currentLocale = getCurrentLocale()
  currentLocaleDisplay.textContent = currentLocale.toUpperCase()
})
