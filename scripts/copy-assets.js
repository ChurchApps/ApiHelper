const fs = require('fs-extra');
const path = require('path');

async function copyAssets() {
  try {
    const srcDir = path.join(__dirname, '..', 'src', 'tools', 'templates');
    const destDir = path.join(__dirname, '..', 'dist', 'templates');
    
    // Ensure destination directory exists
    await fs.ensureDir(destDir);
    
    // Copy all files from src/tools/templates to dist/templates
    await fs.copy(srcDir, destDir);
    
    console.log('Assets copied successfully');
  } catch (error) {
    console.error('Error copying assets:', error);
    process.exit(1);
  }
}

copyAssets();