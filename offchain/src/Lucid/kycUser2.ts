import { Constr, Data, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function blacklistUser() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const user = validators.scripts.user

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const userPKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const hash = validatorToScriptHash(user.script)
  const unit = toUnit(hash, userPKH)
  const userAddress = validatorToAddress(
    "Preview",
    user.script
  )

  const utxos = await lucid.utxosAtWithUnit(userAddress, unit)
  const utxo = utxos[0]

  const userStateBlacklistAction = Data.to(new Constr(1, []))
  const userStateDatum = Data.to(new Constr(0, [0n, 1n, 0n, 0n]))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .attach.SpendingValidator(user.script)
    .pay.ToContract(
      userAddress,
      { kind: "inline", value: userStateDatum },
      { [unit]: 1n }
    )
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}