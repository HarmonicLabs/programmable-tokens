// import { Address, PrivateKey, Value } from "@harmoniclabs/plu-ts";
// import { fromUtf8 } from "@harmoniclabs/uint8array-utils"
// import { registryBurnAction, registryDatum, registryInsertAction, registryPreviousAction } from "./datumsRedeemers";
// import { getTxBuilder } from "./blockfrost";
// import { BrowserWallet } from "@meshsdk/core";
// import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
// import { wallets } from "./wallets";
// import { readFile } from 'fs/promises'
// import { getAuthUtxoWithName } from "./utxos";

// // Register a token

// export async function mintFirstRegistryBuilder(blockfrost: BlockfrostPluts): Promise<string> {

//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const registry = validators.validators.registry

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const utxoIn = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const mintedValue = Value.singleAsset(
//     registry.hash,
//     aTokenPolicy,
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     // need to include prev for non-static testing or multiple entries
//     // inputs: [{ utxo }, { rutxo, registryPreviousAction }],
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
//         inline: registry.script,
//         policyId: registry.hash,
//         redeemer: registryInsertAction,
//       }
//     }],
//     outputs: [{
//       address: registry.address,
//       value: mintedValue,
//       datum: registryDatum(aTokenPolicy, '', validators.transfer.hash, validators.userState.hash, validators.global.hash),
//     },
//       // {
//       //   address: registryAddr,
//       //   value: prevValue,
//       //   datum: registryDatum(prevPolicy, tokenPolicy, transferManagerScript.hash, userPolicy, globalPolicy),
//       // }
//     ],
//     requiredSigners: [wallet.owner.pub]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }

// export async function mintOtherRegistryBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const registry = validators.validators.registry

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const prevNode = await getAuthUtxoWithName(registry.address, registry.hash, aTokenPolicy)
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const mintedValue = Value.singleAsset(
//     registry.hash,
//     bTokenPolicy,
//     1
//   )

//   const prevValue = Value.singleAsset(
//     registry.hash,
//     aTokenPolicy,
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     // need to include prev for non-static testing or multiple entries
//     inputs: [{ prevNode, registryPreviousAction }],
//     // inputs: [{ utxoIn }],
//     changeAddress: wallet.owner.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     mints: [{
//       value: mintedValue,
//       script: {
//         inline: registry.script,
//         policyId: registry.hash,
//         redeemer: registryInsertAction,
//       }
//     }],
//     outputs: [{
//       address: registry.address,
//       value: mintedValue,
//       datum: registryDatum(bTokenPolicy, '', validators.transfer.hash, validators.userState.hash, validators.global.hash),
//     },
//     {
//       address: registry.address,
//       value: prevValue,
//       datum: registryDatum(aTokenPolicy, bTokenPolicy, validators.transfer.hash, validators.userState.hash, validators.global.hash),
//     }
//     ],
//     requiredSigners: [wallet.owner.pub]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }

// // Deregister a token
// export async function burnRegistryBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const wallet = await wallets()
//   const registry = validators.validators.registry

//   const utxos = await blockfrost.addressUtxos(wallet.owner.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

//   const prevNode = await getAuthUtxoWithName(registry.address, registry.hash, aTokenPolicy)
//   const nodeUtxo = await getAuthUtxoWithName(registry.address, registry.hash, bTokenPolicy)
//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

//   const nodeValue = Value.singleAsset(
//     registry.hash,
//     bTokenPolicy,
//     -1
//   )

//   const prevValue = Value.singleAsset(
//     registry.hash,
//     aTokenPolicy,
//     1
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ prevNode, registryPreviousAction }, { nodeUtxo, registryRemoveAction }],
//     changeAddress: wallet.owner.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     mints: [{
//       value: nodeValue,
//       script: {
//         inline: registry.script,
//         policyId: registry.hash,
//         redeemer: registryBurnAction,
//       }
//     }],
//     outputs: [{
//       address: registry.address,
//       value: prevValue,
//       datum: registryDatum(aTokenPolicy, '', validators.transfer.hash, validators.userState.hash, validators.global.hash),
//     }],
//     requiredSigners: [wallet.owner.pub]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }

// // Update token Registry?