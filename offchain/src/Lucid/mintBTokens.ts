import { Constr, credentialToAddress, Data, fromHex, fromText, getAddressDetails, keyHashToCredential, scriptHashToCredential, toUnit, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintATestTokens() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const account = validatorToScriptHash(validators.scripts.account.script)
  const bToken = validators.scripts.bToken
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const user1PKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
  const utxo = utxos[0]

  const ownerTransferAddress =
    credentialToAddress(
      "Preprod",
      scriptHashToCredential(account),
      keyHashToCredential(user1PKH)
    )

  const hash = validatorToScriptHash(bToken.script)

  const unit = toUnit(hash, fromText(''))

  const mintAction = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({ [unit]: 1000n }, mintAction)
    .attach.MintingPolicy(bToken.script)
    .pay.ToAddress(ownerTransferAddress, { [unit]: 1000n })
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintATestTokens()