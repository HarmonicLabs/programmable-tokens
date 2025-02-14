import { Lucid, Blockfrost, mintingPolicyToId, MintingPolicy, applyParamsToScript, applyDoubleCborEncoding, fromText, getAddressDetails, Constr, fromHex, Script, validatorToAddress, validatorToScriptHash, toUnit, Data } from '@lucid-evolution/lucid'
import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js';

export async function globalMint() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const lucid = await blockfrost()

  const global = validators.scripts.aGlobal
  const globalCS = mintingPolicyToId(global.script)
  const globalAddress = validatorToAddress("Preprod", global.script)
  const aTokenPolicy = mintingPolicyToId(validators.scripts.aToken.script)

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
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
      [toUnit(globalCS, aTokenPolicy)]: 1n
    }, mintRedeemer)
    .pay.ToContract(globalAddress, { kind: "inline", value: Data.to(BigInt(0)) }, { [toUnit(globalCS, aTokenPolicy)]: 1n })
    .attach.MintingPolicy(global.script)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

globalMint()