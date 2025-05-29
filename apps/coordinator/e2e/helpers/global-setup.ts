import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import { BitcoinTestHelper } from './bitcoin-setup';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  try {
    // Start Docker services
    console.log('🐳 Starting Docker services...');
    execSync('docker-compose up -d', { 
      stdio: 'inherit', 
      cwd: process.cwd() 
    });
    
    // Wait for services to be healthy
    console.log('⏳ Waiting for services to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    
    // Initialize Bitcoin helper and wait for Bitcoin Core
    const bitcoin = new BitcoinTestHelper();
    await bitcoin.waitForReady(60000); // 60 second timeout
    
    // Generate some initial blocks for mining rewards
    console.log('⛏️  Generating initial blocks...');
    await bitcoin.generateBlocks(101); // 101 blocks to activate coinbase rewards
    
    console.log('✅ Global setup complete!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Try to clean up on failure
    try {
      execSync('docker-compose down', { 
        stdio: 'inherit', 
        cwd: process.cwd() 
      });
    } catch (cleanupError) {
      console.error('Failed to cleanup after setup failure:', cleanupError);
    }
    
    throw error;
  }
}

export default globalSetup; 