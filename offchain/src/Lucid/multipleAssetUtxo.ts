import { blockfrost } from './blockfrost.js'
import { readFile } from 'fs/promises'
import { validatorToAddress, fromText, validatorToScriptHash, validatorToRewardAddress, credentialToAddress, scriptHashToCredential, keyHashToCredential, getAddressDetails, toUnit, Data, Constr } from '@lucid-evolution/lucid'

export async function multiAssetUtxos() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const v = validators.scripts
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

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
  const aRegistryToken = toUnit(registryHash, aTokenHash)
  const aGlobalToken = toUnit(aGlobalHash, aTokenHash)
  const aUser1State = toUnit(aUserHash, user1PKH)
  const aUser2State = toUnit(aUserHash, user2PKH)
  const bRegistryToken = toUnit(registryHash, bTokenHash)
  const bGlobalToken = toUnit(bGlobalHash, bTokenHash)
  const bUser1State = toUnit(bUserHash, user1PKH)
  const bUser2State = toUnit(bUserHash, user2PKH)

  const aRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, aRegistryToken)
  console.log(`ARegistry UTxO: ${aRegistryUtxo[0].txHash}`)
  //  console.log(aRegistryUtxo)
  const aGlobalUtxo = await lucid.utxosAtWithUnit(aGlobalAddress, aGlobalToken)
  console.log(`Global UTxO: ${aGlobalUtxo[0].txHash}`)
  //  console.log(aGlobalUtxo)
  const aUser1StateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aUser1State)
  console.log(`User1State UTxO: ${aUser1StateUtxo[0].txHash}`)
  //  console.log(aUser1StateUtxo)
  const aUser2StateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aUser2State)
  console.log(`User2State UTxO: ${aUser2StateUtxo[0].txHash}`)
  //  console.log(aUser2StateUtxo)
  const bRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, bRegistryToken)
  console.log(`BRegistry UTxO: ${bRegistryUtxo[0].txHash}`)
  //  console.log(bRegistryUtxo)
  const bGlobalUtxo = await lucid.utxosAtWithUnit(bGlobalAddress, bGlobalToken)
  console.log(`Global UTxO: ${bGlobalUtxo[0].txHash}`)
  //  console.log(bGlobalUtxo)
  const bUser1StateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bUser1State)
  console.log(`User1State UTxO: ${bUser1StateUtxo[0].txHash}`)
  //  console.log(bUser1StateUtxo)
  const bUser2StateUtxo = await lucid.utxosAtWithUnit(bUserAddress, bUser2State)
  console.log(`User2State UTxO: ${bUser2StateUtxo[0].txHash}`)
  //  console.log(bUser2StateUtxo)

  const aTransferAction = Data.to(new Constr(0, [[BigInt(10)]]))
  const bTransferAction = Data.to(new Constr(0, [[BigInt(0)]]))
  const aWithdrawRedeemer = Data.to(BigInt(10))
  const bWithdrawRedeemer = Data.to(BigInt(0))

  const aUtxos = await lucid.utxosAtWithUnit(user2TransferAddress, aUnit)
  const bUtxos = await lucid.utxosAtWithUnit(user1TransferAddress, bUnit)

  const aUtxo = aUtxos[0]
  const bUtxo = bUtxos[0]

  const tx = await lucid
    .newTx()
    .readFrom([
      aRegistryUtxo[0],
      aGlobalUtxo[0],
      aUser1StateUtxo[0],
      //      aUser2StateUtxo[0],
      bRegistryUtxo[0],
      bGlobalUtxo[0],
      //      bUser1StateUtxo[0],
      bUser2StateUtxo[0]
    ])
    .collectFrom([aUtxo], aTransferAction)
    .collectFrom([bUtxo], bTransferAction)
    .pay.ToAddress(user1TransferAddress, { [aUnit]: 50n, [bUnit]: 50n })
    .pay.ToAddress(user2TransferAddress, { [aUnit]: 50n, [bUnit]: 50n })
    .attach.SpendingValidator(v.aTransfer.script)
    .attach.SpendingValidator(v.bTransfer.script)
    .withdraw(aTransferManager, 0n, aWithdrawRedeemer)
    .withdraw(bTransferManager, 0n, bWithdrawRedeemer)
    .attach.WithdrawalValidator(v.aTransfer.script)
    .attach.WithdrawalValidator(v.bTransfer.script)
    .addSignerKey(user1PKH)
    .addSignerKey(user2PKH)
    .complete()

  const user1Sign = await tx.partialSign.withWallet()
  const user2Sign = await tx.partialSign.withPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const assembledTx = await tx.assemble([user1Sign, user2Sign]).complete();

  const submitTx = await assembledTx.submit()
}

