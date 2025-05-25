declare global {
  interface Window {
    ethereum?: any;
  }
}

export class AccountMonitor {
  private static instance: AccountMonitor;
  private accountChangeListeners: Array<(accounts: string[]) => void> = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AccountMonitor {
    if (!AccountMonitor.instance) {
      AccountMonitor.instance = new AccountMonitor();
    }
    return AccountMonitor.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('MetaMask account changed:', accounts[0]);
        this.notifyAccountChange(accounts);
      });
      this.isInitialized = true;
    } else {
      console.error('MetaMask is not installed');
    }
  }

  public addAccountChangeListener(listener: (accounts: string[]) => void): void {
    this.accountChangeListeners.push(listener);
  }

  public removeAccountChangeListener(listener: (accounts: string[]) => void): void {
    this.accountChangeListeners = this.accountChangeListeners.filter(l => l !== listener);
  }

  private notifyAccountChange(accounts: string[]): void {
    this.accountChangeListeners.forEach(listener => listener(accounts));
  }

  public async requestAccountSwitch(targetAccount: string): Promise<boolean> {
    if (!window.ethereum) return false;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts[0].toLowerCase() === targetAccount.toLowerCase()) {
        // Already using the correct account
        return true;
      }
      
      // Unfortunately, MetaMask doesn't allow directly switching to a specific account
      // We can only prompt the user to select an account
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if the user selected the correct account
      const newAccounts = await window.ethereum.request({ method: 'eth_accounts' });
      return newAccounts[0].toLowerCase() === targetAccount.toLowerCase();
    } catch (error) {
      console.error('Error requesting account switch:', error);
      return false;
    }
  }
}

export default AccountMonitor.getInstance();
