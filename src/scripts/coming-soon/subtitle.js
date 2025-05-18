document.addEventListener('DOMContentLoaded', () => {
  const dynamicWordsElement = document.getElementById('splitflap-dynamic-words')
  if (!dynamicWordsElement) return

  // --- Config ---
  const words = [
    'DESIGN',
    'DEVELOPMENT',
    'GROWTH',
    'MARKETING',
    'APPS',
    'LEADS',
    'WEBSITES',
    'SOFTWARE',
    'AI',
  ]
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789· '
  const flapSpeed = 50
  const flapDurationPerLetter = 600
  const letterStagger = 80
  const wordPause = 1500
  // --- End Config ---

  let currentWordIndex = 0

  function animateLetter(span, targetChar) {
    /* ... unchanged ... */
    const initialChar = charset[Math.floor(Math.random() * charset.length)]
    span.textContent = initialChar

    let startTime = Date.now()
    const intervalId = setInterval(() => {
      if (Date.now() - startTime >= flapDurationPerLetter) {
        clearInterval(intervalId)
        span.textContent = targetChar
      } else {
        span.textContent = charset[Math.floor(Math.random() * charset.length)]
      }
    }, flapSpeed)
  }

  function displayWord(word) {
    /* ... unchanged ... */
    dynamicWordsElement.innerHTML = ''
    const letters = word.split('')
    let maxDelay = 0

    letters.forEach((char, index) => {
      const span = document.createElement('span')
      span.className = 'splitflap-letter'
      span.textContent = ' '
      dynamicWordsElement.appendChild(span)

      const startDelay = index * letterStagger
      maxDelay = Math.max(maxDelay, startDelay)

      setTimeout(() => {
        animateLetter(span, char)
      }, startDelay)
    })

    return maxDelay + flapDurationPerLetter
  }

  function cycleWords() {
    /* ... unchanged ... */
    const word = words[currentWordIndex]
    const wordAnimationTime = displayWord(word)

    currentWordIndex = (currentWordIndex + 1) % words.length

    setTimeout(cycleWords, wordAnimationTime + wordPause)
  }

  cycleWords()
})
