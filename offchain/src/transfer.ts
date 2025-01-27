import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { fromHex, fromUtf8 } from "@harmoniclabs/uint8array-utils"
import { Address, StakeHash, Credential, StakeCredentials, StakeKeyHash, Value, PrivateKey } from "@harmoniclabs/plu-ts";
import { BrowserWallet, WalletStaticMethods } from "@meshsdk/core";
import { getTxBuilder } from "./blockfrost";
import { transferSpend, userStateBlacklist } from "./datumsRedeemers";
import { getAuthUtxoWithName } from "./utxos";
import { wallets } from "./wallets";
import { readFile } from 'fs/promises'

// spend tokens
export async function spendTransferBuilder(blockfrost: BlockfrostPluts): Promise<string> {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const state = validators.validators.userState
  const registry = validators.validators.registry
  const global = validators.validators.global
  const transfer = validators.validators.transfer
  const wallet = await wallets()

  const utxos = await blockfrost.addressUtxos(wallet.user1.address)
    .catch(e => { throw new Error("unable to find utxos at " + wallet.user1.address) });

  const collateralUtxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
  // v-- TODO --v
  const senderStateUtxo = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.user1.pub))
  const recipientStateUtxo = await getAuthUtxoWithName(state.address, state.hash, fromHex(wallet.user2.pub))
  // v-- TODO --v
  const regUtxo = await getAuthUtxoWithName(registry.address, registry.hash, fromHex(bTokenPolicy))
  const globUtxo = await getAuthUtxoWithName(global.address, global.hash, fromUtf8(''))
  // v-- TODO --v
  const userTransferAddr = new Address(
    "testnet",
    Credential.script(transfer.hash),
    new StakeCredentials("stakeKey", wallet.user1.pub)
  )

  const inutxo = await getAuthUtxoWithName(userTransferAddress)

  const recipientAddr = new Address(
    "testnet",
    Credential.script(transferManagerScript.hash),
    new StakeCredentials("stakeKey", wallet.user2.pub)
  )

  const outTokenValue = Value.singleAsset(
    bTokenPolicy,
    fromUtf8(''),
    100
  )

  const sendValue = Value.singleAsset(
    bTokenPolicy,
    fromUtf8(''),
    100
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ inutxo, transferSpend }],
    changeAddress: wallet.user1.address,
    collaterals: [collateralUtxo],
    collateralReturn: {
      address: collateralUtxo.resolved.address,
      value: Value.sub(collateralUtxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: userTransferAddr,
      value: outTokenValue,
    },
    {
      address: recipientAddr,
      value: sendValue,
    }],
    readonlyRefInputs: [regUtxo, senderStateUtxo, recipientStateUtxo, globUtxo]
  })

  unsignedTx.signWith(new PrivateKey(wallet.user1.priv))

  const submitTx = await blockfrost.submitTx(unsignedTx)
  console.log(submitTx)

  return submitTx
}