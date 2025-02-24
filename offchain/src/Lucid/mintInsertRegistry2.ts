import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

// TODO: Transaction incomplete and untested

export async function mintInsertRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))

  const registry = validators.scripts.registry
  const account = validators.scripts.account
  const bToken = validators.scripts.bToken
  const cToken = validators.scripts.cToken
  const bTransfer = validators.scripts.bTransfer
  const cTransfer = validators.scripts.cTransfer
  const bUser = validators.scripts.bUser
  const cUser = validators.scripts.cUser
  const bGlobal = validators.scripts.bGlobal
  const cGlobal = validators.scripts.cGlobal
  const bTokenHash = validatorToScriptHash(bToken.script)
  const cTokenHash = validatorToScriptHash(cToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const bGlobalHash = validatorToScriptHash(bGlobal.script)
  const bUserHash = validatorToScriptHash(bUser.script)
  const bTransferHash = validatorToScriptHash(bTransfer.script)
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

  const prevUnit = toUnit(registryHash, cTokenHash)
  const registryIn = await lucid.utxosAtWithUnit(registryAddress, prevUnit)

  const bGlobalUnit = toUnit(bGlobalHash, bTokenHash)
  const cGlobalUnit = toUnit(cGlobalHash, cTokenHash)

  const insertAction =
    Data.to(new Constr(0, []))

  const cRegistryDatum =
    Data.to(new Constr(0, [cTokenHash, bTokenHash, cTransferHash, cUserHash, cGlobalUnit, cTokenHash]))

  const registryMintAction =
    Data.to(new Constr(0, [bTokenHash, bTransferHash, bUserHash, bGlobalUnit, bTokenHash]))

  const bRegistryDatum =
    Data.to(new Constr(0, [bTokenHash, fromText(''), bTransferHash, bUserHash, bGlobalUnit, bTokenHash]))

  const unit = toUnit(registryHash, bTokenHash)

  console.log(registryIn[0])

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .collectFrom([registryIn[0]], insertAction)
    .mintAssets({
      [unit]: 1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registryAddress, { kind: "inline", value: bRegistryDatum }, { [unit]: 1n })
    .pay.ToContract(registryAddress, { kind: "inline", value: cRegistryDatum }, { [prevUnit]: 1n })
    .attach.SpendingValidator(registry.script)
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInsertRegistry()
