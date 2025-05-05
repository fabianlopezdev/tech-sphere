import * as THREE from 'three'; // Use bare specifier
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Still need path for examples

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sphere-canvas');
  if (!container) {
    console.error("Container '#sphere-canvas' not found.");
    return;
  }

  // --- Target Colors for the Sphere Model ---
  // Define both light and dark mode color sets
  const colorSchemes = {
    light: [
      new THREE.Color(1, 0, 200 / 255),      // rgb(255, 0, 200) - brighter pink
      new THREE.Color(0, 230 / 255, 1),      // rgb(0, 230, 255) - brighter cyan
      new THREE.Color(1, 220 / 255, 0)       // rgb(255, 220, 0) - brighter yellow
    ],
    dark: [
      new THREE.Color(1, 100 / 255, 250 / 255),   // rgb(255, 100, 250) - lighter pink
      new THREE.Color(140 / 255, 1, 1),           // rgb(140, 255, 255) - lighter cyan
      new THREE.Color(1, 250 / 255, 150 / 255)    // rgb(255, 250, 150) - lighter yellow/gold
    ]
  };
  
  // Initialize with default colors (will be updated based on theme)
  let targetColors = [...colorSchemes.light];
  
  // Increased opacity for dark mode to make colors more visible
  const opacitySettings = {
    light: 0.3,
    dark: 0.5
  };
  
  let targetOpacity = opacitySettings.light;
  
  // Function to update colors based on theme
  function updateThemeColors() {
    const isDarkMode = document.body.classList.contains('dark');
    targetColors = isDarkMode ? colorSchemes.dark : colorSchemes.light;
    targetOpacity = isDarkMode ? opacitySettings.dark : opacitySettings.light;
    
    // Update materials if they've been created
    if (modelMaterials.length > 0) {
      modelMaterials.forEach(material => {
        // Update opacity
        material.opacity = targetOpacity;
        
        // Optionally, you can immediately update the color to the first color in the new scheme
        // material.color.copy(targetColors[0]);
      });
    }
  }
  // --- --------------------------------- ---

  // --- Lighting Palette ---
  const lightColors = {
    textLight: 0xffffff,
    accent: 0x666666  // Brighter ambient light to enhance colors
  };
  // --- ---------------- ---

  const scene = new THREE.Scene();
  // Background is transparent (set in renderer)

  // Adjust camera position for better view of the full-height sphere
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true // Transparent background
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // --- Lights ---
  // Main directional light - increased intensity
  const directionalLight = new THREE.DirectionalLight(lightColors.textLight, 1.5);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);
  
  // Add a second directional light from another angle for better coverage
  const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.0);
  secondaryLight.position.set(-5, 3, -5).normalize();
  scene.add(secondaryLight);

  // Brighter ambient light to ensure base illumination without washing out colors
  const ambientLight = new THREE.AmbientLight(lightColors.accent, 0.8);
  scene.add(ambientLight);
  // --- -------- ---

  const loader = new GLTFLoader();
  let model; // Make model accessible in animate scope
  const modelMaterials = []; // To store references to materials needing color change

  loader.load(
    '/tech_sphere_logo.glb', // Make sure this path is correct
    (gltf) => {
      model = gltf.scene; // Assign to the outer scope variable

      // --- Process Model Materials ---
      model.traverse((object) => {
        if (object.isMesh) {
          // Ensure we handle single material or array of materials
          const materials = Array.isArray(object.material) ? object.material : [object.material];

          materials.forEach(material => {
            if (material) {
              // Enable transparency and set opacity
              material.transparent = true;
              material.opacity = targetOpacity;
              
              // Enhance material properties for more vibrant appearance
              if (material.emissive) {
                // Add slight emissive property to make colors "glow" slightly
                material.emissive.set(0x222222);
                material.emissiveIntensity = 0.3;
              }
              
              // Increase shininess for more reflective look if it's a standard material
              if (material.shininess !== undefined) {
                material.shininess = 100;
              }
              
              // Store reference for color updates (if it has a color property)
              if (material.color) {
                // Set initial color (optional, could be the first target color)
                material.color.copy(targetColors[0]);
                modelMaterials.push(material);
              }
              
              // Ensure material updates are registered
              material.needsUpdate = true;
            }
          });
        }
      });
      // --- ------------------------- ---

      // Center and scale model to fit the full height of the container
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Move model to center
      model.position.sub(center);
      
      // Calculate scale factor to fit height of container
      // We'll use the camera's field of view and position to determine the visible height
      const fov = camera.fov * (Math.PI / 180); // Convert FOV to radians
      const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z;
      
      // Reduce scale factor to ensure no cutting off (using 0.7 instead of 0.85)
      const scaleFactor = (visibleHeight * 0.7) / size.y;
      
      // Apply uniform scaling to maintain proportions
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      scene.add(model);

      // Apply the current theme colors after the model is loaded
      updateThemeColors();

      // Start animation ONLY after the model is processed and added
      animate();
    },
    undefined,
    (error) => {
      console.error('An error happened loading the GLTF model:', error);
      container.innerHTML = `<p style="color: var(--text-color);">Error loading 3D model.</p>`; // Use theme color for error
    }
  );

  // --- Animation Loop ---
  const clock = new THREE.Clock();
  const rotationSpeed = 0.5; // Radians per second
  const colorCycleSpeed = 0.2; // Color change speed - lower for slower changes, higher for faster

  // Create a temporary color object to avoid creating one each frame
  const currentColor = new THREE.Color();

  // Track the total elapsed time for smooth color cycling
  let totalElapsedTime = 0;

  const animate = () => {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta(); // Time since last frame
    totalElapsedTime += deltaTime;

    if (model && modelMaterials.length > 0) { // Check if model and materials are loaded
      // Create diagonal rotation from top-right to bottom-left
      // This is achieved by rotating around an axis that's 45 degrees between x and y
      
      // Define rotation axis (normalized vector for diagonal rotation)
      const rotationAxis = new THREE.Vector3(1, -1, 0).normalize();
      
      // Apply rotation around this custom axis
      model.rotateOnAxis(rotationAxis, rotationSpeed * deltaTime);
      
      // Add slight wobble for more interesting motion
      model.rotation.z = Math.sin(totalElapsedTime * 0.5) * 0.05;

      // --- Calculate Color based on Time ---
      // Use time-based color cycle instead of rotation-based
      const cycleTime = totalElapsedTime * colorCycleSpeed;
      const segment = 1 / targetColors.length; // Time segment per color (normalized to 0-1)
      const cyclePosition = cycleTime % 1; // Normalized to 0-1 range

      // Determine which two colors to lerp between
      const index1 = Math.floor(cyclePosition / segment);
      const index2 = (index1 + 1) % targetColors.length; // Wrap around

      // Calculate the progress (0 to 1) within the current segment
      const progress = (cyclePosition % segment) / segment;

      // Get the two colors for interpolation
      const color1 = targetColors[index1];
      const color2 = targetColors[index2];

      // Interpolate (lerp) between the two colors
      currentColor.lerpColors(color1, color2, progress);

      // Apply the calculated color to all relevant materials
      modelMaterials.forEach(material => {
        material.color.copy(currentColor);
      });
      // --- --------------------------------- ---
    }

    renderer.render(scene, camera);
  };
  // Note: animate() is called inside the loader callback now

  // --- Handle Resize ---
  const onWindowResize = () => {
    if (!container) return;
    
    // Update camera aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Recalculate sphere scale to fit the height if model exists
    if (model) {
      const box = new THREE.Box3().setFromObject(model);
      box.expandByScalar(0.1); // Add a bit of padding
      const size = box.getSize(new THREE.Vector3());
      
      // Calculate scale factor based on current camera settings
      const fov = camera.fov * (Math.PI / 180);
      const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z;
      
      // Use a smaller scale factor (0.7) to prevent cutting off at top and bottom
      const scaleFactor = (visibleHeight * 0.7) / size.y;
      
      // Reset scale before applying new scale to avoid compounding
      model.scale.set(1, 1, 1);
      model.scale.multiplyScalar(scaleFactor);
    }
  }
  window.addEventListener('resize', onWindowResize);
  onWindowResize(); // Initial size setup

  // Listen for theme changes
  // 1. Detect initial theme
  updateThemeColors();
  
  // 2. Listen for theme toggle clicks
  const themeToggle = document.getElementById('dark-mode-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // The theme toggle will change body class, so we update colors after a short delay
      setTimeout(updateThemeColors, 50);
    });
  }
  
  // 3. Set up a MutationObserver to detect theme changes via class changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateThemeColors();
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
});