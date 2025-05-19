#!/usr/bin/env node

/**
 * Static accessibility checker for pre-commit hooks
 * 
 * This script performs static analysis on HTML attributes and elements
 * to catch common accessibility issues without requiring a running server.
 */

import { spawnSync } from 'child_process';

// Run eslint with accessibility rules
const eslintResult = spawnSync('pnpm', ['eslint', '.', '--ext', '.astro', '--quiet'], { stdio: 'inherit' });

// Check for common accessibility issues in staged files
const grepSetHtml = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM', '*.astro'], { encoding: 'utf8' });
const astroFiles = grepSetHtml.stdout.trim().split('\n').filter(Boolean);

if (astroFiles.length > 0) {
  // Check for set:html usage
  const grepResult = spawnSync('grep', ['-l', 'set:html', ...astroFiles], { encoding: 'utf8' });
  
  if (grepResult.stdout) {
    const filesWithSetHtml = grepResult.stdout.trim().split('\n').filter(Boolean);
    
    if (filesWithSetHtml.length > 0) {
      console.error('\x1b[31mError: Potential XSS vulnerability with set:html found in:\x1b[0m');
      filesWithSetHtml.forEach(file => console.error(`  - ${file}`));
      console.error('\x1b[33mFix: Replace set:html with safer alternatives like component-based rendering or define:vars\x1b[0m');
      process.exit(1);
    }
  }
  
  // Check for invalid HTML lang attributes
  const langAttributeResult = spawnSync('grep', ['-l', 'lang="{', ...astroFiles], { encoding: 'utf8' });
  
  if (langAttributeResult.stdout) {
    const filesWithInvalidLang = langAttributeResult.stdout.trim().split('\n').filter(Boolean);
    
    if (filesWithInvalidLang.length > 0) {
      console.error('\x1b[31mError: Invalid HTML lang attribute found in:\x1b[0m');
      filesWithInvalidLang.forEach(file => console.error(`  - ${file}`));
      console.error('\x1b[33mFix: Use proper Astro syntax for dynamic attributes: lang={variable} instead of lang="{variable}"\x1b[0m');
      process.exit(1);
    }
  }
}

console.log('\x1b[32mNo static accessibility issues found.\x1b[0m');
process.exit(eslintResult.status);
