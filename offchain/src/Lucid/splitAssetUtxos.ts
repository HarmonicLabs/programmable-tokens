import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js'
import { validatorToAddress, validatorToScriptHash, validatorToRewardAddress, credentialToAddress, scriptHashToCredential, keyHashToCredential, getAddressDetails, toUnit, Constr, Data, fromText } from '@lucid-evolution/lucid'

export async function splitAssetUtxos() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const v = validators.scripts
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const accountHash = validatorToScriptHash(v.account.script)
  const registryHash = validatorToScriptHash(v.registry.script)
  const aTokenHash = validatorToScriptHash(v.aToken.script)
  const aUserHash = validatorToScriptHash(v.aUser.script)
  const aGlobalHash = validatorToScriptHash(v.aGlobal.script)
  const aTransferManager = validatorToRewardAddress("Preprod", v.aTransfer.script)
  const registryAddress = validatorToAddress("Preprod", v.registry.script)
  const aUserAddress = validatorToAddress("Preprod", v.aUser.script)
  const aGlobalAddress = validatorToAddress("Preprod", v.aGlobal.script)

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

  const aUnit = toUnit(aTokenHash, fromText(''))
  const aRegistryToken = toUnit(registryHash, aTokenHash)
  const aGlobalToken = toUnit(aGlobalHash, aTokenHash)
  const aOwnerState = toUnit(aUserHash, ownerPKH)

  const aRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, aRegistryToken)
  console.log(`ARegistry UTxO: ${aRegistryUtxo[0].txHash}`)
  //  console.log(aRegistryUtxo)
  const aGlobalUtxo = await lucid.utxosAtWithUnit(aGlobalAddress, aGlobalToken)
  console.log(`Global UTxO: ${aGlobalUtxo[0].txHash}`)
  //  console.log(aGlobalUtxo)
  const aOwnerStateUtxo = await lucid.utxosAtWithUnit(aUserAddress, aOwnerState)
  console.log(`OwnerState UTxO: ${aOwnerStateUtxo[0].txHash}`)
  //  console.log(aOwnerStateUtxo)

  const aTransferAction = Data.to(new Constr(0, [[BigInt(1)]]))
  const aWithdrawRedeemer = Data.to(BigInt(1))
  const aUtxos = await lucid.utxosAtWithUnit(ownerTransferAddress, aUnit)
  const aUtxo = aUtxos[0]
  const tx = await lucid
    .newTx()
    .readFrom([
      aRegistryUtxo[0],
      aGlobalUtxo[0],
      aOwnerStateUtxo[0],
    ])
    .collectFrom([aUtxo], aTransferAction)
    .attach.SpendingValidator(v.account.script)
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [aUnit]: 400n })
    .withdraw(aTransferManager, 0n, aWithdrawRedeemer)
    .attach.WithdrawalValidator(v.aTransfer.script)
    .addSignerKey(ownerPKH)
    .complete()

  const ownerSign = await tx.sign.withWallet().complete()

  const submitTx = await ownerSign.submit()

  console.log(submitTx)

  return submitTx
  // return
}

splitAssetUtxos()

