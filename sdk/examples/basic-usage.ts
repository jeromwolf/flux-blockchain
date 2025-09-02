import { FluxSDK, Network } from '@flux-blockchain/sdk';

async function main() {
  // 1. Initialize SDK with provider (read-only)
  const readOnlySDK = new FluxSDK({
    network: Network.LOCALHOST,
    rpcUrl: 'http://localhost:8545',
  });

  // 2. Initialize SDK with signer (read-write)
  const sdk = new FluxSDK({
    network: Network.LOCALHOST,
    privateKey: process.env.PRIVATE_KEY!,
    rpcUrl: 'http://localhost:8545',
  });

  // 3. Get token information
  const tokenInfo = await sdk.token.getTokenInfo();
  console.log('Token Info:', {
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    totalSupply: sdk.token.formatTokenAmount(tokenInfo.totalSupply),
    cap: sdk.token.formatTokenAmount(tokenInfo.cap),
  });

  // 4. Check balance
  const myAddress = await sdk.getAddress();
  if (myAddress) {
    const balance = await sdk.token.balanceOf(myAddress);
    console.log(`My balance: ${sdk.token.formatTokenAmount(balance)} FLUX`);
  }

  // 5. Transfer tokens
  const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const amount = sdk.token.parseTokenAmount('100'); // 100 FLUX

  console.log('Transferring 100 FLUX...');
  const tx = await sdk.token.transfer(recipient, amount);
  const receipt = await sdk.token.waitForTransaction(tx);
  console.log('Transfer successful:', receipt.hash);

  // 6. Approve spending
  const spender = sdk.getMarketplaceAddress();
  const approvalAmount = sdk.token.parseTokenAmount('1000');
  
  console.log('Approving marketplace to spend 1000 FLUX...');
  const approveTx = await sdk.token.approve(spender, approvalAmount);
  await sdk.token.waitForTransaction(approveTx);
  console.log('Approval successful');

  // 7. Check NFT balance
  const nftBalance = await sdk.gameAsset.balanceOf(myAddress!);
  console.log(`My NFT balance: ${nftBalance}`);

  // 8. Get owned NFTs
  const myNFTs = await sdk.gameAsset.getTokensOfOwner(myAddress!);
  console.log('My NFTs:', myNFTs);

  // 9. Create marketplace listing
  if (myNFTs.length > 0) {
    const tokenId = myNFTs[0];
    const price = sdk.token.parseTokenAmount('500'); // 500 FLUX
    const expiry = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24 hours

    console.log('Creating marketplace listing...');
    const listingTx = await sdk.marketplace.createListing(
      1, // AssetType.ERC721
      sdk.getGameAssetAddress(),
      tokenId,
      BigInt(1),
      price,
      sdk.getTokenAddress(),
      expiry
    );
    await sdk.marketplace.waitForTransaction(listingTx);
    console.log('Listing created successfully');
  }

  // 10. Get active listings
  const activeListings = await sdk.marketplace.getActiveListings(0, 10);
  console.log(`Active listings: ${activeListings.length}`);
  
  activeListings.forEach((listing) => {
    console.log(`Listing ${listing.listingId}:`, {
      seller: listing.seller,
      tokenId: listing.tokenId.toString(),
      price: sdk.token.formatTokenAmount(listing.price),
      status: listing.status,
    });
  });
}

// Run the example
main()
  .then(() => console.log('Example completed'))
  .catch(console.error);