import * as THREE from 'three' // Use bare specifier
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' // Still need path for examples

/**
 * Tech Sphere 3D Viewer
 * Renders a 3D model with color cycling effects
 */

// Check WebGL support first
const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sphere-canvas')

  // Early exit if container not found
  if (!container) {
    console.error("Container '#sphere-canvas' not found.")
    return
  }

  // Check WebGL support
  if (!isWebGLSupported()) {
    console.error('WebGL not supported in this browser.')
    container.innerHTML = `<div class="fallback-content">
      <p>Your browser doesn't support 3D content.</p>
      <p>Please try a modern browser like Chrome, Firefox, or Edge.</p>
    </div>`
    return
  }

  // --- Target Colors for the Sphere Model ---
  // Define both light and dark mode color sets with try-catch for color initialization
  let colorSchemes
  try {
    colorSchemes = {
      light: [
        new THREE.Color(1, 0, 200 / 255), // rgb(255, 0, 200) - brighter pink
        new THREE.Color(0, 230 / 255, 1), // rgb(0, 230, 255) - brighter cyan
        new THREE.Color(1, 220 / 255, 0), // rgb(255, 220, 0) - brighter yellow
      ],
      dark: [
        new THREE.Color(1, 100 / 255, 250 / 255), // rgb(255, 100, 250) - lighter pink
        new THREE.Color(140 / 255, 1, 1), // rgb(140, 255, 255) - lighter cyan
        new THREE.Color(1, 250 / 255, 150 / 255), // rgb(255, 250, 150) - lighter yellow/gold
      ],
    }
  } catch (error) {
    console.error('Error initializing color schemes:', error)
    // Fallback to basic colors if THREE.Color initialization fails
    colorSchemes = {
      light: [
        { r: 1, g: 0, b: 0.78 },
        { r: 0, g: 0.9, b: 1 },
        { r: 1, g: 0.86, b: 0 },
      ],
      dark: [
        { r: 1, g: 0.39, b: 0.98 },
        { r: 0.55, g: 1, b: 1 },
        { r: 1, g: 0.98, b: 0.59 },
      ],
    }
  }

  // Initialize with default colors (will be updated based on theme)
  let targetColors = [...colorSchemes.light]

  // Increased opacity for dark mode to make colors more visible
  const opacitySettings = {
    light: 0.3,
    dark: 0.5,
  }

  let targetOpacity = opacitySettings.light

  // Function to update colors based on theme
  function updateThemeColors() {
    const isDarkMode = document.body.classList.contains('dark')
    targetColors = isDarkMode ? colorSchemes.dark : colorSchemes.light
    targetOpacity = isDarkMode ? opacitySettings.dark : opacitySettings.light

    // Update materials if they've been created
    if (modelMaterials.length > 0) {
      modelMaterials.forEach((material) => {
        // Update opacity
        material.opacity = targetOpacity

        // Optionally, you can immediately update the color to the first color in the new scheme
        // material.color.copy(targetColors[0]);
      })
    }
  }
  // --- --------------------------------- ---

  // --- Lighting Palette ---
  const lightColors = {
    textLight: 0xffffff,
    accent: 0x666666, // Brighter ambient light to enhance colors
  }
  // --- ---------------- ---

  // Initialize Three.js scene with error handling
  let scene, camera, renderer

  try {
    scene = new THREE.Scene()
    // Background is transparent (set in renderer)

    // Adjust camera position for better view of the full-height sphere
    camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.z = 5

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Transparent background
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    // Use compatible encoding for wider browser support
    renderer.outputEncoding = THREE.sRGBEncoding || THREE.LinearEncoding // Fallback for older THREE versions
    container.appendChild(renderer.domElement)
  } catch (error) {
    console.error('Error initializing Three.js scene:', error)
    container.innerHTML = `<div class="fallback-content">
      <p>Unable to initialize 3D viewer.</p>
      <p>Please try refreshing the page.</p>
    </div>`
    return // Exit early if scene initialization fails
  }

  // --- Lights ---
  // Main directional light - increased intensity
  const directionalLight = new THREE.DirectionalLight(lightColors.textLight, 1.5)
  directionalLight.position.set(5, 5, 5).normalize()
  scene.add(directionalLight)

  // Add a second directional light from another angle for better coverage
  const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.0)
  secondaryLight.position.set(-5, 3, -5).normalize()
  scene.add(secondaryLight)

  // Brighter ambient light to ensure base illumination without washing out colors
  const ambientLight = new THREE.AmbientLight(lightColors.accent, 0.8)
  scene.add(ambientLight)
  // --- -------- ---

  const loader = new GLTFLoader()
  let model // Make model accessible in animate scope
  const modelMaterials = [] // To store references to materials needing color change

  // Path to model with a fallback option
  const modelPath = '/tech_sphere_logo.glb'
  const fallbackModelPath = '/models/fallback_sphere.glb'

  // Create a loading indicator
  const loadingIndicator = document.createElement('div')
  loadingIndicator.className = 'loading-indicator'
  loadingIndicator.textContent = 'Loading 3D model...'
  container.appendChild(loadingIndicator)

  // Start primary model loading with fallback system
  let modelLoadAttempted = false

  // Load the 3D model with proper error handling
  const loadModel = (path, isRetry = false) => {
    loader.load(
      path, // Model path
      (gltf) => {
        // Success callback
        // Remove loading indicator once model loads
        if (loadingIndicator && loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator)
        }

        try {
          model = gltf.scene // Assign to the outer scope variable

          // --- Process Model Materials ---
          model.traverse((object) => {
            if (object.isMesh) {
              // Ensure we handle single material or array of materials
              const materials = Array.isArray(object.material) ? object.material : [object.material]

              materials.forEach((material) => {
                // For most materials, we need to ensure they're set to transparent = true
                // Since we're applying partial opacity

                // Check if this is a MeshStandardMaterial or other material with 'color' property
                if (material.color) {
                  // Track original color for potential reset
                  if (!material._originalColor) {
                    material._originalColor = material.color.clone()
                  }

                  // Adjust transparency based on theme
                  if (material.transparent === undefined || material.transparent === false) {
                    material.transparent = true
                    material.opacity = targetOpacity // Initial opacity from theme
                  }

                  // Add to array for animation updates
                  modelMaterials.push(material)
                }

                // Ensure material updates are registered
                material.needsUpdate = true
              })
            }
          })
        } catch (modelError) {
          console.error('Error processing loaded model structure:', modelError)
          createFallbackSphere()
        }

        try {
          // Center and scale model to fit the full height of the container
          const box = new THREE.Box3().setFromObject(model)
          const size = box.getSize(new THREE.Vector3())

          // Calculate scale factor based on current camera settings
          const fov = camera.fov * (Math.PI / 180)
          const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z

          // Use a smaller scale factor (0.7) to prevent cutting off at top and bottom
          const scaleFactor = (visibleHeight * 0.7) / size.y

          model.scale.set(scaleFactor, scaleFactor, scaleFactor)

          // Center model within the visible camera area
          const center = box.getCenter(new THREE.Vector3())
          model.position.x = -center.x
          model.position.y = -center.y
          model.position.z = -center.z

          scene.add(model)

          // Apply the current theme colors after the model is loaded
          updateThemeColors()

          // Start animation ONLY after the model is processed and added
          animate()
        } catch (error) {
          console.error('Error processing loaded model:', error)
          // Create a basic fallback sphere if model processing fails
          createFallbackSphere()
        }
      },
      // Progress callback
      (xhr) => {
        if (loadingIndicator) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100)
          loadingIndicator.textContent = `Loading: ${percent}%`
        }
      },
      // Error callback
      (error) => {
        console.error(`Error loading GLTF model from ${path}:`, error)

        // Try fallback model if this was the primary path and hasn't been attempted yet
        if (!isRetry && !modelLoadAttempted && path !== fallbackModelPath) {
          console.log('Attempting to load fallback model...')
          modelLoadAttempted = true
          if (loadingIndicator) {
            loadingIndicator.textContent = 'Loading alternative model...'
          }
          loadModel(fallbackModelPath, true)
        } else {
          // If we've already tried the fallback or this is the fallback, create a simple sphere
          if (loadingIndicator && loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator)
          }
          createFallbackSphere()
        }
      }
    )
  } // End of loadModel function

  // Create a simple sphere as fallback if model loading fails
  const createFallbackSphere = () => {
    try {
      console.log('Creating fallback sphere')
      const geometry = new THREE.SphereGeometry(1, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: 0x8c8373,
        emissive: 0x111111,
        specular: 0xffffff,
        shininess: 30,
        transparent: true,
        opacity: 0.8,
      })

      model = new THREE.Mesh(geometry, material)
      modelMaterials.push(material)
      scene.add(model)

      // Apply current theme colors
      updateThemeColors()

      // Start animation
      animate()
    } catch (error) {
      console.error('Failed to create fallback sphere:', error)
      container.innerHTML = `<div class="fallback-content">
        <p>Unable to display 3D content.</p>
        <p>Tech Sphere - Coming Soon</p>
      </div>`
    }
  }

  // Start the loading process
  loadModel(modelPath)

  // --- Animation Loop ---
  const clock = new THREE.Clock()
  const rotationSpeed = 0.5 // Radians per second
  const colorCycleSpeed = 0.2 // Color change speed - lower for slower changes, higher for faster

  // Create a temporary color object to avoid creating one each frame
  const currentColor = new THREE.Color()

  // Track the total elapsed time for smooth color cycling
  let totalElapsedTime = 0

  const animate = () => {
    try {
      // Request next frame first in case of errors later in function
      requestAnimationFrame(animate)

      const deltaTime = clock.getDelta() // Time since last frame
      totalElapsedTime += deltaTime

      if (model && modelMaterials.length > 0) {
        // Check if model and materials are loaded
        try {
          // Create diagonal rotation from top-right to bottom-left
          // This is achieved by rotating around an axis that's 45 degrees between x and y

          // Define rotation axis (normalized vector for diagonal rotation)
          const rotationAxis = new THREE.Vector3(1, -1, 0).normalize()

          // Apply rotation around this custom axis
          model.rotateOnAxis(rotationAxis, rotationSpeed * deltaTime)

          // Add slight wobble for more interesting motion
          model.rotation.z = Math.sin(totalElapsedTime * 0.5) * 0.05

          // --- Calculate Color based on Time ---
          // Use time-based color cycle instead of rotation-based
          const cycleTime = totalElapsedTime * colorCycleSpeed
          const segment = 1 / targetColors.length // Time segment per color (normalized to 0-1)
          const cyclePosition = cycleTime % 1 // Normalized to 0-1 range

          // Determine which two colors to lerp between
          const index1 = Math.floor(cyclePosition / segment)
          const index2 = (index1 + 1) % targetColors.length // Wrap around

          // Calculate the progress (0 to 1) within the current segment
          const progress = (cyclePosition % segment) / segment

          // Get the two colors for interpolation
          const color1 = targetColors[index1]
          const color2 = targetColors[index2]

          // Safely interpolate (lerp) between the two colors
          try {
            currentColor.lerpColors(color1, color2, progress)
          } catch (colorError) {
            // Fallback if color lerp fails
            console.warn('Color interpolation failed:', colorError)
            // Use first color as fallback
            if (color1 && typeof color1.r !== 'undefined') {
              currentColor.r = color1.r
              currentColor.g = color1.g
              currentColor.b = color1.b
            }
          }

          // Apply the calculated color to all relevant materials
          modelMaterials.forEach((material) => {
            try {
              material.color.copy(currentColor)
            } catch {
              // Fallback to direct color assignment if copy fails
              material.color.r = currentColor.r
              material.color.g = currentColor.g
              material.color.b = currentColor.b
            }
          })
          // --- --------------------------------- ---
        } catch (animationError) {
          // Log but continue animation if part of it fails
          console.warn('Error in animation loop:', animationError)
        }
      }

      // Render scene safely
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    } catch (criticalError) {
      console.error('Critical error in animation loop:', criticalError)
      // Don't request another frame on critical errors
    }
  }
  // Note: animate() is called inside the loader callback now

  // --- Handle Resize ---
  const onWindowResize = () => {
    try {
      if (!container || !camera || !renderer) return

      // Get dimensions safely
      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight

      if (width === 0 || height === 0) {
        console.warn('Invalid container dimensions for resize')
        return
      }

      // Update camera aspect ratio
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      // Update renderer size
      renderer.setSize(width, height)

      // Recalculate sphere scale to fit the height if model exists
      if (model) {
        try {
          const box = new THREE.Box3().setFromObject(model)
          box.expandByScalar(0.1) // Add a bit of padding

          // Check for valid bounding box
          if (box.isEmpty()) {
            console.warn('Empty bounding box detected for model')
            return
          }

          const size = box.getSize(new THREE.Vector3())

          // Guard against division by zero
          if (size.y === 0) {
            console.warn('Invalid model size for scaling')
            return
          }

          // Calculate scale factor based on current camera settings
          const fov = camera.fov * (Math.PI / 180)
          const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z

          // Use a smaller scale factor (0.7) to prevent cutting off at top and bottom
          const scaleFactor = (visibleHeight * 0.7) / size.y

          // Reset scale before applying new scale to avoid compounding
          model.scale.set(1, 1, 1)
          model.scale.multiplyScalar(scaleFactor)
        } catch (modelError) {
          console.error('Error resizing model:', modelError)
        }
      }
    } catch (resizeError) {
      console.error('Error during window resize:', resizeError)
    }
  }
  // Safely add event listeners with error handling
  try {
    window.addEventListener('resize', onWindowResize)
    // Debounce the initial size setup to avoid potential race conditions
    setTimeout(() => {
      onWindowResize() // Initial size setup
    }, 100)

    // Listen for theme changes
    // 1. Detect initial theme
    updateThemeColors()

    // 2. Listen for theme toggle clicks
    const themeToggle = document.getElementById('dark-mode-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        try {
          // The theme toggle will change body class, so we update colors after a short delay
          setTimeout(updateThemeColors, 50)
        } catch (error) {
          console.warn('Error updating theme colors:', error)
        }
      })
    }

    // 3. Set up a MutationObserver to detect theme changes via class changes
    try {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            updateThemeColors()
          }
        })
      })

      observer.observe(document.body, { attributes: true })
    } catch (observerError) {
      console.warn('Error setting up theme observer:', observerError)
    }
  } catch (setupError) {
    console.error('Error in setup process:', setupError)
  }

  // Add styles for fallback content
  const style = document.createElement('style')
  style.textContent = `
    .fallback-content {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-dark);
    }
    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--color-accent);
      font-size: 0.875rem;
    }
    @media (prefers-reduced-motion) {
      .loading-indicator {
        animation: none !important;
      }
    }
  `
  document.head.appendChild(style)

  // Handle potential page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Refresh theme when coming back to the page
      updateThemeColors()
    }
  })
})

// Handle uncaught errors globally
window.addEventListener('error', (event) => {
  console.error('Global error caught in sphere viewer:', event.error)
  // Prevent the error from stopping other JavaScript
  event.preventDefault()
})
