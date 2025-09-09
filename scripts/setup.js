#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PDF Viewer Dashboard...\n');

// Check if .env files exist and create them if they don't
const envFiles = [
  {
    source: 'apps/api/env.example',
    target: 'apps/api/.env',
    name: 'API'
  },
  {
    source: 'apps/web/env.local.example',
    target: 'apps/web/.env.local',
    name: 'Web'
  }
];

envFiles.forEach(({ source, target, name }) => {
  const sourcePath = path.join(__dirname, '..', source);
  const targetPath = path.join(__dirname, '..', target);
  
  if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Created ${name} environment file: ${target}`);
  } else if (fs.existsSync(targetPath)) {
    console.log(`⚠️  ${name} environment file already exists: ${target}`);
  } else {
    console.log(`❌ Source file not found: ${source}`);
  }
});

console.log('\n📋 Next steps:');
console.log('1. Update the environment files with your actual values:');
console.log('   - apps/api/.env (MongoDB URI, AI API keys)');
console.log('   - apps/web/.env.local (API URL)');
console.log('2. Install dependencies: npm install');
console.log('3. Start development: npm run dev');
console.log('\n🎉 Setup complete!');
