import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function sendToUser1to2() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const registry = validators.scripts.registry
  const aToken = validators.scripts.aToken
  const transfer = validators.scripts.transfer
  const user = validators.scripts.user
  const global = validators.scripts.global

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const user1PKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;

  const aTokenHash = validatorToScriptHash(aToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const globalHash = validatorToScriptHash(global.script)
  const transferHash = validatorToScriptHash(transfer.script)
  const userHash = validatorToScriptHash(user.script)

  const userAddress = validatorToAddress(
    "Preview",
    user.script
  )

  const registryAddress = validatorToAddress(
    "Preview",
    registry.script
  )

  const user1TransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transferHash),
      keyHashToCredential(user1PKH)
    )

  const utxos = await lucid.utxosAt(user1TransferAddress)
  console.log(utxos)
  const utxo = utxos[0]

  const user2PKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash

  const user2TransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transferHash),
      keyHashToCredential(user2PKH)
    )

  const unit = toUnit(aTokenHash, fromText(''))
  const registryToken = toUnit(registryHash, aTokenHash)
  const globalToken = toUnit(globalHash, fromText(''))
  const user1State = toUnit(userHash, user1PKH)
  const user2State = toUnit(userHash, user2PKH)

  const registryUtxo = await lucid.utxosAtWithUnit(registryAddress, registryToken)
  const globalUtxo = await lucid.utxosAtWithUnit(global.address, globalToken)
  const user1StateUtxo = await lucid.utxosAtWithUnit(userAddress, user1State)
  const user2StateUtxo = await lucid.utxosAtWithUnit(userAddress, user2State)

  const transferAction = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .readFrom([registryUtxo[0], globalUtxo[0], user1StateUtxo[0], user2StateUtxo[0]])
    .collectFrom([utxo], transferAction)
    .pay.ToAddress(user1TransferAddress, { [unit]: 50n })
    .pay.ToAddress(user2TransferAddress, { [unit]: 50n })
    .attach.SpendingValidator(transfer.script)
    .addSignerKey(user1PKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

sendToUser1to2()