/**
 * Button Tilt Effect
 * 
 * Adds a subtle 3D tilt effect to buttons with the 'tilt-effect' class
 * based on the mouse position relative to the button.
 * 
 * Respects user preferences for reduced motion.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Select all buttons with the tilt-effect class
  const tiltButtons = document.querySelectorAll('.tilt-effect')
  
  // For each button, add mouse event listeners
  tiltButtons.forEach(button => {
    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', resetTilt)
    button.addEventListener('mouseenter', setInitialState)
  })
  
  /**
   * Handles mouse movement over a button to create a tilt effect
   * @param {MouseEvent} e - The mouse event
   */
  function handleMouseMove(e) {
    // Skip effect if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    
    const rect = this.getBoundingClientRect()
    const x = e.clientX - rect.left // x position within the element
    const y = e.clientY - rect.top // y position within the element
    
    // Calculate the tilt based on mouse position relative to center
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calculate rotation values (limited to small angles for subtle effect)
    const rotateX = ((y - centerY) / centerY) * -5 // Max 5 degrees rotation
    const rotateY = ((x - centerX) / centerX) * 5 // Max 5 degrees rotation
    
    // Apply the transformation
    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }
  
  /**
   * Resets the button tilt to its default state
   */
  function resetTilt() {
    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'
  }
  
  /**
   * Sets up the initial state for the button tilt effect
   */
  function setInitialState() {
    this.style.transition = 'transform var(--transition-fast)'
    resetTilt.call(this)
  }
})
