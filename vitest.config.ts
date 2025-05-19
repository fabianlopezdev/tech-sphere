/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    // Vitest configuration options
    // For example, to use happy-dom for a browser-like environment:
    environment: 'happy-dom',
    // You might want to add a global setup file if needed later
    // setupFiles: ['./src/tests/setup.ts'], 
    globals: true, // Optional: to use Vitest globals like describe, test, expect without importing
  },
})
