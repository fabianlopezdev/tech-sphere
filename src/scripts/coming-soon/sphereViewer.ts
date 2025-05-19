/**
 * Tech Sphere 3D Viewer
 * Renders a 3D model with color cycling effects
 */

import * as THREE from 'three' // Use bare specifier
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' // Still need path for examples

// Define types for color schemes
interface ColorScheme {
  light: THREE.Color[] | ColorFallback[]
  dark: THREE.Color[] | ColorFallback[]
}

// Fallback color type when THREE.Color initialization fails
interface ColorFallback {
  r: number
  g: number
  b: number
}

// Define types for opacity settings
interface OpacitySettings {
  light: number
  dark: number
}

/**
 * Check WebGL support
 * @returns {boolean} Whether WebGL is supported
 */
const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container: HTMLElement | null = document.getElementById('sphere-canvas')

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
  let colorSchemes: ColorScheme
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
  let targetColors: THREE.Color[] | ColorFallback[] = [...(colorSchemes.light as (THREE.Color | ColorFallback)[])]
  // Increased opacity for dark mode to make colors more visible
  const opacitySettings: OpacitySettings = {
    light: 0.3,
    dark: 0.5,
  }

  let targetOpacity: number = opacitySettings.light

  // Array to store materials that need color updates
  const modelMaterials: THREE.Material[] = []

  /**
   * Update colors based on theme
   */
  function updateThemeColors(): void {
    const isDarkMode = document.body.classList.contains('dark')
    targetColors = isDarkMode ? colorSchemes.dark : colorSchemes.light
    targetOpacity = isDarkMode ? opacitySettings.dark : opacitySettings.light

    // Update materials if they've been created
    if (modelMaterials.length > 0) {
      modelMaterials.forEach((material) => {
        // Update opacity for materials with opacity property
        if ('opacity' in material) {
          (material as THREE.Material & { opacity: number }).opacity = targetOpacity
        }

        // Optionally, you can immediately update the color to the first color in the new scheme
        // if ('color' in material) {
        //   (material as THREE.Material & { color: THREE.Color }).color.copy(targetColors[0] as THREE.Color);
        // }
      })
    }
  }

  // --- Lighting Palette ---
  const lightColors = {
    textLight: 0xffffff,
    accent: 0x666666, // Brighter ambient light to enhance colors
  }

  // Initialize Three.js scene with error handling
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let model: THREE.Object3D | null = null // Make model accessible in animate scope

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

  const loader = new GLTFLoader()

  // Path to model with a fallback option
  const modelPath = '/tech_sphere_logo.glb'
  const fallbackModelPath = '/models/fallback_sphere.glb'

  // Create a loading indicator
  const loadingIndicator = document.createElement('div')
  loadingIndicator.className = 'loading-indicator'
  loadingIndicator.textContent = 'Loading 3D model...'
  container.appendChild(loadingIndicator)

  // Start primary model loading with fallback system
  // Remove unused variable
  // const modelLoadAttempted = false

  /**
   * Load the 3D model with proper error handling
   * @param {string} path - Path to the model file
   * @param {boolean} isRetry - Whether this is a retry attempt
   */
  const loadModel = (path: string, isRetry = false): void => {
    loader.load(
      path, // Model path
      (gltf: { scene: THREE.Object3D }) => {
        // Success callback
        // Remove loading indicator once model loads
        if (loadingIndicator && loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator)
        }

        try {
          model = gltf.scene // Assign to the outer scope variable

          // --- Process Model Materials ---
          if (model) {
            model.traverse((object: THREE.Object3D) => {
            if ((object as THREE.Mesh).isMesh) {
              const mesh = object as THREE.Mesh
              // Ensure we handle single material or array of materials
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

              materials.forEach((material: THREE.Material) => {
                // For most materials, we need to ensure they're set to transparent = true
                // Since we're applying partial opacity

                // Check if this is a MeshStandardMaterial or other material with 'color' property
                if ('color' in material) {
                  // Store reference to material for color cycling
                  modelMaterials.push(material)

                  // Set material properties
                  if ('transparent' in material) {
                    (material as THREE.Material & { transparent: boolean }).transparent = true
                  }
                  if ('opacity' in material) {
                    (material as THREE.Material & { opacity: number }).opacity = targetOpacity
                  }
                  if ('side' in material) {
                    (material as THREE.Material & { side: THREE.Side }).side = THREE.DoubleSide
                  }
                }
              })
            }
          })

          // Add model to scene
          scene.add(model)
          }

          // Start animation loop
          animate()

          // Listen for theme changes
          document.addEventListener('themeChanged', () => {
            updateThemeColors()
          })

          // Initial theme color update
          updateThemeColors()
        } catch (error) {
          console.error('Error processing model:', error)
          if (!isRetry && fallbackModelPath && fallbackModelPath !== path) {
            console.warn('Trying fallback model...')
            loadModel(fallbackModelPath, true)
          } else {
            showLoadError()
          }
        }
      },
      // Progress callback
      (xhr: { loaded: number; total: number }) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100
        if (loadingIndicator) {
          loadingIndicator.textContent = `Loading 3D model: ${Math.round(percentComplete)}%`
        }
      },
      // Error callback
      (error: unknown) => {
        console.error('Error loading model:', error)
        if (!isRetry && fallbackModelPath && fallbackModelPath !== path) {
          console.warn('Trying fallback model...')
          loadModel(fallbackModelPath, true)
        } else {
          showLoadError()
        }
      }
    )
  }

  /**
   * Show load error message
   */
  const showLoadError = (): void => {
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator)
    }
    container.innerHTML = `<div class="fallback-content">
      <p>Unable to load 3D model.</p>
      <p>Please try refreshing the page.</p>
    </div>`
  }

  // Start loading the model
  loadModel(modelPath)

  // Variables for animation
  let colorIndex = 0
  let lastColorChange = 0
  const colorChangeInterval = 3000 // Change color every 3 seconds

  /**
   * Animation loop
   * @param {number} timestamp - Current timestamp
   */
  const animate = (timestamp = 0): void => {
    requestAnimationFrame(animate)

    // Rotate the model if it exists
    if (model) {
      model.rotation.y += 0.005 // Slow, subtle rotation
    }

    // Color cycling logic
    if (timestamp - lastColorChange > colorChangeInterval) {
      colorIndex = (colorIndex + 1) % targetColors.length
      lastColorChange = timestamp

      // Update material colors
      modelMaterials.forEach((material) => {
        if ('color' in material) {
          const targetColor = targetColors[colorIndex]
          if (targetColor instanceof THREE.Color) {
            // If it's a THREE.Color, use copy
            (material as THREE.Material & { color: THREE.Color }).color.copy(targetColor)
          } else {
            // If it's our fallback object with r,g,b properties
            const color = (material as THREE.Material & { color: THREE.Color }).color
            color.r = targetColor.r
            color.g = targetColor.g
            color.b = targetColor.b
          }
        }
      })
    }

    // Render the scene
    renderer.render(scene, camera)
  }

  // Handle window resize
  const handleResize = (): void => {
    if (!container) return

    // Update camera aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()

    // Update renderer size
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  // Add resize listener
  window.addEventListener('resize', handleResize)
})
