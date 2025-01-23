import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { fromUtf8, fromHex } from "@harmoniclabs/uint8array-utils"
import { Address, Value } from "@harmoniclabs/plu-ts";
import { BrowserWallet } from "@meshsdk/core";
import getTxBuilder from "./blockfrost";
import { userStateDatum, userStateMintAction, userStateBlacklist, userStateKyc, userStateFreeze } from "./datumsRedeemers";
import { userPolicy, userManagerScript, userStateAddr } from "./scripts";

// mint user
export async function mintUserBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const mintedValue = Value.singleAsset(
    userPolicy,
    fromHex(changeAdd.paymentCreds.toString()),
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
        inline: userManagerScript,
        policyId: userPolicy,
        redeemer: userStateMintAction,
      }
    }],
    outputs: [{
      address: userStateAddr,
      value: mintedValue,
      datum: userStateDatum(0, 0, 0, 0),
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// blacklist user
export async function blacklistUserBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const userAsset = Value.singleAsset(
    userPolicy,
    fromHex(changeAdd.paymentCreds.toString()),
    1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { usertx, userStateBlacklist }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: userStateAddr,
      value: userAsset,
      datum: userStateDatum(0, 1, 0, 0),
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// kyc/whitelist user
export async function kycUserBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const userAsset = Value.singleAsset(
    userPolicy,
    fromHex(changeAdd.paymentCreds.toString()),
    1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { usertx, userStateKyc }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: userStateAddr,
      value: userAsset,
      datum: userStateDatum(0, 0, 1, 0),
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// freeze user
export async function freezeUserBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const userAsset = Value.singleAsset(
    userPolicy,
    fromHex(changeAdd.paymentCreds.toString()),
    1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { usertx, userStateFreeze }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: userStateAddr,
      value: userAsset,
      datum: userStateDatum(0, 0, 0, 1),
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}