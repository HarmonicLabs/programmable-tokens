import { Constr, Data, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintUser2State() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const aUser = validators.scripts.aUser
  const bUser = validators.scripts.bUser
  const cUser = validators.scripts.cUser

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const ownerPKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
  const utxo = utxos[0]

  const aHash = validatorToScriptHash(aUser.script)
  const aUnit = toUnit(aHash, ownerPKH)
  const aUserAddress = validatorToAddress(
    "Preprod",
    aUser.script
  )

  const bHash = validatorToScriptHash(bUser.script)
  const bUnit = toUnit(bHash, ownerPKH)
  const bUserAddress = validatorToAddress(
    "Preprod",
    bUser.script
  )

  const cHash = validatorToScriptHash(cUser.script)
  const cUnit = toUnit(cHash, ownerPKH)
  const cUserAddress = validatorToAddress(
    "Preprod",
    cUser.script
  )

  const userStateMintAction = Data.to(new Constr(0, []))
  const userStateDatum = Data.to(new Constr(0, [0n, 0n, 0n, 0n]))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [aUnit]: 1n
    }, userStateMintAction)
    .mintAssets({
      [bUnit]: 1n
    }, userStateMintAction)
    .mintAssets({
      [cUnit]: 1n
    }, userStateMintAction)
    .attach.MintingPolicy(aUser.script)
    .pay.ToContract(
      aUserAddress,
      { kind: "inline", value: userStateDatum },
      { [aUnit]: 1n }
    )
    .attach.MintingPolicy(bUser.script)
    .pay.ToContract(
      bUserAddress,
      { kind: "inline", value: userStateDatum },
      { [bUnit]: 1n }
    )
    .attach.MintingPolicy(cUser.script)
    .pay.ToContract(
      cUserAddress,
      { kind: "inline", value: userStateDatum },
      { [cUnit]: 1n }
    )
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintUser2State()