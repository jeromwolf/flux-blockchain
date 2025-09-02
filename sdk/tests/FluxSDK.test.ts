import { ethers } from 'ethers';
import { FluxSDK, Network, FluxSDKError, FluxErrorCode } from '../src';

describe('FluxSDK', () => {
  let sdk: FluxSDK;
  let provider: ethers.Provider;
  let signer: ethers.Wallet;

  const mockAddresses = {
    fluxToken: '0x1234567890123456789012345678901234567890',
    fluxGameAsset: '0x2345678901234567890123456789012345678901',
    fluxMarketplace: '0x3456789012345678901234567890123456789012',
    fluxAccessHub: '0x4567890123456789012345678901234567890123',
  };

  beforeEach(() => {
    provider = new ethers.JsonRpcProvider('http://localhost:8545');
    signer = new ethers.Wallet(
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      provider
    );
  });

  describe('Constructor', () => {
    it('should create SDK with provider only', () => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
      });

      expect(sdk).toBeDefined();
      expect(sdk.getNetwork()).toBe(Network.LOCALHOST);
      expect(sdk.getSigner()).toBeUndefined();
    });

    it('should create SDK with private key', () => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
        privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      });

      expect(sdk).toBeDefined();
      expect(sdk.getSigner()).toBeDefined();
    });

    it('should create SDK with custom RPC URL', () => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
        rpcUrl: 'http://custom-rpc:8545',
      });

      expect(sdk).toBeDefined();
    });

    it('should override contract addresses', () => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
        contracts: mockAddresses,
      });

      const addresses = sdk.getContractAddresses();
      expect(addresses.fluxToken).toBe(mockAddresses.fluxToken);
      expect(addresses.fluxGameAsset).toBe(mockAddresses.fluxGameAsset);
      expect(addresses.fluxMarketplace).toBe(mockAddresses.fluxMarketplace);
      expect(addresses.fluxAccessHub).toBe(mockAddresses.fluxAccessHub);
    });

    it('should throw error for unsupported network', () => {
      expect(() => {
        new FluxSDK({
          network: 999 as Network,
        });
      }).toThrow(FluxSDKError);
    });
  });

  describe('Factory Methods', () => {
    it('should create SDK with provider', () => {
      sdk = FluxSDK.createWithProvider(provider, Network.LOCALHOST);
      
      expect(sdk).toBeDefined();
      expect(sdk.getProvider()).toBe(provider);
      expect(sdk.getSigner()).toBeUndefined();
    });

    it('should create SDK with signer', () => {
      sdk = FluxSDK.createWithSigner(signer, Network.LOCALHOST);
      
      expect(sdk).toBeDefined();
      expect(sdk.getSigner()).toBe(signer);
    });

    it('should create SDK with signer and custom contracts', () => {
      sdk = FluxSDK.createWithSigner(signer, Network.LOCALHOST, mockAddresses);
      
      const addresses = sdk.getContractAddresses();
      expect(addresses.fluxToken).toBe(mockAddresses.fluxToken);
    });

    it('should throw error if signer has no provider', () => {
      const invalidSigner = new ethers.Wallet(
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      );

      expect(() => {
        FluxSDK.createWithSigner(invalidSigner, Network.LOCALHOST);
      }).toThrow('Signer must have a provider');
    });
  });

  describe('Network Management', () => {
    beforeEach(() => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
        contracts: mockAddresses,
      });
    });

    it('should get network', () => {
      expect(sdk.getNetwork()).toBe(Network.LOCALHOST);
    });

    it('should get network config', () => {
      const config = sdk.getNetworkConfig();
      expect(config.chainId).toBe(31337);
      expect(config.name).toBe('Localhost');
    });

    it('should get provider', () => {
      const provider = sdk.getProvider();
      expect(provider).toBeDefined();
    });

    it('should get chain ID', async () => {
      // Mock the provider's getNetwork method
      jest.spyOn(provider, 'getNetwork').mockResolvedValue({
        chainId: BigInt(31337),
        name: 'localhost',
      } as any);

      sdk = FluxSDK.createWithProvider(provider, Network.LOCALHOST);
      const chainId = await sdk.getChainId();
      expect(chainId).toBe(BigInt(31337));
    });
  });

  describe('Account Management', () => {
    it('should return null address when no signer', async () => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
      });

      const address = await sdk.getAddress();
      expect(address).toBeNull();
    });

    it('should get address with signer', async () => {
      sdk = FluxSDK.createWithSigner(signer, Network.LOCALHOST);
      
      const address = await sdk.getAddress();
      expect(address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    });

    it('should get balance', async () => {
      jest.spyOn(provider, 'getBalance').mockResolvedValue(BigInt('1000000000000000000'));
      
      sdk = FluxSDK.createWithSigner(signer, Network.LOCALHOST);
      const balance = await sdk.getBalance();
      
      expect(balance).toBe(BigInt('1000000000000000000'));
    });

    it('should throw error when getting balance without address', async () => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
      });

      await expect(sdk.getBalance()).rejects.toThrow(FluxSDKError);
    });
  });

  describe('Contract Addresses', () => {
    beforeEach(() => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
        contracts: mockAddresses,
      });
    });

    it('should get all contract addresses', () => {
      const addresses = sdk.getContractAddresses();
      expect(addresses).toEqual(mockAddresses);
    });

    it('should get individual contract addresses', () => {
      expect(sdk.getTokenAddress()).toBe(mockAddresses.fluxToken);
      expect(sdk.getGameAssetAddress()).toBe(mockAddresses.fluxGameAsset);
      expect(sdk.getMarketplaceAddress()).toBe(mockAddresses.fluxMarketplace);
      expect(sdk.getAccessHubAddress()).toBe(mockAddresses.fluxAccessHub);
    });

    it('should update contract addresses', () => {
      const newTokenAddress = '0x9999999999999999999999999999999999999999';
      
      sdk.updateContractAddresses({
        fluxToken: newTokenAddress,
      });

      expect(sdk.getTokenAddress()).toBe(newTokenAddress);
      expect(sdk.token.address).toBe(newTokenAddress);
    });
  });

  describe('Contract Instances', () => {
    beforeEach(() => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
        contracts: mockAddresses,
      });
    });

    it('should have token contract instance', () => {
      expect(sdk.token).toBeDefined();
      expect(sdk.token.address).toBe(mockAddresses.fluxToken);
    });

    it('should have game asset contract instance', () => {
      expect(sdk.gameAsset).toBeDefined();
      expect(sdk.gameAsset.address).toBe(mockAddresses.fluxGameAsset);
    });

    it('should have marketplace contract instance', () => {
      expect(sdk.marketplace).toBeDefined();
      expect(sdk.marketplace.address).toBe(mockAddresses.fluxMarketplace);
    });

    it('should have access hub contract instance', () => {
      expect(sdk.accessHub).toBeDefined();
      expect(sdk.accessHub.address).toBe(mockAddresses.fluxAccessHub);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      sdk = new FluxSDK({
        network: Network.LOCALHOST,
      });
    });

    it('should get block number', async () => {
      jest.spyOn(provider, 'getBlockNumber').mockResolvedValue(12345);
      
      sdk = FluxSDK.createWithProvider(provider, Network.LOCALHOST);
      const blockNumber = await sdk.getBlockNumber();
      
      expect(blockNumber).toBe(12345);
    });

    it('should get gas price', async () => {
      jest.spyOn(provider, 'getFeeData').mockResolvedValue({
        gasPrice: BigInt('20000000000'),
      } as any);
      
      sdk = FluxSDK.createWithProvider(provider, Network.LOCALHOST);
      const gasPrice = await sdk.getGasPrice();
      
      expect(gasPrice).toBe(BigInt('20000000000'));
    });
  });
});