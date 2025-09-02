export enum FluxErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  MISSING_ARGUMENT = 'MISSING_ARGUMENT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Contract errors
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE',
  
  // Token errors
  TOKEN_CAP_EXCEEDED = 'TOKEN_CAP_EXCEEDED',
  TOKEN_PAUSED = 'TOKEN_PAUSED',
  INVALID_VESTING_SCHEDULE = 'INVALID_VESTING_SCHEDULE',
  
  // NFT errors
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  NOT_TOKEN_OWNER = 'NOT_TOKEN_OWNER',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SIGNATURE_EXPIRED = 'SIGNATURE_EXPIRED',
  
  // Marketplace errors
  LISTING_NOT_FOUND = 'LISTING_NOT_FOUND',
  LISTING_EXPIRED = 'LISTING_EXPIRED',
  LISTING_NOT_ACTIVE = 'LISTING_NOT_ACTIVE',
  INVALID_PRICE = 'INVALID_PRICE',
  OFFER_NOT_FOUND = 'OFFER_NOT_FOUND',
  
  // Access control errors
  ROLE_NOT_GRANTED = 'ROLE_NOT_GRANTED',
  TIMELOCK_NOT_READY = 'TIMELOCK_NOT_READY',
  DELEGATION_EXPIRED = 'DELEGATION_EXPIRED',
}

export class FluxSDKError extends Error {
  constructor(
    public code: FluxErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'FluxSDKError';
    Object.setPrototypeOf(this, FluxSDKError.prototype);
  }

  static fromError(error: any): FluxSDKError {
    // Handle ethers errors
    if (error.code === 'CALL_EXCEPTION') {
      const reason = error.reason || error.message;
      
      // Parse common contract errors
      if (reason.includes('ERC20: transfer amount exceeds balance')) {
        return new FluxSDKError(
          FluxErrorCode.INSUFFICIENT_BALANCE,
          'Insufficient token balance',
          error
        );
      }
      if (reason.includes('ERC20: insufficient allowance')) {
        return new FluxSDKError(
          FluxErrorCode.INSUFFICIENT_ALLOWANCE,
          'Insufficient token allowance',
          error
        );
      }
      if (reason.includes('Pausable: paused')) {
        return new FluxSDKError(
          FluxErrorCode.TOKEN_PAUSED,
          'Token transfers are paused',
          error
        );
      }
      if (reason.includes('AccessControl:')) {
        return new FluxSDKError(
          FluxErrorCode.ROLE_NOT_GRANTED,
          'Access denied: missing required role',
          error
        );
      }
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      return new FluxSDKError(
        FluxErrorCode.NETWORK_ERROR,
        'Network connection error',
        error
      );
    }

    // Default error
    return new FluxSDKError(
      FluxErrorCode.UNKNOWN_ERROR,
      error.message || 'An unknown error occurred',
      error
    );
  }
}

export function handleError(error: any): never {
  throw FluxSDKError.fromError(error);
}