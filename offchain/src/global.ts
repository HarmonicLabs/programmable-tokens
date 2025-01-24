import { Address, Application, compileUPLC, DataB, IUTxO, parseUPLC, Script, ScriptType, TxOutRef, UPLCConst, UPLCProgram, Value } from "@harmoniclabs/plu-ts"
import { fromHex, fromUtf8 } from "@harmoniclabs/uint8array-utils"
import { initGlobalDatum, globalMintAction, freezeGlobalDatum, globalBurnAction, dTrue, dFalse } from "./datumsRedeemers"
import getTxBuilder from "./blockfrost"
import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts"
import { Constr, UPLCTerm } from "@harmoniclabs/uplc"
import { BrowserWallet } from "@meshsdk/core";
import validators from '../validators'

// mint global state token
export async function mintGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {
  const global = validators.validators.global

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxoIn = utxos.find(utxo => utxo.utxoRef == validators.bootOref)!;
  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

  const mintedValue = Value.singleAsset(
    global.hash,
    fromUtf8(''),
    1
  )

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
      script: {
        inline: global.script,
        policyId: global.hash,
        redeemer: globalMintAction
      }
    }],
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: initGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// burn global state token
export async function burnGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {
  const global = validators.validators.global

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxos: IUTxO[] = await blockfrost.addressUtxos(global.address)
  const gutxo: IUTxO = gutxos[0]

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
          redeemer: globalBurnAction
        }
      }
    ],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
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
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// freeze global state
export async function freezeGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {
  const global = validators.validators.global

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxos = await blockfrost.addressUtxos(global.address)
  const gutxo: IUTxO = gutxos[0]

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
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: freezeGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}

// defrost global state
export async function defrostGlobalStateBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts): Promise<string> {
  const global = validators.validators.global

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;

  const gutxos = await blockfrost.addressUtxos(global.address)
  const gutxo: IUTxO = gutxos[0]

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
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: global.address,
      value: mintedValue,
      datum: initGlobalDatum,
    }]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}