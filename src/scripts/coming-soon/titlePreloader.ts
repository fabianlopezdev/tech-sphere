/**
 * Title Animation
 *
 * Handles the animation sequence for the title on the coming soon page.
 */

document.addEventListener('DOMContentLoaded', () => {
  const titleContainer: HTMLElement | null = document.querySelector('.title-container')

  // Bail out if title container not found
  if (!titleContainer) return

  // Set initial state for the title
  titleContainer.style.opacity = '1'

  /**
   * Start the animation sequence
   */
  const startAnimation = (): void => {
    // The animation is handled by CSS, we just need to trigger it
    // by adding the 'animate' class to the container
    titleContainer.classList.add('animate')
  }

  // Start the animation after a short delay
  setTimeout(startAnimation, 100)
})
