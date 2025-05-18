// /src/scripts/comingSoon.js

document.addEventListener('DOMContentLoaded', () => {
  // Preloader Logic (if using the Preloader component)
  // If you uncommented the Preloader in Astro, keep this:
  const preloader = document.querySelector('.preloader')
  if (preloader) {
    // Check if preloader exists
    setTimeout(() => {
      preloader.classList.add('hidden')
    }, 1500)
  } else {
    console.warn("Preloader element not found. Ensure it has id='preloader'")
  }

  // Dark mode toggle
  const toggle = document.getElementById('dark-mode-toggle')
  if (toggle) {
    // Set initial icon based on preference or default
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && prefersDark)
    ) {
      document.body.classList.add('dark')
      toggle.textContent = '☀️'
    } else {
      document.body.classList.remove('dark')
      toggle.textContent = '🌙'
    }

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark')
      const isDark = document.body.classList.contains('dark')
      toggle.textContent = isDark ? '☀️' : '🌙'
      // Save preference
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    })
  } else {
    console.warn('Dark mode toggle button not found.')
  }

  // Optional: Notify form submission logic (example)
  const notifyForm = document.getElementById('notify-form')
  if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const emailInput = notifyForm.querySelector('input[type="email"]')
      const email = emailInput.value
      if (email) {
        console.log(`Form submitted for email: ${email}`)
        // Add your actual form submission logic here (e.g., send to server)
        alert('Thank you! We will notify you.')
        emailInput.value = '' // Clear input
      } else {
        alert('Please enter a valid email address.')
      }
    })
  }
})
