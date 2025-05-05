document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('main-title');
    const contentWrapper = document.getElementById('main-content-wrapper');
  
    if (!titleElement || !contentWrapper) return;
  
    // --- Configuration ---
    const fontsToCycle = [
      "'Courier New', Courier, monospace",
      "'Times New Roman', Times, serif",
      "'Brush Script MT', cursive",
      "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
      "'Lucida Console', Monaco, monospace",
      "Georgia, serif",
      "'Comic Sans MS', 'Comic Sans', cursive",
      "Arial, Helvetica, sans-serif"
    ];
    const finalFontFamily = getComputedStyle(titleElement).fontFamily;
    const finalLetterSpacing = '-0.07em';
  
    const cycleSpeed = 100;
    const cycleDuration = 1200;
    const startDelay = 500;
    const contentFadeInDelay = 150; // Delay before starting wrapper transitions
    // --- NEW: Duration of the main-content-wrapper max-height transition ---
    const wrapperTransitionDuration = 700; // 0.7s in CSS -> 700ms
    // --- End Configuration ---
  
    let animationInterval = null;
    let startTime = null;
  
    function setFinalTitleStyleAndShowContent() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    titleElement.style.fontFamily   = finalFontFamily;
    titleElement.style.letterSpacing = finalLetterSpacing;
  
    // prepare the transitionend handler
    const onEnd = e => {
      if (e.propertyName === 'max-height') {
        console.log('Wrapper expanded — dispatching resize');
  
        contentWrapper.removeEventListener('transitionend', onEnd);
      }
    };
  
    // 1) listen first…
    contentWrapper.addEventListener('transitionend', onEnd);
    // 2) then trigger the transition
    contentWrapper.classList.add('visible');
  }
  
    function changeFont() {
      const randomIndex = Math.floor(Math.random() * fontsToCycle.length);
      titleElement.style.fontFamily = fontsToCycle[randomIndex];
      titleElement.style.letterSpacing = 'normal';
  
      if (Date.now() - startTime >= cycleDuration) {
        setFinalTitleStyleAndShowContent();
      }
    }
  
    setTimeout(() => {
      startTime = Date.now();
      titleElement.style.letterSpacing = 'normal';
      animationInterval = setInterval(changeFont, cycleSpeed);
  
      // Failsafe timeout - ensure content appears even if interval glitches
      // Make sure this timeout is long enough for everything
      setTimeout(() => {
          setFinalTitleStyleAndShowContent();
      }, cycleDuration + startDelay + contentFadeInDelay + wrapperTransitionDuration + 100); // Adjusted failsafe
  
    }, startDelay);
  
  });