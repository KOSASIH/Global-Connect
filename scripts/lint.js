const { execSync } = require('child_process');

try {
  execSync('npx eslint . --ext .js,.jsx,.ts,.tsx', { stdio: 'inherit' });
  console.log('Linting passed!');
} catch (error) {
  console.error('Linting failed.');
  process.exit(1);
}