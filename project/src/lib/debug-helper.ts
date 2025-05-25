/**
 * A utility class to help with debugging Web3 and account-related issues
 */
export class DebugHelper {
  private static instance: DebugHelper;
  private isActive: boolean = true;

  private constructor() {}

  public static getInstance(): DebugHelper {
    if (!DebugHelper.instance) {
      DebugHelper.instance = new DebugHelper();
    }
    return DebugHelper.instance;
  }

  /**
   * Enable or disable debug logging
   */
  public setActive(active: boolean): void {
    this.isActive = active;
  }

  /**
   * Log debug information with component context
   */
  public log(component: string, message: string, data?: any): void {
    if (!this.isActive) return;

    if (data) {
      console.log(`[${component}] ${message}`, data);
    } else {
      console.log(`[${component}] ${message}`);
    }
  }

  /**
   * Test admin status in the current context and log the result
   */
  public async testAdminStatus(
    component: string, 
    contract: any, 
    account: string
  ): Promise<boolean> {
    if (!this.isActive) return false;

    try {
      if (!account) {
        console.error(`[${component}] No account available to check admin status`);
        return false;
      }

      const owner = await contract.methods.owner().call();
      const isAdmin = account.toLowerCase() === owner.toLowerCase();
      
      console.log(`[${component}] Admin status check:`, {
        component,
        account,
        owner,
        isAdmin,
        accountType: typeof account,
        ownerType: typeof owner
      });
      
      return isAdmin;
    } catch (error) {
      console.error(`[${component}] Error testing admin status:`, error);
      return false;
    }
  }

  /**
   * Log the current Web3 state
   */
  public async logWeb3State(component: string, web3: any, contract: any, account: string): Promise<void> {
    if (!this.isActive) return;

    try {
      const networkId = await web3.eth.net.getId();
      const networkType = await web3.eth.net.getNetworkType();
      const accounts = await web3.eth.getAccounts();
      const balance = account ? await web3.eth.getBalance(account) : 'N/A';
      
      let owner = 'Error fetching owner';
      try {
        owner = await contract.methods.owner().call();
      } catch (err) {
        console.error(`[${component}] Error fetching owner:`, err);
      }

      console.log(`[${component}] Web3 State:`, {
        component,
        networkId,
        networkType,
        accounts,
        currentAccount: account,
        balance: web3.utils.fromWei(balance, 'ether') + ' ETH',
        owner,
        isOwner: account && owner ? account.toLowerCase() === owner.toLowerCase() : false,
        contractAddress: contract._address
      });

    } catch (error) {
      console.error(`[${component}] Error logging Web3 state:`, error);
    }
  }
}

export default DebugHelper.getInstance();
