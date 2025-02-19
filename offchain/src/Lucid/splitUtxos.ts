import { getAddressDetails } from '@lucid-evolution/lucid'
import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js'

export async function splitUtxos() {
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerAddress = 'addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up'

  const utxos = await lucid.utxosAt(ownerAddress)

  const tx = await lucid
    .newTx()
    .collectFrom(utxos)
    .pay.ToAddress(ownerAddress, { lovelace: 20_000000n })
    .pay.ToAddress(ownerAddress, { lovelace: 20_000000n })
    .pay.ToAddress(ownerAddress, { lovelace: 20_000000n })
    .pay.ToAddress(ownerAddress, { lovelace: 20_000000n })
    .pay.ToAddress(ownerAddress, { lovelace: 20_000000n })
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const txSubmit = await signedTx.submit()
  console.log(txSubmit)
  return txSubmit
}

splitUtxos()
