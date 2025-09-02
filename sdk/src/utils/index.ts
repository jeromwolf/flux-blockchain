export * from './errors';
export * from './provider';
export * from './transactions';

// Utility functions
export function isAddress(address: string): boolean {
  try {
    return address.length === 42 && address.startsWith('0x');
  } catch {
    return false;
  }
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!isAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function toBigInt(value: any): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string') return BigInt(value);
  throw new Error(`Cannot convert ${typeof value} to bigint`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}