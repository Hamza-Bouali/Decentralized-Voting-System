import debugHelper from './debug-helper';

/**
 * Wraps an admin function call with proper error handling and account verification
 * @param componentName The name of the component making the call
 * @param contract The contract instance
 * @param account The account to use
 * @param actionName Name of the admin action being performed
 * @param action The function to execute if admin check passes
 * @returns Result object with success status and message
 */
export async function adminActionWrapper<T>(
  componentName: string,
  contract: any,
  account: string,
  actionName: string,
  action: () => Promise<T>
): Promise<{ success: boolean; message: string; result?: T }> {
  try {
    debugHelper.log(componentName, `Starting admin action: ${actionName}`, { account });
    
    // Check if account is provided
    if (!account) {
      debugHelper.log(componentName, 'No account provided for admin action', { actionName });
      return { 
        success: false, 
        message: "No connected account. Please ensure MetaMask is connected."
      };
    }
    
    // Check if user is admin
    try {
      const owner = await contract.methods.owner().call();
      const isAdmin = account.toLowerCase() === owner.toLowerCase();
      
      debugHelper.log(componentName, `Admin check for ${actionName}`, { 
        account, 
        owner, 
        isAdmin 
      });
      
      if (!isAdmin) {
        return { 
          success: false, 
          message: `Current account (${account}) is not the contract owner (${owner}). Please switch to the admin account in MetaMask.`
        };
      }
    } catch (error) {
      debugHelper.log(componentName, `Error in admin check for ${actionName}`, { error });
      return { 
        success: false, 
        message: `Could not verify admin status: ${error instanceof Error ? error.message : String(error)}`
      };
    }
    
    // Execute the action
    debugHelper.log(componentName, `Executing admin action: ${actionName}`);
    const result = await action();
    debugHelper.log(componentName, `Completed admin action: ${actionName}`, { result });
    
    return {
      success: true,
      message: `${actionName} completed successfully.`,
      result
    };
  } catch (error) {
    debugHelper.log(componentName, `Failed admin action: ${actionName}`, { error });
    return {
      success: false,
      message: `${actionName} failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Alternative version that throws errors instead of returning error objects
 */
export async function adminActionThrowWrapper<T>(
  componentName: string,
  contract: any,
  account: string,
  actionName: string,
  action: () => Promise<T>
): Promise<T> {
  debugHelper.log(componentName, `Starting admin action (throw version): ${actionName}`, { account });
  
  // Check if account is provided
  if (!account) {
    const errorMsg = "No account provided for admin action";
    debugHelper.log(componentName, errorMsg, { actionName });
    throw new Error(errorMsg);
  }
  
  // Check if user is admin
  const owner = await contract.methods.owner().call();
  const isAdmin = account.toLowerCase() === owner.toLowerCase();
  
  debugHelper.log(componentName, `Admin check for ${actionName}`, { account, owner, isAdmin });
  
  if (!isAdmin) {
    const errorMsg = `Current account (${account}) is not the contract owner (${owner}). Please switch to the admin account in MetaMask.`;
    throw new Error(errorMsg);
  }
  
  // Execute the action
  debugHelper.log(componentName, `Executing admin action: ${actionName}`);
  return await action();
}

/**
 * This function specifically helps with the getRegistrationRequests function that's having issues
 */
export async function safeGetRegistrationRequests(contract: any, account: string): Promise<string[]> {
  const componentName = 'SafeGetRegistrationRequests';
  
  try {
    debugHelper.log(componentName, 'Starting getRegistrationRequests', { account });
    
    // Explicit check for missing account
    if (!account) {
      debugHelper.log(componentName, 'No account provided for getRegistrationRequests');
      throw new Error('No account provided for getRegistrationRequests');
    }
    
    // Get owner directly
    const owner = await contract.methods.owner().call();
    debugHelper.log(componentName, 'Got contract owner', { owner });
    
    // Compare account to owner
    const isAdmin = account.toLowerCase() === owner.toLowerCase();
    debugHelper.log(componentName, 'Admin check result', { account, owner, isAdmin });
    
    if (!isAdmin) {
      throw new Error(`Current account (${account}) is not the contract owner (${owner}). Please switch to the admin account in MetaMask.`);
    }
    
    // Call contract method with explicit from address
    debugHelper.log(componentName, 'Calling getRegistrationRequests with account', { account });
    const result = await contract.methods.getRegistrationRequests().call({ from: account });
    debugHelper.log(componentName, 'getRegistrationRequests result', { result });
    
    return result;
  } catch (error) {
    debugHelper.log(componentName, 'Error in getRegistrationRequests', { error });
    throw error;
  }
}
