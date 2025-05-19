/**
 * Dark Mode Toggle
 * 
 * Handles toggling between light and dark mode, respecting user preferences
 * and system settings.
 */

type ColorScheme = 'light' | 'dark'

interface ThemeChangedEventDetail {
  isDark: boolean
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle')

  if (toggle) {
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const colorPreference = localStorage.getItem('colorScheme')

    let currentScheme: ColorScheme = (colorPreference as ColorScheme) || (prefersDark ? 'dark' : 'light')

    // Set the initial color-scheme
    applyColorScheme(currentScheme)
    
    // Apply initial state based on current scheme
    if (currentScheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    toggle.setAttribute('aria-pressed', String(currentScheme === 'dark'))

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
      toggle.setAttribute('aria-pressed', String(currentScheme === 'dark'))

      // Save the preference
      localStorage.setItem('colorScheme', currentScheme)

      // Dispatch a custom event that other scripts can listen for
      document.dispatchEvent(
        new CustomEvent<ThemeChangedEventDetail>('themeChanged', {
          detail: { isDark: currentScheme === 'dark' },
        })
      )
    })

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if the user hasn't set a preference
      if (!localStorage.getItem('colorScheme')) {
        const newScheme: ColorScheme = e.matches ? 'dark' : 'light'
        currentScheme = newScheme
        applyColorScheme(newScheme)
        
        // Update the theme class
        if (newScheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        toggle.setAttribute('aria-pressed', String(newScheme === 'dark'))
      }
    })
  } else {
    console.warn('Dark mode toggle button not found.')
  }
})

/**
 * Apply the color scheme to the document
 * @param {ColorScheme} scheme - Either 'dark' or 'light'
 */
function applyColorScheme(scheme: ColorScheme): void {
  // This sets the color-scheme CSS property at the document level
  document.documentElement.style.colorScheme = scheme
}
