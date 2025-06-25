import { NexusSDK, SUPPORTED_TOKENS, SUPPORTED_CHAINS_IDS } from "avail-nexus-sdk";

export interface NexusSDKInstance {
  sdk: NexusSDK | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

export interface TransferParams {
  token: SUPPORTED_TOKENS;
  amount: number;
  chainId: SUPPORTED_CHAINS_IDS;
  recipient: `0x${string}`;
}

export interface BridgeParams {
  token: SUPPORTED_TOKENS;
  amount: number;
  chainId: SUPPORTED_CHAINS_IDS;
}

export class NexusSDKService {
  private sdk: NexusSDK | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private error: string | null = null;

  // Load SDK dynamically
  async loadSDK(): Promise<NexusSDK | null> {
    try {
      const { NexusSDK } = await import("avail-nexus-sdk");
      this.sdk = new NexusSDK();
      return this.sdk;
    } catch (error) {
      console.error("Failed to load Nexus SDK:", error);
      this.error = "Failed to load Nexus SDK";
      return null;
    }
  }

  // Initialize SDK with provider
  async initialize(provider: any): Promise<boolean> {
    if (!this.sdk) {
      this.error = "Nexus SDK not loaded yet";
      return false;
    }

    if (this.isInitialized) {
      console.log("Nexus SDK already initialized");
      return true;
    }

    this.isInitializing = true;
    this.error = null;

    try {
      console.log("Initializing Nexus SDK...");
      
      // Wrap the initialization in a more specific try-catch
      try {
        await this.sdk.initialize(provider);
        console.log("Nexus SDK initialized successfully");
      } catch (initError) {
        console.error("SDK initialization failed:", initError);
        
        // Handle specific CA SDK errors
        const errorMessage = initError instanceof Error ? initError.message : String(initError);
        
        if (errorMessage.includes("Failed to initialize CA SDK") || 
            errorMessage.includes("Error initializing CA") ||
            errorMessage.includes("CA SDK")) {
          this.error = "Initialization was rejected. Please approve the wallet connection prompt and try again.";
        } else if (errorMessage.includes("User rejected") || 
                   errorMessage.includes("User denied") ||
                   errorMessage.includes("rejected")) {
          this.error = "Initialization was cancelled. Please try again and approve the connection.";
        } else if (errorMessage.includes("MetaMask") || 
                   errorMessage.includes("wallet") ||
                   errorMessage.includes("provider")) {
          this.error = "Wallet connection failed. Please check your wallet and try again.";
        } else {
          this.error = `Initialization failed: ${errorMessage}`;
        }
        
        return false;
      }
      
      // Set up hooks for intent and allowance management
      this.sdk.setOnIntentHook(({ intent, allow }: { intent: any; allow: () => void }) => {
        console.log("Intent received:", intent);
        // For now, automatically allow all intents
        // In a real app, you'd show a UI to the user for approval
        allow();
      });

      this.sdk.setOnAllowanceHook(async ({ sources, allow }: { sources: any; allow: (sources: string[]) => void }) => {
        console.log("Allowance needed:", sources);
        // For now, automatically allow minimum allowances
        // In a real app, you'd show a UI to the user for approval
        allow(['min']);
      });

      // Set up account and chain change listeners
      this.sdk.onAccountChanged((account: any) => {
        console.log("Account changed:", account);
      });

      this.sdk.onChainChanged((chainId: any) => {
        console.log("Chain changed:", chainId);
      });

      this.isInitialized = true;
      console.log("Nexus SDK setup completed");
      return true;
    } catch (error) {
      console.error("Failed to initialize Nexus SDK:", error);
      
      // Handle any other errors that might occur
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("Failed to initialize CA SDK") || 
          errorMessage.includes("Error initializing CA") ||
          errorMessage.includes("CA SDK")) {
        this.error = "Initialization was rejected. Please approve the wallet connection prompt and try again.";
      } else if (errorMessage.includes("User rejected") || 
                 errorMessage.includes("User denied")) {
        this.error = "Initialization was cancelled. Please try again and approve the connection.";
      } else if (errorMessage.includes("MetaMask") || 
                 errorMessage.includes("wallet")) {
        this.error = "Wallet connection failed. Please check your wallet and try again.";
      } else {
        this.error = errorMessage;
      }
      
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  // Get SDK instance
  getSDK(): NexusSDK | null {
    return this.sdk;
  }

  // Get initialization status
  getStatus(): NexusSDKInstance {
    return {
      sdk: this.sdk,
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing,
      error: this.error
    };
  }

  // Fetch unified balances
  async getUnifiedBalances(): Promise<any[]> {
    if (!this.isInitialized || !this.sdk) {
      throw new Error("Nexus SDK not initialized");
    }

    try {
      console.log("Fetching unified balances...");
      const unifiedBalances = await this.sdk.getUnifiedBalances();
      console.log("Unified balances:", unifiedBalances);
      return unifiedBalances;
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      throw error;
    }
  }

  // Simulate transfer
  async simulateTransfer(params: TransferParams): Promise<any> {
    if (!this.isInitialized || !this.sdk) {
      throw new Error("Nexus SDK not loaded");
    }

    return await this.sdk.simulateTransfer(params);
  }

  // Execute transfer
  async transfer(params: TransferParams): Promise<any> {
    if (!this.isInitialized || !this.sdk) {
      throw new Error("Nexus SDK not loaded");
    }

    return await this.sdk.transfer(params);
  }

  // Simulate bridge
  async simulateBridge(params: BridgeParams): Promise<any> {
    if (!this.isInitialized || !this.sdk) {
      throw new Error("Nexus SDK not loaded");
    }

    return await this.sdk.simulateBridge(params);
  }

  // Execute bridge
  async bridge(params: BridgeParams): Promise<any> {
    if (!this.isInitialized || !this.sdk) {
      throw new Error("Nexus SDK not loaded");
    }

    return await this.sdk.bridge(params);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.isInitialized && this.sdk) {
      this.sdk.removeAllListeners();
      await this.sdk.deinit().catch(console.error);
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const nexusSDKService = new NexusSDKService(); 