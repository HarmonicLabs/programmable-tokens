import { Address, Application, compileUPLC, DataB, IUTxO, parseUPLC, PrivateKey, Script, ScriptType, TxOutRef, UPLCConst, UPLCProgram, Value } from "@harmoniclabs/plu-ts"
import { fromHex, fromUtf8 } from "@harmoniclabs/uint8array-utils"
import { initGlobalDatum, globalMintAction, freezeGlobalDatum, globalBurnAction, dTrue, dFalse } from "./datumsRedeemers"
import { getTxBuilder } from "./blockfrost"
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts"
import { Constr, UPLCTerm } from "@harmoniclabs/uplc"
import { readFile } from 'fs/promises'
import { BrowserWallet } from "@meshsdk/core";
import { wallets } from './wallets'
import { getAuthUtxoWithName } from "./utxos"

// mint global state token
export async function mintGlobalStateBuilder(blockfrost: BlockfrostPluts): Promise<string> {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const wallet = await wallets()
  const global = validators.validators.global

  const changeAdd = wallet.owner.address

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxoIn = utxos.find(utxo => utxo.utxoRef == validators.bootOref)!;
  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

  const mintedValue = Value.singleAsset(
    global.hash,
    fromUtf8(''),
    1
  )

  const mintScript = {
    inline: global.script,
    policyId: global.hash,
    redeemer: globalMintAction
  }

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo: utxoIn }],
    changeAddress: changeAdd,
    collaterals: [collateralUtxo],
    collateralReturn: {
      address: collateralUtxo.resolved.address,
      value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: mintedValue,
      script: mintScript,
    }],
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: initGlobalDatum,
    }],
    requiredSigners: [wallet.owner.pub]
  })

  unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

  const submitTx = await blockfrost.submitTx(unsignedTx)
  console.log(submitTx)

  return submitTx
}

// burn global state token
export async function burnGlobalStateBuilder(blockfrost: BlockfrostPluts): Promise<string> {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const wallet = await wallets()
  const global = validators.validators.global

  const changeAdd = wallet.owner.address

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxo = await getAuthUtxoWithName(global.address, global.hash, fromUtf8(''))

  const mintedValue = Value.singleAsset(
    global.hash,
    fromUtf8(''),
    1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [
      {
        utxo: gutxo,
        inputScript: {
          script: global.script,
          datum: "inline",
          redeemer: globalBurnAction
        }
      }
    ],
    changeAddress: changeAdd,
    collaterals: [collateralUtxo],
    collateralReturn: {
      address: collateralUtxo.resolved.address,
      value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: mintedValue,
      script: {
        inline: global.script,
        policyId: global.policy,
        redeemer: globalMintAction
      }
    }],
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: initGlobalDatum,
    }],
    requiredSigners: [wallet.owner.pub]
  })

  unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

  const submitTx = await blockfrost.submitTx(unsignedTx)
  console.log(submitTx)

  return submitTx
}

// freeze global state
export async function freezeGlobalStateBuilder(blockfrost: BlockfrostPluts): Promise<string> {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const wallet = await wallets()
  const global = validators.validators.global

  const changeAdd = wallet.owner.address

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxo = await getAuthUtxoWithName(global.address, global.hash, fromUtf8(''))

  const mintedValue = Value.singleAsset(
    global.hash,
    fromUtf8(''),
    -1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [
      {
        utxo: gutxo,
        inputScript: {
          script: global.script,
          datum: "inline",
          redeemer: dTrue
        }
      }
    ],
    changeAddress: changeAdd,
    collaterals: [collateralUtxo],
    collateralReturn: {
      address: collateralUtxo.resolved.address,
      value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: freezeGlobalDatum,
    }],
    requiredSigners: [wallet.owner.pub]
  })

  unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

  const submitTx = await blockfrost.submitTx(unsignedTx)
  console.log(submitTx)

  return submitTx
}

// defrost global state
export async function defrostGlobalStateBuilder(blockfrost: BlockfrostPluts): Promise<string> {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const wallet = await wallets()
  const global = validators.validators.global

  const changeAdd = wallet.owner.address

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxo = await getAuthUtxoWithName(global.address, global.hash, fromUtf8(''))

  const mintedValue = Value.singleAsset(
    global.hash,
    fromUtf8(''),
    -1
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [
      {
        utxo: gutxo,
        inputScript: {
          script: global.script,
          datum: "inline",
          redeemer: dFalse
        }
      }
    ],
    changeAddress: changeAdd,
    collaterals: [collateralUtxo],
    collateralReturn: {
      address: collateralUtxo.resolved.address,
      value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: initGlobalDatum,
    }],
    requiredSigners: [wallet.owner.pub]
  })

  unsignedTx.signWith(new PrivateKey(wallet.owner.priv))

  const submitTx = await blockfrost.submitTx(unsignedTx)
  console.log(submitTx)

  return submitTx
}