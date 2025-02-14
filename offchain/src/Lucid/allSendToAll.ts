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
  const cTokenHash = validatorToScriptHash(v.cToken.script)
  const aUserHash = validatorToScriptHash(v.aUser.script)
  const bUserHash = validatorToScriptHash(v.bUser.script)
  const cUserHash = validatorToScriptHash(v.cUser.script)
  const aGlobalHash = validatorToScriptHash(v.aGlobal.script)
  const bGlobalHash = validatorToScriptHash(v.bGlobal.script)
  const cGlobalHash = validatorToScriptHash(v.cGlobal.script)

  const aTransferManager = validatorToRewardAddress("Preprod", v.aTransfer.script)
  const bTransferManager = validatorToRewardAddress("Preprod", v.bTransfer.script)
  const cTransferManager = validatorToRewardAddress("Preprod", v.cTransfer.script)

  const registryAddress = validatorToAddress("Preprod", v.registry.script)
  const aUserAddress = validatorToAddress("Preprod", v.aUser.script)
  const bUserAddress = validatorToAddress("Preprod", v.bUser.script)
  const cUserAddress = validatorToAddress("Preprod", v.cUser.script)
  const aGlobalAddress = validatorToAddress("Preprod", v.aGlobal.script)
  const bGlobalAddress = validatorToAddress("Preprod", v.bGlobal.script)
  const cGlobalAddress = validatorToAddress("Preprod", v.cGlobal.script)

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

  const user2PKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash

  const user2TransferAddress =
    credentialToAddress(
      "Preprod",
      scriptHashToCredential(accountHash),
      keyHashToCredential(user2PKH)
    )

  const aUnit = toUnit(aTokenHash, fromText(''))
  const bUnit = toUnit(bTokenHash, fromText(''))
  const cUnit = toUnit(cTokenHash, fromText(''))
  const aRegistryToken = toUnit(registryHash, aTokenHash)
  const aGlobalToken = toUnit(aGlobalHash, aTokenHash)
  const aOwnerState = toUnit(aUserHash, ownerPKH)
  const aUser1State = toUnit(aUserHash, user1PKH)
  const aUser2State = toUnit(aUserHash, user2PKH)
  const bRegistryToken = toUnit(registryHash, bTokenHash)
  const bGlobalToken = toUnit(bGlobalHash, bTokenHash)
  const bOwnerState = toUnit(bUserHash, ownerPKH)
  const bUser1State = toUnit(bUserHash, user1PKH)
  const bUser2State = toUnit(bUserHash, user2PKH)
  const cRegistryToken = toUnit(registryHash, cTokenHash)
  const cGlobalToken = toUnit(cGlobalHash, cTokenHash)
  const cOwnerState = toUnit(cUserHash, ownerPKH)
  const cUser1State = toUnit(cUserHash, user1PKH)
  const cUser2State = toUnit(cUserHash, user2PKH)

  const aRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, aRegistryToken)
  console.log(`ARegistry UTxO: ${aRegistryUtxo}`)
  console.log(aRegistryUtxo)
  const aGlobalUtxo = await lucid.utxosAtWithUnit(aGlobalAddress, aGlobalToken)
  console.log(`Global UTxO: ${aGlobalUtxo}`)
  console.log(aGlobalUtxo)
  const aOwnerStateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aOwnerState)
  console.log(`OwnerState UTxO: ${aOwnerStateUtxo}`)
  console.log(aOwnerStateUtxo)
  const aUser1StateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aUser1State)
  console.log(`User1State UTxO: ${aUser1StateUtxo}`)
  console.log(aUser1StateUtxo)
  const aUser2StateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aUser2State)
  console.log(`User2State UTxO: ${aUser2StateUtxo}`)
  console.log(aUser2StateUtxo)
  const bRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, bRegistryToken)
  console.log(`BRegistry UTxO: ${bRegistryUtxo}`)
  console.log(bRegistryUtxo)
  const bGlobalUtxo = await lucid.utxosAtWithUnit(bGlobalAddress, bGlobalToken)
  console.log(`Global UTxO: ${bGlobalUtxo}`)
  console.log(bGlobalUtxo)
  const bOwnerStateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bOwnerState)
  console.log(`OwnerState UTxO: `)
  console.log(bOwnerStateUtxo)
  const bUser1StateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bUser1State)
  console.log(`User1State UTxO: ${bUser1StateUtxo}`)
  console.log(bUser1StateUtxo)
  const bUser2StateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bUser2State)
  console.log(`User2State UTxO: ${bUser2StateUtxo}`)
  console.log(bUser2StateUtxo)
  const cRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, cRegistryToken)
  console.log(`CRegistry UTxO: ${cRegistryUtxo}`)
  console.log(cRegistryUtxo)
  const cGlobalUtxo = await lucid.utxosAtWithUnit(cGlobalAddress, cGlobalToken)
  console.log(`Global UTxO: ${cGlobalUtxo}`)
  console.log(cGlobalUtxo)
  const cOwnerStateUtxo = await lucid.utxosAtWithUnit(cUserAddress, cOwnerState)
  console.log(`OwnerState UTxO: ${cOwnerStateUtxo}`)
  console.log(cOwnerStateUtxo)
  const cUser1StateUtxo = await lucid.utxosAtWithUnit(cUserAddress, cUser1State)
  console.log(`User1State UTxO: ${cUser1StateUtxo}`)
  console.log(cUser1StateUtxo)
  const cUser2StateUtxo = await lucid.utxosAtWithUnit(cUserAddress, cUser2State)
  console.log(`User2State UTxO: ${cUser2StateUtxo}`)
  console.log(cUser2StateUtxo)

  const aTransferAction = Data.to(new Constr(0, [[BigInt(5)]]))
  const bTransferAction = Data.to(new Constr(0, [[BigInt(6)]]))
  const cTransferAction = Data.to(new Constr(0, [[BigInt(3)]]))
  const aWithdrawRedeemer = Data.to(BigInt(5))
  const bWithdrawRedeemer = Data.to(BigInt(6))
  const cWithdrawRedeemer = Data.to(BigInt(3))

  const aUtxos = await lucid.utxosAtWithUnit(ownerTransferAddress, aUnit)
  const bUtxos = await lucid.utxosAtWithUnit(user1TransferAddress, bUnit)
  const cUtxos = await lucid.utxosAtWithUnit(user2TransferAddress, cUnit)

  const aUtxo = aUtxos[0]
  const bUtxo = bUtxos[0]
  const cUtxo = cUtxos[0]

  const tx = await lucid
    .newTx()
    .readFrom([
      aRegistryUtxo[0],
      aGlobalUtxo[0],
      aOwnerStateUtxo[0],
      aUser1StateUtxo[0],
      aUser2StateUtxo[0],
      bRegistryUtxo[0],
      bGlobalUtxo[0],
      bOwnerStateUtxo[0],
      bUser1StateUtxo[0],
      bUser2StateUtxo[0],
      cRegistryUtxo[0],
      cGlobalUtxo[0],
      cOwnerStateUtxo[0],
      cUser1StateUtxo[0],
      cUser2StateUtxo[0]
    ])
    .collectFrom([aUtxo], aTransferAction)
    .collectFrom([bUtxo], bTransferAction)
    .collectFrom([cUtxo], cTransferAction)
    .attach.SpendingValidator(v.account.script)
    .pay.ToAddress(user1TransferAddress, { [aUnit]: 100n })
    .pay.ToAddress(user2TransferAddress, { [aUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 800n })
    .pay.ToAddress(user1TransferAddress, { [bUnit]: 800n })
    .pay.ToAddress(user2TransferAddress, { [bUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [bUnit]: 100n })
    .pay.ToAddress(user1TransferAddress, { [cUnit]: 100n })
    .pay.ToAddress(user2TransferAddress, { [cUnit]: 800n })
    .pay.ToAddress(ownerTransferAddress, { [cUnit]: 100n })
    .withdraw(aTransferManager, 0n, aWithdrawRedeemer)
    .withdraw(bTransferManager, 0n, bWithdrawRedeemer)
    .withdraw(cTransferManager, 0n, cWithdrawRedeemer)
    .attach.WithdrawalValidator(v.aTransfer.script)
    .attach.WithdrawalValidator(v.bTransfer.script)
    .attach.WithdrawalValidator(v.cTransfer.script)
    .addSignerKey(ownerPKH)
    .addSignerKey(user1PKH)
    .addSignerKey(user2PKH)
    .complete()

  const ownerSign = await tx.partialSign.withWallet()
  const user1Sign = await tx.partialSign.withPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')
  const user2Sign = await tx.partialSign.withPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const assembledTx = await tx.assemble([ownerSign, user1Sign, user2Sign]).complete();

  const submitTx = await assembledTx.submit()

  console.log(submitTx)

  return submitTx
}

allSendToAll()