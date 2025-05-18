document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-mode-toggle');

  const moonIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gray" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 0111.21 3 7 7 0 1012 21a9 9 0 009-8.21z"/>
    </svg>`;
  
  const sunIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="gray" viewBox="0 0 24 24">
      <path d="M12 4.5a1 1 0 010-2 1 1 0 010 2zm0 17a1 1 0 010-2 1 1 0 010 2zM4.5 13a1 1 0 010-2 1 1 0 010 2zm15 0a1 1 0 010-2 1 1 0 010 2zM7.05 6.05a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zm10.61 10.6a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zM7.05 17.95a1 1 0 11-1.41 1.41 1 1 0 011.41-1.41zm10.61-10.6a1 1 0 111.41-1.41 1 1 0 01-1.41 1.41zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>`;

  if (toggle) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const colorPreference = localStorage.getItem('colorScheme');

    let currentScheme = colorPreference || (prefersDark ? 'dark' : 'light');
    
    // Set the initial color-scheme
    applyColorScheme(currentScheme);
    toggle.innerHTML = currentScheme === 'dark' ? sunIcon : moonIcon;

    // Set up toggle click handler
    toggle.addEventListener('click', () => {
      // Toggle between 'light' and 'dark'
      currentScheme = currentScheme === 'dark' ? 'light' : 'dark';
      
      // Apply the new scheme
      applyColorScheme(currentScheme);
      
      // Update the icon and accessibility state
      toggle.innerHTML = currentScheme === 'dark' ? sunIcon : moonIcon;
      toggle.setAttribute('aria-pressed', currentScheme === 'dark');
      
      // Save the preference
      localStorage.setItem('colorScheme', currentScheme);
      
      // Dispatch a custom event that other scripts can listen for
      document.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { isDark: currentScheme === 'dark' }
      }));
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if the user hasn't set a preference
      if (!localStorage.getItem('colorScheme')) {
        const newScheme = e.matches ? 'dark' : 'light';
        currentScheme = newScheme;
        applyColorScheme(newScheme);
        toggle.innerHTML = newScheme === 'dark' ? sunIcon : moonIcon;
      }
    });
  } else {
    console.warn("Dark mode toggle button not found.");
  }
});

/**
 * Apply the color scheme to the document
 * @param {string} scheme - Either 'dark' or 'light'
 */
function applyColorScheme(scheme) {
  // This sets the color-scheme CSS property at the document level
  document.documentElement.style.colorScheme = scheme;
  
}