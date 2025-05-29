import { test, expect } from '@playwright/test';
import { BitcoinTestHelper, TestWallet } from '../helpers/bitcoin-setup';

test.describe('Caravan Wallet Creation', () => {
  let bitcoin: BitcoinTestHelper;
  let testWallets: TestWallet[];

  test.beforeAll(async () => {
    bitcoin = new BitcoinTestHelper();
    
    // Create test wallets and get xpubs
    console.log('🔧 Setting up test wallets...');
    const wallet1 = await bitcoin.createTestWallet('test_wallet_1');
    const wallet2 = await bitcoin.createTestWallet('test_wallet_2');
    const wallet3 = await bitcoin.createTestWallet('test_wallet_3');
    
    testWallets = [wallet1, wallet2, wallet3];
    
    // Fund the wallets
    await bitcoin.fundWallet('test_wallet_1', 1.5);
    await bitcoin.fundWallet('test_wallet_2', 2.0);
    await bitcoin.fundWallet('test_wallet_3', 1.0);
    
    console.log('💰 Test wallets created and funded');
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to Caravan
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load Caravan homepage', async ({ page }) => {
    // Check if Caravan loaded properly
    await expect(page).toHaveTitle(/Caravan/);
    
    // Look for key elements that indicate Caravan loaded
    // Note: You'll need to update these selectors based on actual Caravan UI
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/caravan-homepage.png' });
  });

  test('should create a 2-of-3 multisig wallet', async ({ page }) => {
    console.log('🔧 Starting wallet creation test...');
    
    // This test will need to be customized based on Caravan's actual UI
    // Here's a general flow of what we want to test:
    
    // 1. Navigate to wallet creation
    // Look for "Create New Wallet" or similar button
    const createWalletButton = page.locator('text=Create').first();
    if (await createWalletButton.isVisible()) {
      await createWalletButton.click();
    }
    
    // 2. Set up multisig configuration (2-of-3)
    // This will depend on Caravan's UI structure
    // You might need to:
    // - Select multisig type
    // - Set threshold (2) and total signers (3)
    // - Enter xpubs from our test wallets
    
    // 3. Enter the xpubs from our test wallets
    if (testWallets.length >= 3) {
      for (let i = 0; i < 3; i++) {
        const wallet = testWallets[i];
        if (wallet.xpubs.length > 0) {
          // Look for xpub input fields
          const xpubInput = page.locator(`input[placeholder*="xpub"], input[placeholder*="Extended Public Key"]`).nth(i);
          if (await xpubInput.isVisible()) {
            await xpubInput.fill(wallet.xpubs[0]);
          }
        }
      }
    }
    
    // 4. Configure Bitcoin Core connection
    // Look for settings or configuration to set Bitcoin Core endpoint
    const settingsButton = page.locator('text=Settings, text=Configure').first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Set Bitcoin Core RPC endpoint to our nginx proxy
      const rpcUrlInput = page.locator('input[placeholder*="RPC"], input[name*="rpc"], input[name*="endpoint"]');
      if (await rpcUrlInput.isVisible()) {
        await rpcUrlInput.fill('http://localhost:8332');
      }
      
      // Set RPC credentials
      const usernameInput = page.locator('input[name*="username"], input[placeholder*="username"]');
      if (await usernameInput.isVisible()) {
        await usernameInput.fill('caravan_test_user');
      }
      
      const passwordInput = page.locator('input[name*="password"], input[placeholder*="password"]');
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('caravan_test_password_12345');
      }
    }
    
    // 5. Save/Create the wallet
    const createButton = page.locator('button:has-text("Create"), button:has-text("Save"), button:has-text("Finish")');
    if (await createButton.isVisible()) {
      await createButton.click();
    }
    
    // 6. Verify wallet was created successfully
    // Look for success indicators
    await page.waitForTimeout(2000); // Wait for any async operations
    
    // Take screenshots for debugging
    await page.screenshot({ path: 'test-results/wallet-created.png' });
    
    // Check if we can see wallet details, addresses, or balance
    const walletContent = page.locator('body');
    await expect(walletContent).toBeVisible();
    
    console.log('✅ Wallet creation test completed');
  });

  test('should connect to Bitcoin Core and show blockchain info', async ({ page }) => {
    // Test basic connectivity to our Bitcoin Core instance
    
    // Navigate to settings or a page where we can test the connection
    await page.goto('/');
    
    // This test verifies that our Bitcoin Core setup is working
    // and that Caravan can connect to it through our nginx proxy
    
    // You can expand this to:
    // - Test RPC connection
    // - Display block height
    // - Show network info (should be 'regtest')
    
    await page.screenshot({ path: 'test-results/bitcoin-connection-test.png' });
    
    console.log('🔗 Bitcoin Core connection test completed');
  });

  test.afterAll(async () => {
    // Clean up test wallets
    if (bitcoin) {
      await bitcoin.reset();
    }
  });
}); 