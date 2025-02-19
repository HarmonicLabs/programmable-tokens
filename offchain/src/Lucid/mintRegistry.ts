import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintInitRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const registry = validators.scripts.registry
  const bToken = validators.scripts.bToken
  const transfer = validators.scripts.bTransfer
  const user = validators.scripts.bUser
  const global = validators.scripts.bGlobal
  const bTokenHash = validatorToScriptHash(bToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const globalHash = validatorToScriptHash(global.script)
  const userHash = validatorToScriptHash(user.script)
  const transferHash = validatorToScriptHash(transfer.script)
  const registryAddress = validatorToAddress("Preprod", registry.script)

  const thirdPartyHash = bTokenHash

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const globalUnit = toUnit(globalHash, bTokenHash)

  const registryMintAction =
    Data.to(new Constr(0, [bTokenHash, transferHash, userHash, globalUnit, thirdPartyHash]))

  const registryDatum =
    Data.to(new Constr(0, [bTokenHash, fromText(''), transferHash, userHash, globalUnit, thirdPartyHash]))

  const unit = toUnit(registryHash, bTokenHash)

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [unit]: 1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registryAddress, { kind: "inline", value: registryDatum }, { [unit]: 1n })
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInitRegistry()
