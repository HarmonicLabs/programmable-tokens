import { Lucid, Blockfrost, MintingPolicy, applyParamsToScript, applyDoubleCborEncoding, fromText, getAddressDetails, Constr, fromHex, Script, validatorToAddress, validatorToScriptHash, toUnit, Data } from '@lucid-evolution/lucid'
import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js';

export async function globalMint() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const global = validators.scripts.global
  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  console.log(ownerPKH)

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  console.log(utxo)

  const mintRedeemer = Data.to(new Constr(0, []))

  const hash = validatorToScriptHash(global.script)

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [toUnit(hash, fromText(''))]: 1n
    }, mintRedeemer)
    .pay.ToContract(global.address, { kind: "inline", value: Data.to(BigInt(0)) }, { [toUnit(hash, fromText(''))]: 1n })
    .attach.MintingPolicy(global.script)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

globalMint()