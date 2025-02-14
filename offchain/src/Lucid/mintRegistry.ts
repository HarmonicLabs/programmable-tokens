import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintInitRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const registry = validators.scripts.registry
  const cToken = validators.scripts.cToken
  const transfer = validators.scripts.cTransfer
  const user = validators.scripts.cUser
  const global = validators.scripts.cGlobal
  const cTokenHash = validatorToScriptHash(cToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const globalHash = validatorToScriptHash(global.script)
  const userHash = validatorToScriptHash(user.script)
  const transferHash = validatorToScriptHash(transfer.script)
  const registryAddress = validatorToAddress("Preprod", registry.script)

  const thirdPartyHash = cTokenHash

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const registryMintAction =
    Data.to(new Constr(0, [cTokenHash, transferHash, userHash, globalHash, thirdPartyHash]))

  const registryDatum =
    Data.to(new Constr(0, [cTokenHash, fromText(''), transferHash, userHash, globalHash, thirdPartyHash]))

  const unit = toUnit(registryHash, cTokenHash)

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