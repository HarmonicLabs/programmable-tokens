import { getAddressDetails, validatorToAddress, validatorToRewardAddress } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

export async function registerStake() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const transfer = validators.scripts.transfer
  const thirdParty = validators.scripts.thirdParty
  const transferAddr = validatorToRewardAddress("Preprod", transfer.script)
  console.log(`transferRewardAddress: ${transferAddr}`)
  const thirdPartyAddr = validatorToRewardAddress("Preprod", thirdParty.script)
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const tx = await lucid
    .newTx()
    // transferAddr | thirdPartyAddr
    .registerStake(transferAddr)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

registerStake()