import { execSync } from 'child_process';

export interface BitcoinRpcConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface TestWallet {
  name: string;
  descriptors: string[];
  xpubs: string[];
  addresses: string[];
}

const DEFAULT_CONFIG: BitcoinRpcConfig = {
  host: 'localhost',
  port: 8332, // nginx proxy port
  user: 'caravan_test_user',
  password: 'caravan_test_password_12345'
};

export class BitcoinTestHelper {
  private config: BitcoinRpcConfig;

  constructor(config: BitcoinRpcConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Execute a Bitcoin CLI command via HTTP RPC
   */
  private async rpcCall(method: string, params: any[] = []): Promise<any> {
    const auth = Buffer.from(`${this.config.user}:${this.config.password}`).toString('base64');
    
    const body = JSON.stringify({
      jsonrpc: '1.0',
      id: 'caravan-test',
      method,
      params
    });

    const response = await fetch(`http://${this.config.host}:${this.config.port}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Bitcoin RPC error: ${result.error.message}`);
    }

    return result.result;
  }

  /**
   * Wait for Bitcoin Core to be ready
   */
  async waitForReady(timeout = 30000): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        await this.rpcCall('getblockchaininfo');
        console.log('✅ Bitcoin Core is ready');
        return;
      } catch (error) {
        console.log('⏳ Waiting for Bitcoin Core...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Bitcoin Core failed to start within timeout');
  }

  /**
   * Generate blocks for mining rewards
   */
  async generateBlocks(count: number, address?: string): Promise<string[]> {
    if (!address) {
      // Create a temporary wallet to get an address for mining
      try {
        await this.rpcCall('createwallet', ['mining_temp']);
      } catch (error) {
        // Wallet might already exist, try to load it
        try {
          await this.rpcCall('loadwallet', ['mining_temp']);
        } catch (loadError) {
          // If both fail, continue - might already be loaded
        }
      }
      
      address = await this.rpcCall('getnewaddress', ['', 'bech32']);
    }
    
    const blocks = await this.rpcCall('generatetoaddress', [count, address]);
    console.log(`⛏️  Generated ${count} blocks`);
    return blocks;
  }

  /**
   * Create a test wallet and return xpubs
   */
  async createTestWallet(walletName: string): Promise<TestWallet> {
    try {
      // Create wallet with descriptors
      await this.rpcCall('createwallet', [walletName, false, false, '', false, true]);
    } catch (error) {
      // Wallet might exist, try to load it
      try {
        await this.rpcCall('loadwallet', [walletName]);
      } catch (loadError) {
        console.log(`Wallet ${walletName} already loaded or error: ${loadError}`);
      }
    }

    // Get wallet descriptors - these contain the xpubs
    const descriptors = await this.rpcCall('listdescriptors', []);
    
    // Extract xpubs from descriptors
    const xpubs: string[] = [];
    const addresses: string[] = [];
    
    for (const desc of descriptors.descriptors) {
      if (desc.desc.includes('pkh') || desc.desc.includes('wpkh')) {
        // Extract xpub from descriptor
        const xpubMatch = desc.desc.match(/\[([^\]]+)\]([xyzXYZ][a-zA-Z0-9]+)/);
        if (xpubMatch) {
          xpubs.push(xpubMatch[2]);
        }
        
        // Generate some addresses
        for (let i = 0; i < 5; i++) {
          try {
            const addr = await this.rpcCall('getnewaddress', ['', 'bech32']);
            addresses.push(addr);
          } catch (error) {
            console.log(`Error generating address ${i}: ${error}`);
          }
        }
      }
    }

    console.log(`💰 Created test wallet: ${walletName}`);
    console.log(`📝 Generated ${xpubs.length} xpubs and ${addresses.length} addresses`);

    return {
      name: walletName,
      descriptors: descriptors.descriptors.map((d: any) => d.desc),
      xpubs,
      addresses
    };
  }

  /**
   * Fund a wallet with some regtest bitcoin
   */
  async fundWallet(walletName: string, amount: number = 1): Promise<string> {
    await this.rpcCall('loadwallet', [walletName]);
    const address = await this.rpcCall('getnewaddress', ['', 'bech32']);
    
    // Send coins to the address
    const txid = await this.rpcCall('sendtoaddress', [address, amount]);
    
    // Generate a block to confirm the transaction
    await this.generateBlocks(1);
    
    console.log(`💸 Funded wallet ${walletName} with ${amount} BTC`);
    return txid;
  }

  /**
   * Get current blockchain info
   */
  async getBlockchainInfo(): Promise<any> {
    return await this.rpcCall('getblockchaininfo');
  }

  /**
   * Reset regtest environment
   */
  async reset(): Promise<void> {
    try {
      // Stop and remove all wallets
      const wallets = await this.rpcCall('listwallets');
      for (const wallet of wallets) {
        try {
          await this.rpcCall('unloadwallet', [wallet]);
        } catch (error) {
          // Ignore errors
        }
      }
      
      console.log('🔄 Reset Bitcoin environment');
    } catch (error) {
      console.log('Error during reset:', error);
    }
  }
} 