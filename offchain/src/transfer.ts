// import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
// import { fromHex, fromUtf8 } from "@harmoniclabs/uint8array-utils"
// import { Address, StakeHash, Credential, StakeCredentials, StakeKeyHash, Value, PrivateKey, Hash28 } from "@harmoniclabs/plu-ts";
// import { BrowserWallet, WalletStaticMethods } from "@meshsdk/core";
// import { getTxBuilder } from "./blockfrost";
// import { transferSpend, userStateBlacklist } from "./datumsRedeemers";
// import { getAuthUtxoWithName } from "./utxos";
// import { wallets } from "./wallets";
// import { readFile } from 'fs/promises'

// // spend tokens
// export async function spendTransferBuilder(blockfrost: BlockfrostPluts): Promise<string> {
//   const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
//   const state = validators.validators.userState
//   const registry = validators.validators.registry
//   const global = validators.validators.global
//   const transfer = validators.validators.transfer
//   const aToken = validators.validators.aToken
//   const wallet = await wallets()

//   const utxos = await blockfrost.addressUtxos(wallet.user1.address)
//     .catch(e => { throw new Error("unable to find utxos at " + wallet.user1.address) });

//   const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
//   const senderStateUtxo = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.user1.pub.toString()))
//   const recipientStateUtxo = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.user2.pub.toString()))
//   const regUtxo = await getAuthUtxoWithName(registry.address, registry.hash, fromHex(bTokenPolicy))
//   const globUtxo = await getAuthUtxoWithName(global.address, global.hash, fromUtf8(''))

//   const userTransferAddress = new Address(
//     "testnet",
//     Credential.script(transfer.hash),
//     StakeCredentials.keyHash(wallet.user1.pub)
//   )

//   const inutxo = await blockfrost.addressUtxos(userTransferAddress)

//   const recipientAddress = new Address(
//     "testnet",
//     Credential.script(transfer.hash),
//     StakeCredentials.keyHash(wallet.user2.pub)
//   )

//   const outTokenValue = Value.singleAsset(
//     new Hash28(aToken.hash),
//     fromUtf8(''),
//     100
//   )

//   const sendValue = Value.singleAsset(
//     new Hash28(aToken.hash),
//     fromUtf8(''),
//     100
//   )

//   const txBuilder = await getTxBuilder(blockfrost)

//   const unsignedTx = txBuilder.buildSync({
//     inputs: [{ inutxo, transferSpend }],
//     changeAddress: wallet.user1.address,
//     collaterals: [collateralUtxo],
//     collateralReturn: {
//       address: collateralUtxo.resolved.address,
//       value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
//     },
//     outputs: [{
//       address: userTransferAddress,
//       value: outTokenValue,
//     },
//     {
//       address: recipientAddress,
//       value: sendValue,
//     }],
//     readonlyRefInputs: [regUtxo, senderStateUtxo, recipientStateUtxo, globUtxo]
//   })

//   unsignedTx.signWith(new PrivateKey(wallet.user1.priv))

//   const submitTx = await blockfrost.submitTx(unsignedTx)
//   console.log(submitTx)

//   return submitTx
// }