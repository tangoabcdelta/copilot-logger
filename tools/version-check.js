const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

const checksumFile = '.checksum';
const sourceFiles = ['src', 'package.json', 'webpack.config.js']; // Add other relevant files

// Generate a checksum for the specified files
function generateChecksum() {
  const hash = crypto.createHash('sha256');
  sourceFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const fileContent = fs.readFileSync(file);
      hash.update(fileContent);
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
    fs.writeFileSync(checksumFile, currentChecksum);
    console.log('Changes detected. Bumping version...');
    execSync('npm version patch', { stdio: 'inherit' });
  }
}

checkForChanges();