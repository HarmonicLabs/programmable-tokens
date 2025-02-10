import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "../blockfrost.js"
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

  const ownerTransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transfer.hash),
      keyHashToCredential(ownerPKH)
    )

  const utxos = await lucid.utxosAt(ownerTransferAddress)
  console.log(utxos)
  const utxo = utxos[0]

  const userPKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash

  const userTransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transferHash),
      keyHashToCredential(userPKH)
    )

  const unit = toUnit(aTokenHash, fromText(''))
  const registryToken = toUnit(registryHash, aTokenHash)
  const globalToken = toUnit(globalHash, fromText(''))
  const ownerState = toUnit(userHash, ownerPKH)
  const userState = toUnit(userHash, userPKH)

  const registryUtxo = await lucid.utxosAtWithUnit(registryAddress, registryToken)
  console.log(registryUtxo[0])
  const globalUtxo = await lucid.utxosAtWithUnit(global.address, globalToken)
  console.log(globalUtxo[0])
  const ownerStateUtxo = await lucid.utxosAtWithUnit(userAddress, ownerState)
  console.log(ownerStateUtxo[0])
  const userStateUtxo = await lucid.utxosAtWithUnit(userAddress, userState)
  console.log(userStateUtxo[0])

  const transferAction = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .readFrom([registryUtxo[0], globalUtxo[0], ownerStateUtxo[0], userStateUtxo[0]])
    .collectFrom([utxo], transferAction)
    .pay.ToAddress(userTransferAddress, { [unit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [unit]: 900n })
    .attach.SpendingValidator(transfer.script)
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

sendToUser1()