import { Address, PrivateKey, StakeCredentials, StakeKeyHash, Credential, Script, TxBuilder, Value, StakeCredentialsType, Hash, Hash28, UTxO, ScriptType } from "@harmoniclabs/plu-ts";
import { globalMintAction, initGlobalDatum, userStateDatum, userStateMintAction } from "./datumsRedeemers.js";
import { readFile } from 'fs/promises'
import { wallets } from "./wallets.js";
import { blockfrost, getTxBuilder } from "./blockfrost.js";
import { fromHex, fromUtf8 } from "@harmoniclabs/uint8array-utils";
import { makeValidators } from "./scripts.js";

export async function mintTestSupply() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const wallet = await wallets()

  const global = validators.validators.global
  const aToken = validators.validators.aToken
  const user = validators.validators.userState
  const transfer = validators.validators.transfer

  const globalScript = new Script(ScriptType.PlutusV3, global.script)
  const aTokenScript = new Script(ScriptType.PlutusV3, aToken.script)
  const userScript = new Script(ScriptType.PlutusV3, user.script)
  const transferScript = transfer.script

  const utxos = await blockfrost.addressUtxos(wallet.owner.address)
    .catch(e => { throw new Error("unable to find utxos at " + wallet.owner.address) });

  const utxoIn = utxos[0]//.find(utxo => utxo.utxoRef === validators.bootOref)!;
  console.log(utxoIn.utxoRef.id.toString())
  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000 && utxo != utxoIn)!;

  const aTokenValue = Value.singleAsset(
    new Hash28(aToken.hash),
    fromUtf8(''),
    200
  )

  const aMintScript = {
    inline: aTokenScript,
    policyId: new Hash28(aToken.hash),
    redeemer: globalMintAction
  }

  const ownerTransferAddress = new Address(
    "testnet",
    Credential.script(transfer.hash),
    StakeCredentials.keyHash(wallet.owner.pub)
  )

  const globalValue = Value.singleAsset(
    new Hash28(global.hash),
    fromUtf8(''),
    1
  )

  const gMintScript = {
    inline: globalScript,
    policyId: new Hash28(global.hash),
    redeemer: globalMintAction
  }

  const userValue = Value.singleAsset(
    new Hash28(user.hash),
    fromHex(wallet.owner.pub.toString()),
    1
  )

  const uMintScript = {
    inline: userScript,
    policyId: new Hash28(user.hash),
    redeemer: userStateMintAction
  }

  const minUtxo = Value.lovelaces(2_000_000)

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo: utxoIn }],
    changeAddress: wallet.owner.address,
    collaterals: [collateralUtxo],
    collateralReturn: {
      address: collateralUtxo.resolved.address,
      value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
    },
    mints: [{
      value: globalValue,
      script: gMintScript,
      // },
      // {
      //   value: userValue,
      //   script: uMintScript,
      // },
      // {
      //   value: aTokenValue,
      //   script: aMintScript,
    }],
    outputs: [{
      address: global.address,
      value: Value.add(minUtxo, globalValue),
      datum: initGlobalDatum,
      // },
      // {
      //   address: user.address,
      //   value: Value.add(minUtxo, userValue),
      //   datum: userStateDatum(0, 0, 0, 0),
      // },
      // {
      //   address: ownerTransferAddress,
      //   value: Value.add(minUtxo, aTokenValue),
    }],
    requiredSigners: [wallet.owner.pub]
  })

  unsignedTx.signWith(wallet.owner.priv)

  const submitTx = await blockfrost.submitTx(unsignedTx)
  console.log(`Transaction Submitted: ${submitTx}`)

  console.log(`Minted 200 Test Tokens: 
    Policy: ${aToken.hash}
  `
  )

  return submitTx
}

mintTestSupply()
