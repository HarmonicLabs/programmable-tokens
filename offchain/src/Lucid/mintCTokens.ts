import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintATestTokens() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const lucid = await blockfrost()
  const account = validatorToScriptHash(validators.scripts.account.script)
  const cToken = validators.scripts.cToken

  lucid.selectWallet.fromPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const user2PKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
  const utxo = utxos[0]

  const ownerTransferAddress =
    credentialToAddress(
      "Preprod",
      scriptHashToCredential(account),
      keyHashToCredential(user2PKH)
    )

  const hash = validatorToScriptHash(cToken.script)

  const unit = toUnit(hash, fromText(''))

  const mintAction = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({ [unit]: 1000n }, mintAction)
    .attach.MintingPolicy(cToken.script)
    .pay.ToAddress(ownerTransferAddress, { [unit]: 1000n })
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintATestTokens()