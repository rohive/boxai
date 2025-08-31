const { execSync } = require('child_process');
const path = require('path');

console.log('Starting build process...');

// Install frontend dependencies
console.log('Installing frontend dependencies...');
execSync('cd frontend && npm install', { stdio: 'inherit' });

// Build frontend
console.log('Building frontend...');
execSync('cd frontend && npm run build', { stdio: 'inherit' });

// Install backend dependencies
console.log('Installing backend dependencies...');
execSync('cd backend-node && npm install', { stdio: 'inherit' });

console.log('Build process completed!');
