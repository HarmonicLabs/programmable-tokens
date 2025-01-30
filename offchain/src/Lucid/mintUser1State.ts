import { Constr, Data, getAddressDetails, toUnit } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost"
import { readFile } from 'fs/promises'

export async function mintUser1State() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const user = validators.scripts.user

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const ownerPKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
  const utxo = utxos[0]

  const unit = toUnit(user.hash, ownerPKH)

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
      user.address,
      { kind: "inline", value: userStateDatum },
      { [unit]: 1n }
    )
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintUser1State()