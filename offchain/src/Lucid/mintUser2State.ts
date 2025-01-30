import { Constr, Data, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintUser2State() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const user = validators.scripts.user

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const ownerPKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
  const utxo = utxos[0]

  const hash = validatorToScriptHash(user.script)
  const unit = toUnit(hash, ownerPKH)
  const userAddress = validatorToAddress(
    "Preview",
    user.script
  )

  const userStateMintAction = Data.to(new Constr(0, []))
  const userStateDatum = Data.to(new Constr(0, [0n, 0n, 0n, 0n]))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [unit]: 1n
    }, userStateMintAction)
    .attach.MintingPolicy(user.script)
    .pay.ToContract(
      userAddress,
      { kind: "inline", value: userStateDatum },
      { [unit]: 1n }
    )
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintUser2State()