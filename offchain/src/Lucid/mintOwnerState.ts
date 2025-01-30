import { Constr, Data, getAddressDetails, toUnit } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost"
import { readFile } from 'fs/promises'

export async function mintOwnerState() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const user = validators.scripts.user

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
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

mintOwnerState()