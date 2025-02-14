import { Lucid, Blockfrost, mintingPolicyToId, MintingPolicy, applyParamsToScript, applyDoubleCborEncoding, fromText, getAddressDetails, Constr, fromHex, Script, validatorToAddress, validatorToScriptHash, toUnit, Data } from '@lucid-evolution/lucid'
import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js';

export async function globalMint() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const lucid = await blockfrost()

  const global = validators.scripts.bGlobal
  const globalCS = mintingPolicyToId(global.script)
  const globalAddress = validatorToAddress("Preprod", global.script)
  const bTokenPolicy = mintingPolicyToId(validators.scripts.bToken.script)

  lucid.selectWallet.fromPrivateKey('ed25519_sk1nehhqvw0563xkrdv5vasmkt2jw0gaxnm72mr6qadhp7htq8czl3swrf9mu')

  const user1PKH = getAddressDetails('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
    .paymentCredential!.hash;

  console.log(user1PKH)

  const utxos = await lucid.utxosAt('addr_test1vzrpepre3t5k05w6plk4z9tc0c4yjlsqqfk8pn7uwdhzl5ge8g32s')
  const utxo = utxos[0]
  // const id = utxo.txHash
  // console.log(`
  //   Save this assetName for Global ${id}
  //   `)
  console.log(utxo)

  const mintRedeemer = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [toUnit(globalCS, bTokenPolicy)]: 1n
    }, mintRedeemer)
    .pay.ToContract(globalAddress, { kind: "inline", value: Data.to(BigInt(0)) }, { [toUnit(globalCS, bTokenPolicy)]: 1n })
    .attach.MintingPolicy(global.script)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

globalMint()