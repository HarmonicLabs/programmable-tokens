import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

// TODO: Transaction incomplete and untested

export async function mintInsertRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))

  const registry = validators.scripts.registry
  const account = validators.scripts.account
  const aToken = validators.scripts.aToken
  const cToken = validators.scripts.cToken
  const aTransfer = validators.scripts.aTransfer
  const cTransfer = validators.scripts.cTransfer
  const aUser = validators.scripts.aUser
  const cUser = validators.scripts.cUser
  const aGlobal = validators.scripts.aGlobal
  const cGlobal = validators.scripts.cGlobal
  const aTokenHash = validatorToScriptHash(aToken.script)
  const cTokenHash = validatorToScriptHash(cToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const aGlobalHash = validatorToScriptHash(aGlobal.script)
  const aUserHash = validatorToScriptHash(aUser.script)
  const aTransferHash = validatorToScriptHash(aTransfer.script)
  const cGlobalHash = validatorToScriptHash(cGlobal.script)
  const cUserHash = validatorToScriptHash(cUser.script)
  const cTransferHash = validatorToScriptHash(cTransfer.script)
  const registryAddress = validatorToAddress("Preprod", registry.script)

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const prevUnit = toUnit(registryHash, aTokenHash)
  const registryIn = await lucid.utxosAtWithUnit(registryAddress, prevUnit)

  const aGlobalUnit = toUnit(aGlobalHash, aTokenHash)
  const cGlobalUnit = toUnit(cGlobalHash, cTokenHash)

  const insertAction =
    Data.to(new Constr(0, []))

  const aRegistryDatum =
    Data.to(new Constr(0, [aTokenHash, cTokenHash, aTransferHash, aUserHash, aGlobalUnit, aTokenHash]))

  const registryMintAction =
    Data.to(new Constr(0, [cTokenHash, cTransferHash, cUserHash, cGlobalUnit, cTokenHash]))

  const cRegistryDatum =
    Data.to(new Constr(0, [cTokenHash, fromText(''), cTransferHash, cUserHash, cGlobalUnit, cTokenHash]))

  const unit = toUnit(registryHash, cTokenHash)

  console.log(registryIn[0])

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .collectFrom([registryIn[0]], insertAction)
    .mintAssets({
      [unit]: 1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registryAddress, { kind: "inline", value: cRegistryDatum }, { [unit]: 1n })
    .pay.ToContract(registryAddress, { kind: "inline", value: aRegistryDatum }, { [prevUnit]: 1n })
    .attach.SpendingValidator(registry.script)
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInsertRegistry()
