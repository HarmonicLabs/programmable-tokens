import { Constr, Data, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function mintUser1State() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const aUser = validators.scripts.aUser
  const bUser = validators.scripts.bUser
  const cUser = validators.scripts.cUser

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const userPKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
  const utxo = utxos[0]

  const aHash = validatorToScriptHash(aUser.script)
  const aUnit = toUnit(aHash, userPKH)
  const aUserAddress = validatorToAddress(
    "Preprod",
    aUser.script
  )

  const bHash = validatorToScriptHash(bUser.script)
  const bUnit = toUnit(bHash, userPKH)
  const bUserAddress = validatorToAddress(
    "Preprod",
    bUser.script
  )

  const cHash = validatorToScriptHash(cUser.script)
  const cUnit = toUnit(cHash, userPKH)
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
    .addSignerKey(userPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintUser1State()