document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle')

  if (toggle) {
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const colorPreference = localStorage.getItem('colorScheme')

    let currentScheme = colorPreference || (prefersDark ? 'dark' : 'light')

    // Set the initial color-scheme
    applyColorScheme(currentScheme)
    
    // Apply initial state based on current scheme
    if (currentScheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    toggle.setAttribute('aria-pressed', currentScheme === 'dark')

    // Set up toggle click handler
    toggle.addEventListener('click', () => {
      // Toggle between 'light' and 'dark'
      currentScheme = currentScheme === 'dark' ? 'light' : 'dark'

      // Apply the new scheme
      applyColorScheme(currentScheme)

      // Update the theme class on the document element
      if (currentScheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      // Update accessibility state
      toggle.setAttribute('aria-pressed', currentScheme === 'dark')

      // Save the preference
      localStorage.setItem('colorScheme', currentScheme)

      // Dispatch a custom event that other scripts can listen for
      document.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: { isDark: currentScheme === 'dark' },
        })
      )
    })

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if the user hasn't set a preference
      if (!localStorage.getItem('colorScheme')) {
        const newScheme = e.matches ? 'dark' : 'light'
        currentScheme = newScheme
        applyColorScheme(newScheme)
        
        // Update the theme class
        if (newScheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        toggle.setAttribute('aria-pressed', newScheme === 'dark')
      }
    })
  } else {
    console.warn('Dark mode toggle button not found.')
  }
})

/**
 * Apply the color scheme to the document
 * @param {string} scheme - Either 'dark' or 'light'
 */
function applyColorScheme(scheme) {
  // This sets the color-scheme CSS property at the document level
  document.documentElement.style.colorScheme = scheme
}
