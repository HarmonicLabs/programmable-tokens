import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

// TODO: Transaction incomplete and untested

export async function mintInsertRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))

  const registry = validators.scripts.registry
  const account = validators.scripts.account
  const aToken = validators.scripts.aToken
  const bToken = validators.scripts.bToken
  const aTransfer = validators.scripts.aTransfer
  const bTransfer = validators.scripts.bTransfer
  const aUser = validators.scripts.aUser
  const bUser = validators.scripts.bUser
  const aGlobal = validators.scripts.aGlobal
  const bGlobal = validators.scripts.bGlobal
  const aTokenHash = validatorToScriptHash(aToken.script)
  console.log(aTokenHash)
  const bTokenHash = validatorToScriptHash(bToken.script)
  console.log(bTokenHash)
  const registryHash = validatorToScriptHash(registry.script)
  const aGlobalHash = validatorToScriptHash(aGlobal.script)
  const aUserHash = validatorToScriptHash(aUser.script)
  const aTransferHash = validatorToScriptHash(aTransfer.script)
  const bGlobalHash = validatorToScriptHash(bGlobal.script)
  const bUserHash = validatorToScriptHash(bUser.script)
  const bTransferHash = validatorToScriptHash(bTransfer.script)
  const registryAddress = validatorToAddress("Preprod", registry.script)

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const prevUnit = toUnit(registryHash, bTokenHash)
  const registryIn = await lucid.utxosAtWithUnit(registryAddress, prevUnit)

  const burnAction =
    Data.to(new Constr(1, []))

  const prevAction =
    Data.to(new Constr(2, []))

  const bRegistryDatum =
    Data.to(new Constr(0, [bTokenHash, fromText(''), bTransferHash, bUserHash, bGlobalHash, bTokenHash]))

  const registryMintAction =
    Data.to(new Constr(1, []))

  const unit = toUnit(registryHash, aTokenHash)
  const registryBurn = await lucid.utxosAtWithUnit(registryAddress, unit)

  console.log(registryIn[0])
  console.log(registryBurn[0])

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .collectFrom([registryIn[0]], prevAction)
    .collectFrom([registryBurn[0]], burnAction)
    .mintAssets({
      [unit]: -1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registryAddress, { kind: "inline", value: bRegistryDatum }, { [prevUnit]: 1n })
    .attach.SpendingValidator(registry.script)
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInsertRegistry()