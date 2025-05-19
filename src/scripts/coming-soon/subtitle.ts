/**
 * Dynamic Subtitle Animation
 *
 * Creates a split-flap display effect for cycling through words
 * in the subtitle section of the coming soon page.
 */

document.addEventListener('DOMContentLoaded', () => {
  const dynamicWordsElement: HTMLElement | null = document.getElementById('splitflap-dynamic-words')
  if (!dynamicWordsElement) return

  const defaultEnglishWords: string[] = [
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

  let words: string[] = defaultEnglishWords // Default to English words

  try {
    const wordsDataElement: HTMLElement | null = document.getElementById(
      'subtitle-dynamic-words-data'
    )
    if (wordsDataElement && wordsDataElement.textContent) {
      const parsedWords = JSON.parse(wordsDataElement.textContent)
      if (
        Array.isArray(parsedWords) &&
        parsedWords.length > 0 &&
        parsedWords.every((word: unknown) => typeof word === 'string')
      ) {
        words = parsedWords
      } else {
        console.warn(
          '[subtitle.js] Parsed dynamic words data is not a valid string array. Falling back to defaults.'
        )
      }
    } else {
      console.warn(
        '[subtitle.js] Dynamic words data element not found or empty. Falling back to defaults.'
      )
    }
  } catch (error) {
    console.error(
      '[subtitle.js] Error parsing dynamic words data. Falling back to defaults:',
      error
    )
  }

  // --- Config ---
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789· '
  const flapSpeed = 50
  const flapDurationPerLetter = 600
  const letterStagger = 80
  const wordPause = 1500
  // --- End Config ---

  let currentWordIndex = 0

  /**
   * Animate a single letter with a split-flap effect
   * @param {HTMLElement} span - The span element to animate
   * @param {string} targetChar - The target character to display
   */
  function animateLetter(span: HTMLElement, targetChar: string): void {
    const initialChar: string = charset[Math.floor(Math.random() * charset.length)]
    span.textContent = initialChar

    const startTime = Date.now()
    const intervalId: number = window.setInterval(() => {
      if (Date.now() - startTime >= flapDurationPerLetter) {
        clearInterval(intervalId)
        span.textContent = targetChar
      } else {
        span.textContent = charset[Math.floor(Math.random() * charset.length)]
      }
    }, flapSpeed)
  }

  /**
   * Display a word with the split-flap animation effect
   * @param {string} word - The word to display
   * @returns {number} The total animation time
   */
  function displayWord(word: string): number {
    if (!dynamicWordsElement) return 0
    dynamicWordsElement.innerHTML = ''
    const letters: string[] = word.split('')
    let maxDelay = 0

    letters.forEach((char, index) => {
      const span: HTMLSpanElement = document.createElement('span')
      span.className = 'splitflap-letter'
      span.textContent = ' '
      dynamicWordsElement.appendChild(span)

      const startDelay: number = index * letterStagger
      maxDelay = Math.max(maxDelay, startDelay)

      setTimeout(() => {
        animateLetter(span, char)
      }, startDelay)
    })

    return maxDelay + flapDurationPerLetter
  }

  /**
   * Cycle through the words with animation
   */
  function cycleWords(): void {
    const word: string = words[currentWordIndex]
    const wordAnimationTime: number = displayWord(word)

    currentWordIndex = (currentWordIndex + 1) % words.length

    setTimeout(cycleWords, wordAnimationTime + wordPause)
  }

  cycleWords()
})
