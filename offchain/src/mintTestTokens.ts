// import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
// import { fromUtf8 } from "@harmoniclabs/uint8array-utils";
// import { Address, Value } from "@harmoniclabs/plu-ts";
// import { BrowserWallet } from "@meshsdk/core";
// import getTxBuilder from "./blockfrost";

// // mint global state token
// export async function mintGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

//   const changeAdd = Address.fromString(
//     await wallet.getChangeAddress()
//   )

//   const utxos = await blockfrost.addressUtxos(changeAdd)
//     .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

//   const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

//   const aMintedValue = Value.singleAsset(
//     aTokenPolicy,
//     fromUtf8(''),
//     1000000
//   )

//   const bMintedValue = Value.singleAsset(
//     bTokenPolicy,
//     fromUtf8(''),
//     1000000
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ utxo }],
//     changeAddress: changeAdd,
//     collaterals: [utxo],
//     collateralReturn: {
//       address: utxo.resolved.address,
//       value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     mints: [{
//       value: aMintedValue,
//       script: {
//         inline: aTokenScript,
//         policyId: aTokenPolicy,
//         redeemer: mintAction
//       }
//     },
//     {
//       value: bMintedValue,
//       script: {
//         inline: bTokenScript,
//         policyId: bTokenPolicy,
//         redeemer: mintAction
//       }
//     }],
//     outputs: [{
//       address: changeAdd,
//       value: aMintedValue,
//     },
//     {
//       address: changeAdd,
//       value: bMintedValue,
//     }]
//   })

//   const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

//   return await blockfrost.submitTx(txStr)
// }