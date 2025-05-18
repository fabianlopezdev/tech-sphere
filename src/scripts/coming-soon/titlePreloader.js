document.addEventListener('DOMContentLoaded', () => {
  const titleElement = document.getElementById('main-title')
  const contentWrappers = document.querySelectorAll('.hide-at-start')

  // bail out if no title or no wrappers found
  if (!titleElement || contentWrappers.length === 0) return

  // --- Configuration ---
  const fontsToCycle = [
    "'Courier New', Courier, monospace",
    "'Times New Roman', Times, serif",
    "'Brush Script MT', cursive",
    "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    "'Lucida Console', Monaco, monospace",
    'Georgia, serif',
    "'Comic Sans MS', 'Comic Sans', cursive",
    'Arial, Helvetica, sans-serif',
  ]

  const finalFontFamily = getComputedStyle(titleElement).fontFamily
  const finalLetterSpacing = '-0.07em'
  const cycleSpeed = 100
  const cycleDuration = 1200
  const startDelay = 500
  const contentFadeInDelay = 150
  const wrapperTransitionDuration = 700
  // --- End Config ---

  let animationInterval = null
  let startTime = null

  function setFinalTitleStyleAndShowContent() {
    if (animationInterval) {
      clearInterval(animationInterval)
      animationInterval = null
    }
    titleElement.style.fontFamily = finalFontFamily
    titleElement.style.letterSpacing = finalLetterSpacing

    // for each wrapper, listen for its transition and then show it
    contentWrappers.forEach((wrapper) => {
      const onEnd = (e) => {
        if (e.propertyName === 'max-height') {
          wrapper.removeEventListener('transitionend', onEnd)
          // you could dispatch a resize here if needed:
          // window.dispatchEvent(new Event('resize'));
        }
      }
      wrapper.addEventListener('transitionend', onEnd)
      wrapper.classList.add('visible')
    })
  }

  function changeFont() {
    const randomIndex = Math.floor(Math.random() * fontsToCycle.length)
    titleElement.style.fontFamily = fontsToCycle[randomIndex]
    titleElement.style.letterSpacing = 'normal'

    if (Date.now() - startTime >= cycleDuration) {
      setFinalTitleStyleAndShowContent()
    }
  }

  setTimeout(() => {
    startTime = Date.now()
    titleElement.style.letterSpacing = 'normal'
    animationInterval = setInterval(changeFont, cycleSpeed)

    // Failsafe to show content no matter what
    setTimeout(
      () => {
        setFinalTitleStyleAndShowContent()
      },
      cycleDuration + startDelay + contentFadeInDelay + wrapperTransitionDuration + 100
    )
  }, startDelay)
})
