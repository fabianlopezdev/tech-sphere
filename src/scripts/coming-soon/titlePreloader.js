document.addEventListener('DOMContentLoaded', () => {
  const contentWrappers = document.querySelectorAll('.hide-at-start')
  const titleContainer = document.querySelector('.title-container')
  
  // Bail out if no wrappers found
  if (contentWrappers.length === 0) return

  // Set initial state for the title
  if (titleContainer) {
    titleContainer.style.opacity = '1'
  }

  // Show content after the animation completes
  const showContent = () => {
    contentWrappers.forEach((wrapper) => {
      wrapper.classList.add('visible')
    })
  }

  // Start the animation sequence
  const startAnimation = () => {
    // The animation is handled by CSS, we just need to trigger it
    // by adding the 'animate' class to the container
    if (titleContainer) {
      titleContainer.classList.add('animate')
    }
    
    // Show content after the title animation completes
    // The total animation time is approximately 1.2s (0.6s per line + delay)
    setTimeout(showContent, 1400)
  }


  // Start the animation after a short delay
  setTimeout(startAnimation, 100)
})
