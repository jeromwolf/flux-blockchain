import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { 
  Address, 
  TransactionOptions, 
  AssetMetadata,
  AssetRarity,
  MintSignature 
} from '../types';
import { GAME_ADMIN_ROLE } from '../constants';
import { handleError } from '../utils';
import FluxGameAssetABI from '../abis/FluxGameAsset.json';

export class FluxGameAsset extends BaseContract {
  constructor(
    address: Address,
    signerOrProvider: ethers.Signer | ethers.Provider
  ) {
    super(address, FluxGameAssetABI.abi, signerOrProvider);
  }

  // Read methods
  async name(): Promise<string> {
    try {
      return await this.call<string>('name');
    } catch (error) {
      return handleError(error);
    }
  }

  async symbol(): Promise<string> {
    try {
      return await this.call<string>('symbol');
    } catch (error) {
      return handleError(error);
    }
  }

  async totalSupply(): Promise<bigint> {
    try {
      return await this.call<bigint>('totalSupply');
    } catch (error) {
      return handleError(error);
    }
  }

  async balanceOf(owner: Address): Promise<bigint> {
    try {
      return await this.call<bigint>('balanceOf', owner);
    } catch (error) {
      return handleError(error);
    }
  }

  async ownerOf(tokenId: bigint): Promise<Address> {
    try {
      return await this.call<Address>('ownerOf', tokenId);
    } catch (error) {
      return handleError(error);
    }
  }

  async tokenURI(tokenId: bigint): Promise<string> {
    try {
      return await this.call<string>('tokenURI', tokenId);
    } catch (error) {
      return handleError(error);
    }
  }

  async getApproved(tokenId: bigint): Promise<Address> {
    try {
      return await this.call<Address>('getApproved', tokenId);
    } catch (error) {
      return handleError(error);
    }
  }

  async isApprovedForAll(owner: Address, operator: Address): Promise<boolean> {
    try {
      return await this.call<boolean>('isApprovedForAll', owner, operator);
    } catch (error) {
      return handleError(error);
    }
  }

  async getAssetMetadata(tokenId: bigint): Promise<AssetMetadata> {
    try {
      const metadata = await this.call<any>('assetMetadata', tokenId);
      
      return {
        tokenId,
        assetType: metadata.assetType,
        level: metadata.level,
        experience: metadata.experience,
        rarity: metadata.rarity as AssetRarity,
        attributes: metadata.attributes,
        createdAt: metadata.createdAt,
        lastUpgrade: metadata.lastUpgrade,
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async getTokensOfOwner(owner: Address): Promise<bigint[]> {
    try {
      const balance = await this.balanceOf(owner);
      const tokens: bigint[] = [];
      
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await this.call<bigint>('tokenOfOwnerByIndex', owner, i);
        tokens.push(tokenId);
      }
      
      return tokens;
    } catch (error) {
      return handleError(error);
    }
  }

  async baseURI(): Promise<string> {
    try {
      return await this.call<string>('baseURI');
    } catch (error) {
      return handleError(error);
    }
  }

  async royaltyInfo(tokenId: bigint, salePrice: bigint): Promise<[Address, bigint]> {
    try {
      return await this.call<[Address, bigint]>('royaltyInfo', tokenId, salePrice);
    } catch (error) {
      return handleError(error);
    }
  }

  async hasRole(role: string, account: Address): Promise<boolean> {
    try {
      return await this.call<boolean>('hasRole', role, account);
    } catch (error) {
      return handleError(error);
    }
  }

  // Write methods
  async mint(
    to: Address,
    metadataURI: string,
    rarity: AssetRarity,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('mint', [to, metadataURI, rarity], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async mintWithSignature(
    signature: MintSignature,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'mintWithSignature',
        [
          signature.tokenId,
          signature.recipient,
          signature.metadataURI,
          signature.rarity,
          signature.deadline,
          signature.v,
          signature.r,
          signature.s
        ],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async batchMint(
    recipients: Address[],
    metadataURIs: string[],
    rarities: AssetRarity[],
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'batchMint',
        [recipients, metadataURIs, rarities],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async approve(
    to: Address,
    tokenId: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('approve', [to, tokenId], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setApprovalForAll(
    operator: Address,
    approved: boolean,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setApprovalForAll', [operator, approved], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async transferFrom(
    from: Address,
    to: Address,
    tokenId: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('transferFrom', [from, to, tokenId], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async safeTransferFrom(
    from: Address,
    to: Address,
    tokenId: bigint,
    data: string = '0x',
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'safeTransferFrom(address,address,uint256,bytes)',
        [from, to, tokenId, data],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async burn(
    tokenId: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('burn', [tokenId], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async upgradeAsset(
    tokenId: bigint,
    newLevel: number,
    additionalExperience: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'upgradeAsset',
        [tokenId, newLevel, additionalExperience],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async updateAssetAttributes(
    tokenId: bigint,
    attributes: Record<string, any>,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'updateAssetAttributes',
        [tokenId, JSON.stringify(attributes)],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async combineAssets(
    tokenIds: bigint[],
    newMetadataURI: string,
    newRarity: AssetRarity,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'combineAssets',
        [tokenIds, newMetadataURI, newRarity],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async setBaseURI(
    baseURI: string,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setBaseURI', [baseURI], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setDefaultRoyalty(
    receiver: Address,
    feeNumerator: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setDefaultRoyalty', [receiver, feeNumerator], options);
    } catch (error) {
      return handleError(error);
    }
  }

  // Helper methods
  async canMint(account: Address): Promise<boolean> {
    return this.hasRole(GAME_ADMIN_ROLE, account);
  }

  async exists(tokenId: bigint): Promise<boolean> {
    try {
      await this.ownerOf(tokenId);
      return true;
    } catch {
      return false;
    }
  }

  async isOwner(tokenId: bigint, address: Address): Promise<boolean> {
    try {
      const owner = await this.ownerOf(tokenId);
      return owner.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }
}