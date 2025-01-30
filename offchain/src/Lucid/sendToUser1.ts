import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost"
import { readFile } from 'fs/promises'

export async function sendToUser1() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const registry = validators.scripts.registry
  const aToken = validators.scripts.aToken
  const transfer = validators.scripts.transfer
  const user = validators.scripts.user
  const global = validators.scripts.global

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const ownerTransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transfer.hash),
      keyHashToCredential(ownerPKH)
    )

  const utxos = await lucid.utxosAt(ownerTransferAddress)
  console.log(utxos)

  const userPKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash

  const userTransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transfer.hash),
      keyHashToCredential(userPKH)
    )

  const unit = toUnit(aToken.hash, fromText(''))
  const registryToken = toUnit(registry.hash, aToken.hash)
  const globalToken = toUnit(global.hash, fromText(''))
  const ownerState = toUnit(user.hash, ownerPKH)
  const userState = toUnit(user.hash, userPKH)

  const registryUtxo = await lucid.utxosAtWithUnit(registry.address, registryToken)
  const globalUtxo = await lucid.utxosAtWithUnit(global.address, globalToken)
  const ownerStateUtxo = await lucid.utxosAtWithUnit(user.address, ownerState)
  const userStateUtxo = await lucid.utxosAtWithUnit(user.address, userState)

  const tx = await lucid
    .newTx()
    .readFrom([registryUtxo[0], globalUtxo[0], ownerStateUtxo[0], userStateUtxo[0]])
    .collectFrom(utxos)
    .pay.ToAddress(userTransferAddress, { [unit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [unit]: 900n })
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

sendToUser1()