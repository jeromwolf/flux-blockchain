import { 
  FluxSDK, 
  Network, 
  AssetRarity,
  AssetType,
  FluxSDKError,
  FluxErrorCode
} from '@flux-blockchain/sdk';
import { ethers } from 'ethers';

async function advancedExample() {
  // 1. Custom provider setup
  const customProvider = new ethers.JsonRpcProvider('http://localhost:8545');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, customProvider);
  
  const sdk = FluxSDK.createWithSigner(wallet, Network.LOCALHOST);

  // 2. Role-based access control
  const adminRole = await sdk.accessHub.getRoleAdmin('0x' + '0'.repeat(64));
  console.log('Admin role:', adminRole);

  // Check if user has minter role
  const myAddress = await sdk.getAddress();
  const hasMinterRole = await sdk.token.canMint(myAddress!);
  console.log('Has minter role:', hasMinterRole);

  // 3. Vesting schedule management
  if (hasMinterRole) {
    const beneficiary = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const vestingAmount = sdk.token.parseTokenAmount('1000000'); // 1M tokens
    const startTime = BigInt(Math.floor(Date.now() / 1000));
    const cliff = BigInt(30 * 24 * 60 * 60); // 30 days
    const duration = BigInt(365 * 24 * 60 * 60); // 1 year

    try {
      console.log('Creating vesting schedule...');
      const vestingTx = await sdk.token.createVestingSchedule(
        beneficiary,
        vestingAmount,
        startTime,
        cliff,
        duration,
        true // revocable
      );
      await sdk.token.waitForTransaction(vestingTx);
      console.log('Vesting schedule created');

      // Check vesting info
      const vestingInfo = await sdk.token.getVestingSchedule(beneficiary);
      if (vestingInfo) {
        console.log('Vesting schedule:', {
          totalAmount: sdk.token.formatTokenAmount(vestingInfo.totalAmount),
          releasedAmount: sdk.token.formatTokenAmount(vestingInfo.releasedAmount),
          cliff: new Date(Number(vestingInfo.startTime + vestingInfo.cliff) * 1000),
        });
      }
    } catch (error) {
      if (error instanceof FluxSDKError) {
        console.error(`SDK Error [${error.code}]:`, error.message);
      }
    }
  }

  // 4. NFT minting with metadata
  const hasGameAdminRole = await sdk.gameAsset.canMint(myAddress!);
  if (hasGameAdminRole) {
    // Batch mint NFTs
    const recipients = [
      myAddress!,
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    ];
    const metadataURIs = [
      'ipfs://QmXxx1',
      'ipfs://QmXxx2',
      'ipfs://QmXxx3',
    ];
    const rarities = [
      AssetRarity.RARE,
      AssetRarity.EPIC,
      AssetRarity.LEGENDARY,
    ];

    console.log('Batch minting NFTs...');
    const batchMintTx = await sdk.gameAsset.batchMint(
      recipients,
      metadataURIs,
      rarities
    );
    await sdk.gameAsset.waitForTransaction(batchMintTx);
    console.log('Batch mint successful');
  }

  // 5. Complex marketplace operations
  // Create a trade offer
  const listings = await sdk.marketplace.getActiveListings(0, 5);
  if (listings.length > 0) {
    const targetListing = listings[0];
    
    // Check if we have NFTs to offer
    const myNFTs = await sdk.gameAsset.getTokensOfOwner(myAddress!);
    if (myNFTs.length > 0) {
      const offerTokenId = myNFTs[0];
      const additionalPayment = sdk.token.parseTokenAmount('100'); // 100 FLUX extra
      const offerExpiry = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24 hours

      console.log('Creating trade offer...');
      const offerTx = await sdk.marketplace.createTradeOffer(
        targetListing.listingId,
        AssetType.ERC721,
        sdk.getGameAssetAddress(),
        offerTokenId,
        BigInt(1),
        additionalPayment,
        offerExpiry
      );
      await sdk.marketplace.waitForTransaction(offerTx);
      console.log('Trade offer created');
    }
  }

  // 6. Event listening
  console.log('Listening for Transfer events...');
  const transferListener = sdk.token.onEvent('Transfer', (from, to, amount) => {
    console.log('Transfer detected:', {
      from,
      to,
      amount: sdk.token.formatTokenAmount(amount),
    });
  });

  // Listen for 10 seconds then remove listener
  setTimeout(() => {
    sdk.token.removeListener('Transfer', transferListener);
    console.log('Stopped listening for events');
  }, 10000);

  // 7. Time-locked operations
  const hasAdminRole = await sdk.accessHub.isAdmin(myAddress!);
  if (hasAdminRole) {
    const delay = await sdk.accessHub.timeLockDelay();
    const executionTime = sdk.accessHub.calculateExecutionTime(Number(delay));
    
    // Schedule a role grant
    const targetAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const grantRoleData = sdk.accessHub.contract.interface.encodeFunctionData(
      'grantRole',
      ['0x' + '1'.repeat(64), targetAddress] // Some custom role
    );

    console.log('Scheduling time-locked operation...');
    const scheduleTx = await sdk.accessHub.scheduleTimeLock(
      sdk.getAccessHubAddress(),
      grantRoleData,
      executionTime
    );
    await sdk.accessHub.waitForTransaction(scheduleTx);
    
    const timeLockId = sdk.accessHub.generateTimeLockId(
      sdk.getAccessHubAddress(),
      grantRoleData,
      executionTime
    );
    console.log('Time lock scheduled:', timeLockId);
  }

  // 8. Error handling
  try {
    // Try to transfer more than balance
    const hugeAmount = sdk.token.parseTokenAmount('999999999999');
    await sdk.token.transfer(myAddress!, hugeAmount);
  } catch (error) {
    if (error instanceof FluxSDKError) {
      switch (error.code) {
        case FluxErrorCode.INSUFFICIENT_BALANCE:
          console.log('Caught insufficient balance error');
          break;
        case FluxErrorCode.TRANSACTION_FAILED:
          console.log('Transaction failed:', error.message);
          break;
        default:
          console.error('Unknown error:', error);
      }
    }
  }

  // 9. Query historical events
  const fromBlock = (await sdk.getBlockNumber()) - 100;
  const toBlock = 'latest';
  
  const mintEvents = await sdk.gameAsset.queryFilter('Transfer', fromBlock);
  console.log(`Found ${mintEvents.length} NFT transfers in last 100 blocks`);

  // 10. Gas estimation
  const estimatedGas = await sdk.token.estimateGas(
    'transfer',
    [myAddress!, sdk.token.parseTokenAmount('1')]
  );
  const gasPrice = await sdk.getGasPrice();
  const estimatedCost = estimatedGas * gasPrice;
  console.log('Estimated transaction cost:', ethers.formatEther(estimatedCost), 'ETH');
}

// Run the advanced example
advancedExample()
  .then(() => console.log('Advanced example completed'))
  .catch(console.error);