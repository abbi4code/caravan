import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Stop and remove Docker services
    console.log('🐳 Stopping Docker services...');
    execSync('docker-compose down -v', { 
      stdio: 'inherit', 
      cwd: process.cwd() 
    });
    
    console.log('✅ Global teardown complete!');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here, just log the error
  }
}

export default globalTeardown; 