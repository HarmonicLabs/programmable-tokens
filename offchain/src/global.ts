import { Address, IUTxO, Value } from "@harmoniclabs/plu-ts"
import { fromUtf8 } from "@harmoniclabs/uint8array-utils"
import { globalAddr, globalPolicy, globalStateScript } from "./scripts"
import { initGlobalDatum, globalMintAction, freezeGlobalDatum, globalBurnAction, dTrue, dFalse } from "./datumsRedeemers"
import getTxBuilder from "./blockfrost"
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts"
import { BrowserWallet } from "@meshsdk/core";

// mint global state token
export async function mintGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const mintedValue = Value.singleAsset(
    globalPolicy,
    fromUtf8(''),
    1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: mintedValue,
      script: {
        inline: globalStateScript,
        policyId: globalPolicy,
        redeemer: globalMintAction
      }
    }],
    outputs: [{
      address: globalAddr,
      value: mintedValue,
      datum: initGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// export function mintGlobalStateRunner() {
//   const assetName = toHex(Buffer.from(''))
//   const tx = txRunner
//     .addInput(
//       utxo
//     )
//     .mintAssets(
//       { globalPolicy, [{ name: , 1: }]: },
//       globalStateScript
//     )
//     .payTo(
//       globalAddr,
//       mintedValue,
//       initGlobalDatum
//     )
// }

// burn global state token
export async function burnGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxos = await blockfrost.addressUtxos(globalAddr)
  const gutxo: IUTxO = gutxos.find(gutxo => gutxo.resolved.value.)

  const mintedValue = Value.singleAsset(
    globalPolicy,
    fromUtf8(''),
    -1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { gutxo, globalBurnAction }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: mintedValue,
      script: {
        inline: globalStateScript,
        policyId: globalPolicy,
        redeemer: globalMintAction
      }
    }],
    outputs: [{
      address: globalAddr,
      value: mintedValue,
      datum: initGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// freeze global state
export async function freezeGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxos = await blockfrost.addressUtxos(globalAddr)
  const gutxo: IUTxO = gutxos.find(gutxo => gutxo.resolved.value.)

  const mintedValue = Value.singleAsset(
    globalPolicy,
    fromUtf8(''),
    -1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { gutxo, dTrue }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: globalAddr,
      value: mintedValue,
      datum: freezeGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// defrost global state
export async function defrostGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxos = await blockfrost.addressUtxos(globalAddr)
  const gutxo: IUTxO = gutxos.find(gutxo => gutxo.resolved.value.)

  const mintedValue = Value.singleAsset(
    globalPolicy,
    fromUtf8(''),
    -1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { gutxo, dFalse }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: globalAddr,
      value: mintedValue,
      datum: initGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}