// import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
// import { fromUtf8, fromHex } from "@harmoniclabs/uint8array-utils"
// import { Address, PrivateKey, Value } from "@harmoniclabs/plu-ts";
// import { BrowserWallet } from "@meshsdk/core";
// import { getTxBuilder } from "./blockfrost";
// import { userStateDatum, userStateMintAction, userStateBlacklist, userStateKyc, userStateFreeze } from "./datumsRedeemers";
// import { getAuthUtxoWithName } from "./utxos";
// import { readFile } from 'fs/promises'
// import { wallets } from "./wallets";

// // mint user
// export async function mintUserBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const state = validators.validators.userState

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const utxoIn = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const mintedValue = Value.singleAsset(
//     state.hash,
//     fromHex(wallet.owner.pub),
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ utxoIn }],
//     changeAddress: wallet.owner.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     mints: [{
//       value: mintedValue,
//       script: {
//         inline: state.script,
//         policyId: state.policy,
//         redeemer: userStateMintAction,
//       }
//     }],
//     outputs: [{
//       address: state.address,
//       value: mintedValue,
//       datum: userStateDatum(0, 0, 0, 0),
//     }]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }

// // blacklist user
// export async function blacklistUserBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const state = validators.validators.userState

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const utxoIn = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const userTx = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.owner.pub))

//   const userAsset = Value.singleAsset(
//     state.hash,
//     fromHex(wallet.owner.pub),
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ userTx, userStateBlacklist }],
//     changeAddress: wallet.owner.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     outputs: [{
//       address: userStateAddr,
//       value: userAsset,
//       datum: userStateDatum(0, 1, 0, 0),
//     }]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }

// // kyc/whitelist user
// export async function kycUserBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const state = validators.validators.userState

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const utxoIn = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const userTx = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.owner.pub))
//   const userAsset = Value.singleAsset(
//     state.hash,
//     fromHex(wallet.owner.pub),
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ userTx, userStateKyc }],
//     changeAddress: wallet.owner.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     outputs: [{
//       address: userStateAddr,
//       value: userAsset,
//       datum: userStateDatum(0, 0, 1, 0),
//     }]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }

// // freeze user
// export async function freezeUserBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const state = validators.validators.userState

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const utxoIn = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const userTx = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.owner.pub))

//   const userAsset = Value.singleAsset(
//     state.hash,
//     fromHex(wallet.owner.pub),
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ userTx, userStateFreeze }],
//     changeAddress: wallet.owner.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     outputs: [{
//       address: userStateAddr,
//       value: userAsset,
//       datum: userStateDatum(0, 0, 0, 1),
//     }]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }