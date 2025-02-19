import { Constr, Data, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function kycUser() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const bUser = validators.scripts.bUser

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const user1PKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;

  const user2PKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const hash = validatorToScriptHash(bUser.script)
  const ownerUnit = toUnit(hash, ownerPKH)
  const user1Unit = toUnit(hash, user1PKH)
  const user2Unit = toUnit(hash, user2PKH)
  const userAddress = validatorToAddress(
    "Preprod",
    bUser.script
  )

  const utxos0 = await lucid.utxosAtWithUnit(userAddress, ownerUnit)
  const utxo0 = utxos0[0]
  const utxos1 = await lucid.utxosAtWithUnit(userAddress, user1Unit)
  const utxo1 = utxos1[0]
  const utxos2 = await lucid.utxosAtWithUnit(userAddress, user2Unit)
  const utxo2 = utxos2[0]

  const userStateKycAction = Data.to(new Constr(1, []))
  const userStateDatum = Data.to(new Constr(0, [0n, 1n, 0n, 0n]))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo0], userStateKycAction)
    .collectFrom([utxo1], userStateKycAction)
    .collectFrom([utxo2], userStateKycAction)
    .attach.SpendingValidator(bUser.script)
    .pay.ToContract(
      userAddress,
      { kind: "inline", value: userStateDatum },
      { [ownerUnit]: 1n }
    )
    .pay.ToContract(
      userAddress,
      { kind: "inline", value: userStateDatum },
      { [user1Unit]: 1n }
    )
    .pay.ToContract(
      userAddress,
      { kind: "inline", value: userStateDatum },
      { [user2Unit]: 1n }
    )
    .addSignerKey(user1PKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

kycUser()