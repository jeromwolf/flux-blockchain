export * from './networks';
export * from './addresses';

// Common constants
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Role hashes
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
export const PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';
export const BURNER_ROLE = '0x51f4231475d91734c657e212cfb2e9728a863d53c9057d6ce6ca203d6e5cfd5d';
export const GAME_ADMIN_ROLE = '0x2db57a2d5f40c0588fb4a27a0fe6bd5de9ed0de616047273cbdfded8350d2a0d';
export const MARKETPLACE_ADMIN_ROLE = '0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253ceb1';

// Token constants
export const FLUX_TOKEN_DECIMALS = 18;
export const FLUX_TOKEN_CAP = BigInt('42000000000') * BigInt(10 ** FLUX_TOKEN_DECIMALS); // 42 billion

// Marketplace constants
export const MARKETPLACE_FEE_BASIS_POINTS = 250; // 2.5%
export const MAX_MARKETPLACE_FEE = 1000; // 10%

// Time constants
export const ONE_DAY = 86400;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 30;
export const ONE_YEAR = ONE_DAY * 365;