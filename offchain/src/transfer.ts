import { BlockfrostPluts } from "@harmoniclabs/blockfrost-pluts";
import { fromUtf8 } from "@harmoniclabs/uint8array-utils"
import { Address, StakeHash, Credential, StakeCredentials, StakeKeyHash, Value } from "@harmoniclabs/plu-ts";
import { BrowserWallet } from "@meshsdk/core";
import getTxBuilder from "./blockfrost";
import { transferSpend, userStateBlacklist } from "./datumsRedeemers";
import { globalAddr, registryAddr, transferManagerScript, userPolicy, userStateAddr } from "./scripts";

// spend tokens
export async function spendTransferBuilder(wallet: BrowserWallet, blockfrost: BlockfrostPluts, recipient: Address): Promise<string> {

  const changeAdd = Address.fromString(
    await wallet.getChangeAddress()
  )

  const utxos = await blockfrost.addressUtxos(changeAdd)
    .catch(e => { throw new Error("unable to find utxos at " + changeAdd) });

  const utxo = utxos.find(utxo => utxo.resolved.value.lovelaces >= 5_000_000)!;
  // v-- TODO --v
  const senderStateToken = (userPolicy.changeAdd.hash, 1)
  const recipientStateToken = (userPolicy.recipientAddr.hash, 1)
  // v-- TODO --v
  const regUtxos = await blockfrost.addressUtxos(registryAddr)
  const globUtxos = await blockfrost.addressUtxos(globalAddr)
  const stateUtxos = await blockfrost.addressUtxos(userStateAddr)
  // v-- TODO --v
  const userTransferAddr = new Address(
    "testnet",
    Credential.script(transferManagerScript.hash),
    new StakeCredentials("stakeKey", changeAdd.paymentCreds.hash)
  )

  const recipientAddr = new Address(
    "testnet",
    Credential.script(transferManagerScript.hash),
    new StakeCredentials("stakeKey", changeAdd.paymentCreds.hash)
  )

  const outTokenValue = Value.singleAsset(
    tokenPolicy,
    fromUtf8(''),
    100
  )

  const sendValue = Value.singleAsset(
    tokenPolicy,
    fromUtf8(''),
    100
  )

  const txBuilder = await getTxBuilder(blockfrost)

  const unsignedTx = txBuilder.buildSync({
    inputs: [{ utxo }, { inutxo, transferSpend }],
    changeAddress: changeAdd,
    collaterals: [utxo],
    collateralReturn: {
      address: utxo.resolved.address,
      value: Value.sub(utxo.resolved.value, Value.lovelaces(5_000_000))
    },
    outputs: [{
      address: userTransferAddr,
      value: outTokenValue,
    },
    {
      address: recipientAddr,
      value: sendValue,
    }],
    readonlyRefInputs: [registryUtxo, senderStateUtxo, recipientStateUtxo, globalStateUtxo]
  })

  const txStr = await wallet.signTx(unsignedTx.toCbor().toString());

  return await blockfrost.submitTx(txStr)
}