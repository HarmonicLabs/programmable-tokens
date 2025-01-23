

// Register a token

import { Address, Value } from "@harmoniclabs/plu-ts";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils"
import { registryBurnAction, registryDatum, registryInsertAction, registryPreviousAction } from "./datumsRedeemers";
import { globalPolicy, registryAddr, registryPolicy, tokenRegistryScript, transferManagerScript, userManagerScript, userPolicy } from "./scripts";
import getTxBuilder from "./blockfrost";
import { BrowserWallet } from "@meshsdk/core";
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";

export async function mintRegistryBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const mintedValue = Value.singleAsset(
    registryPolicy,
    tokenPolicy,
    1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { rutxo, registryPreviousAction }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: mintedValue,
      script: {
        inline: tokenRegistryScript,
        policyId: registryPolicy,
        redeemer: registryInsertAction,
      }
    }],
    outputs: [{
      address: registryAddr,
      value: mintedValue,
      datum: registryDatum(tokenPolicy, fromUtf8(''), transferManagerScript.hash, userPolicy, globalPolicy),
    },
    {
      address: registryAddr,
      value: prevValue,
      datum: registryDatum(prevPolicy, tokenPolicy, transferManagerScript.hash, userPolicy, globalPolicy),
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// Deregister a token
export async function burnRegistryBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const mintedValue = Value.singleAsset(
    registryPolicy,
    tokenPolicy,
    -1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { prevNodeUtxo, registryPreviousAction }, { nodeUtxo, registryRemoveAction }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: mintedValue,
      script: {
        inline: tokenRegistryScript,
        policyId: registryPolicy,
        redeemer: registryBurnAction,
      }
    }],
    outputs: [{
      address: registryAddr,
      value: prevValue,
      datum: registryDatum(prevPolicy, fromUtf8(''), transferManagerScript.hash, userPolicy, globalPolicy),
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// Update token Registry?