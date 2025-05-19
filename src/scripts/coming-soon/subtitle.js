document.addEventListener('DOMContentLoaded', () => {
  const dynamicWordsElement = document.getElementById('splitflap-dynamic-words')
  if (!dynamicWordsElement) return

  const defaultEnglishWords = [
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

  let words = defaultEnglishWords // Default to English words

  try {
    const wordsDataElement = document.getElementById('subtitle-dynamic-words-data')
    if (wordsDataElement && wordsDataElement.textContent) {
      const parsedWords = JSON.parse(wordsDataElement.textContent)
      if (Array.isArray(parsedWords) && parsedWords.length > 0 && parsedWords.every(word => typeof word === 'string')) {
        words = parsedWords
      } else {
        console.warn('[subtitle.js] Parsed dynamic words data is not a valid string array. Falling back to defaults.')
      }
    } else {
      console.warn('[subtitle.js] Dynamic words data element not found or empty. Falling back to defaults.')
    }
  } catch (error) {
    console.error('[subtitle.js] Error parsing dynamic words data. Falling back to defaults:', error)
  }

  // --- Config ---
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
