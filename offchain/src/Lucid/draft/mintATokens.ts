import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "../blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintATestTokens() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const transfer = validators.scripts.transfer
  const aToken = validators.scripts.aToken
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const ownerTransferAddress =
    credentialToAddress(
      "Preview",
      scriptHashToCredential(transfer.hash),
      keyHashToCredential(ownerPKH)
    )

  const hash = validatorToScriptHash(aToken.script)

  const unit = toUnit(hash, fromText(''))

  const mintAction = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({ [unit]: 1000n }, mintAction)
    .attach.MintingPolicy(aToken.script)
    .pay.ToAddress(ownerTransferAddress, { [unit]: 1000n })
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintATestTokens()