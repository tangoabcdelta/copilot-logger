const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const path = require('path');

const checksumFile = '.checksum';
const sourceFiles = ['src', 'package.json', 'webpack.config.js']; // Add other relevant files

// Recursively collect all file paths within a directory
function collectFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach((item) => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  return files;
}

// Generate a checksum for the specified files
function generateChecksum() {
  const hash = crypto.createHash('sha256');
  sourceFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isDirectory()) {
        const files = collectFiles(file);
        files.forEach((f) => {
          const fileContent = fs.readFileSync(f);
          hash.update(fileContent);
        });
      } else {
        const fileContent = fs.readFileSync(file);
        hash.update(fileContent);
      }
    }
  });
  return hash.digest('hex');
}

// Compare the current checksum with the stored checksum
function checkForChanges() {
  const currentChecksum = generateChecksum();
  let previousChecksum = '';

  if (fs.existsSync(checksumFile)) {
    previousChecksum = fs.readFileSync(checksumFile, 'utf8');
  }

  if (currentChecksum === previousChecksum) {
    console.warn('No changes detected. Version bump not required.');
    process.exit(1); // Exit with a warning
  } else {
    console.log('Changes detected. Bumping version...');
    execSync('npm version patch', { stdio: 'inherit' });
  }
}

// Check if the Git working directory is clean
function isGitClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim() === '';
  } catch (gitError) {
    console.error('[ERROR] Failed to check Git status:', gitError.message);
    return false;
  }
}

if (!isGitClean()) {
  console.warn('Git working directory is not clean. Please commit or stash your changes before running this script.');
  process.exit(1);
}

checkForChanges();