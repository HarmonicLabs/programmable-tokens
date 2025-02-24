import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js'
import { validatorToAddress, validatorToScriptHash, validatorToRewardAddress, credentialToAddress, scriptHashToCredential, keyHashToCredential, getAddressDetails, toUnit, Constr, Data, fromText } from '@lucid-evolution/lucid'

export async function splitAssetUtxos() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const v = validators.scripts
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const ownerPKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const accountHash = validatorToScriptHash(v.account.script)
  const registryHash = validatorToScriptHash(v.registry.script)
  const cTokenHash = validatorToScriptHash(v.cToken.script)
  console.log(cTokenHash)
  const cUserHash = validatorToScriptHash(v.cUser.script)
  const cGlobalHash = validatorToScriptHash(v.cGlobal.script)
  const cTransferManager = validatorToRewardAddress("Preprod", v.cTransfer.script)
  const registryAddress = validatorToAddress("Preprod", v.registry.script)
  const cUserAddress = validatorToAddress("Preprod", v.cUser.script)
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

  const cUnit = toUnit(cTokenHash, fromText(''))
  const cRegistryToken = toUnit(registryHash, cTokenHash)
  const cGlobalToken = toUnit(cGlobalHash, cTokenHash)
  const cOwnerState = toUnit(cUserHash, ownerPKH)

  const cRegistryUtxo = await lucid.utxosAtWithUnit(registryAddress, cRegistryToken)
  console.log(`ARegistry UTxO: ${cRegistryUtxo[0].txHash}`)
  console.log(cRegistryUtxo)
  const cGlobalUtxo = await lucid.utxosAtWithUnit(cGlobalAddress, cGlobalToken)
  console.log(`Global UTxO: ${cGlobalUtxo[0].txHash}`)
  console.log(cGlobalUtxo)
  const cOwnerStateUtxo = await lucid.utxosAtWithUnit(cUserAddress, cOwnerState)
  console.log(`OwnerState UTxO: ${cOwnerStateUtxo[0].txHash}`)
  console.log(cOwnerStateUtxo)

  const cTransferAction = Data.to(new Constr(0, [[BigInt(2)]]))
  const cWithdrawRedeemer = Data.to(BigInt(2))
  const cUtxos = await lucid.utxosAtWithUnit(ownerTransferAddress, cUnit)
  const cUtxo = cUtxos[0]
  console.log(cUtxo)

  const tx = await lucid
    .newTx()
    .readFrom([
      cRegistryUtxo[0],
      cGlobalUtxo[0],
      cOwnerStateUtxo[0],
    ])
    .collectFrom([cUtxo], cTransferAction)
    .attach.SpendingValidator(v.account.script)
    .pay.ToAddress(ownerTransferAddress, { [cUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [cUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [cUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [cUnit]: 100n })
    .pay.ToAddress(ownerTransferAddress, { [cUnit]: 600n })
    .withdraw(cTransferManager, 0n, cWithdrawRedeemer)
    .attach.WithdrawalValidator(v.cTransfer.script)
    .addSignerKey(ownerPKH)
    .complete()

  const ownerSign = await tx.sign.withWallet().complete()

  const submitTx = await ownerSign.submit()

  console.log(submitTx)

  return submitTx
  // return
}

splitAssetUtxos()

