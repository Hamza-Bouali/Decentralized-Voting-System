/**
 * Utility functions for validating account and contract parameters
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate that an account is provided and not empty
 * @param account The account address to validate
 * @param functionName Name of the calling function for better error messages
 */
export function validateAccount(account: string | undefined | null, functionName: string): ValidationResult {
  if (!account) {
    const message = `No account provided to ${functionName}`;
    console.error(message, new Error().stack);
    return {
      isValid: false,
      message
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that a contract instance is provided
 * @param contract The contract to validate
 * @param functionName Name of the calling function for better error messages
 */
export function validateContract(contract: any, functionName: string): ValidationResult {
  if (!contract) {
    const message = `No contract provided to ${functionName}`;
    console.error(message);
    return {
      isValid: false,
      message
    };
  }
  
  return { isValid: true };
}

/**
 * Validate both account and contract parameters
 * @param contract Contract to validate
 * @param account Account to validate
 * @param functionName Name of the calling function for better error messages
 */
export function validateParams(contract: any, account: string | undefined | null, functionName: string): ValidationResult {
  const contractValidation = validateContract(contract, functionName);
  if (!contractValidation.isValid) {
    return contractValidation;
  }
  
  const accountValidation = validateAccount(account, functionName);
  if (!accountValidation.isValid) {
    return accountValidation;
  }
  
  return { isValid: true };
}

/**
 * Logs the current state of a transaction
 * @param functionName The name of the calling function
 * @param account The account being used
 * @param details Optional additional details
 */
export function logTransactionState(functionName: string, account: string, details?: Record<string, any>): void {
  console.log(`${functionName}: Executing with account ${account}`, details || {});
}
