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
    // Reversed direction: positive Y makes negative rotateX and vice versa
    const rotateX = ((y - centerY) / centerY) * 8 // Max 8 degrees rotation, reversed
    const rotateY = ((x - centerX) / centerX) * -8 // Max 8 degrees rotation, reversed
    
    // Calculate translation values (limited to small movements for subtle effect)
    // Move in the opposite direction of the mouse position
    const translateX = ((x - centerX) / centerX) * -5 // Max 5px movement
    const translateY = ((y - centerY) / centerY) * -5 // Max 5px movement
    
    // Apply the transformation with both rotation and translation
    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${translateX}px, ${translateY}px)`
  }
  
  /**
   * Resets the button tilt to its default state
   */
  function resetTilt() {
    this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translate(0, 0)'
  }
  
  /**
   * Sets up the initial state for the button tilt effect
   */
  function setInitialState() {
    // Use a faster transition for the effect to feel more responsive
    this.style.transition = 'transform 100ms ease-out'
    resetTilt.call(this)
  }
})
