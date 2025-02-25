import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit, validatorToAddress, validatorToRewardAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function allSendToAll() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const v = validators.scripts
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const accountHash = validatorToScriptHash(v.account.script)
  const registryHash = validatorToScriptHash(v.registry.script)
  const aTokenHash = validatorToScriptHash(v.aToken.script)
  const bTokenHash = validatorToScriptHash(v.bToken.script)
  const aUserHash = validatorToScriptHash(v.aUser.script)
  const bUserHash = validatorToScriptHash(v.bUser.script)
  const aGlobalHash = validatorToScriptHash(v.aGlobal.script)
  const bGlobalHash = validatorToScriptHash(v.bGlobal.script)

  const aTransferManager = validatorToRewardAddress("Preprod", v.aTransfer.script)
  const bTransferManager = validatorToRewardAddress("Preprod", v.bTransfer.script)

  const registryAddress = validatorToAddress("Preprod", v.registry.script)
  const aUserAddress = validatorToAddress("Preprod", v.aUser.script)
  const bUserAddress = validatorToAddress("Preprod", v.bUser.script)
  const aGlobalAddress = validatorToAddress("Preprod", v.aGlobal.script)
  const bGlobalAddress = validatorToAddress("Preprod", v.bGlobal.script)

  const ownerTransferAddress =
    credentialToAddress(
      "Preprod",
      scriptHashToCredential(accountHash),
      keyHashToCredential(ownerPKH)
    )

  const utxos = await lucid.utxosAt(ownerTransferAddress)
  console.log(utxos)
  const utxo = utxos[0]
  console.log(utxo)

  const user1PKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash

  const user1TransferAddress =
    credentialToAddress(
      "Preprod",
      scriptHashToCredential(accountHash),
      keyHashToCredential(user1PKH)
    )

  const aUnit = toUnit(aTokenHash, fromText(''))
  const bUnit = toUnit(bTokenHash, fromText(''))
  const aRegistryToken = toUnit(registryHash, aTokenHash)
  const aGlobalToken = toUnit(aGlobalHash, aTokenHash)
  const aOwnerState = toUnit(aUserHash, ownerPKH)
  const aUser1State = toUnit(aUserHash, user1PKH)
  const bRegistryToken = toUnit(registryHash, bTokenHash)
  const bGlobalToken = toUnit(bGlobalHash, bTokenHash)
  const bOwnerState = toUnit(bUserHash, ownerPKH)
  const bUser1State = toUnit(bUserHash, user1PKH)

  const aRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, aRegistryToken)
  console.log(`ARegistry UTxO: ${aRegistryUtxo[0].txHash}`)
  //  console.log(aRegistryUtxo)
  const aGlobalUtxo = await lucid.utxosAtWithUnit(aGlobalAddress, aGlobalToken)
  console.log(`Global UTxO: ${aGlobalUtxo[0].txHash}`)
  //  console.log(aGlobalUtxo)
  const aOwnerStateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aOwnerState)
  console.log(`OwnerState UTxO: ${aOwnerStateUtxo[0].txHash}`)
  //  console.log(aOwnerStateUtxo)
  const aUser1StateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aUser1State)
  console.log(`User1State UTxO: ${aUser1StateUtxo[0].txHash}`)
  //  console.log(aUser1StateUtxo)
  const bRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, bRegistryToken)
  console.log(`BRegistry UTxO: ${bRegistryUtxo[0].txHash}`)
  //  console.log(bRegistryUtxo)
  const bGlobalUtxo = await lucid.utxosAtWithUnit(bGlobalAddress, bGlobalToken)
  console.log(`Global UTxO: ${bGlobalUtxo[0].txHash}`)
  //  console.log(bGlobalUtxo)
  const bOwnerStateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bOwnerState)
  console.log(`OwnerState UTxO: ${bOwnerStateUtxo[0].txHash}`)
  //  console.log(bOwnerStateUtxo)
  const bUser1StateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bUser1State)
  console.log(`User1State UTxO: ${bUser1StateUtxo[0].txHash}`)
  //  console.log(bUser1StateUtxo)

  const aTransferAction = Data.to(new Constr(0, [[BigInt(6)]]))
  const bTransferAction = Data.to(new Constr(0, [[BigInt(7)]]))

  const aWithdrawRedeemer = Data.to(BigInt(6))
  const bWithdrawRedeemer = Data.to(BigInt(7))

  const aUtxos = await lucid.utxosAtWithUnit(ownerTransferAddress, aUnit)
  console.log(aUtxos)
  const bUtxos = await lucid.utxosAtWithUnit(user1TransferAddress, bUnit)
  console.log(bUtxos)
  const ownerUtxo = aUtxos[2]
  const user1Utxo = bUtxos[0]

  const tx = await lucid
    .newTx()
    .readFrom([
      aRegistryUtxo[0],
      aGlobalUtxo[0],
      aOwnerStateUtxo[0],
      aUser1StateUtxo[0],
      bRegistryUtxo[0],
      bGlobalUtxo[0],
      bOwnerStateUtxo[0],
      bUser1StateUtxo[0],
    ])
    .collectFrom([ownerUtxo], aTransferAction)
    .collectFrom([user1Utxo], bTransferAction)
    .attach.SpendingValidator(v.account.script)
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 500n, [bUnit]: 100n })
    .pay.ToAddress(user1TransferAddress, { [aUnit]: 100n })
    .withdraw(aTransferManager, 0n, aWithdrawRedeemer)
    .withdraw(bTransferManager, 0n, bWithdrawRedeemer)
    .attach.WithdrawalValidator(v.aTransfer.script)
    .attach.WithdrawalValidator(v.bTransfer.script)
    .addSignerKey(ownerPKH)
    .addSignerKey(user1PKH)
    .complete()

  const ownerSign = await tx.partialSign.withWallet()
  const user1Sign = await tx.partialSign.withPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const assembledTx = await tx.assemble([ownerSign, user1Sign]).complete();

  const submitTx = await assembledTx.submit()

  console.log(submitTx)

  return submitTx
  // return
}

allSendToAll()
