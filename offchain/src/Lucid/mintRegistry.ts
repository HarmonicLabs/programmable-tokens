import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost"
import { readFile } from 'fs/promises'

export async function mintInitRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const registry = validators.scripts.registry
  const aToken = validators.scripts.aToken
  const transfer = validators.scripts.transfer
  const user = validators.scripts.user
  const global = validators.scripts.global

  const lucid = await blockfrost()


  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const registryMintAction =
    Data.to(new Constr(0, [aToken.hash, fromText(''), transfer.hash, user.hash, global.hash]))

  const registryDatum =
    Data.to(new Constr(0, [aToken.hash, fromText(''), transfer.hash, user.hash, global.hash]))

  const unit = toUnit(registry.hash, aToken.hash)

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [unit]: 1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registry.address, { kind: "inline", value: registryDatum }, { [unit]: 1n })
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInitRegistry()