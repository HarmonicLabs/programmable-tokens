import { Lucid, Blockfrost, mintingPolicyToId, MintingPolicy, applyParamsToScript, applyDoubleCborEncoding, fromText, getAddressDetails, Constr, fromHex, Script, validatorToAddress, validatorToScriptHash, toUnit, Data } from '@lucid-evolution/lucid'
import { readFile } from 'fs/promises'
import { blockfrost } from './blockfrost.js';

export async function globalMint() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))
  const lucid = await blockfrost()

  const global = validators.scripts.cGlobal
  const globalCS = mintingPolicyToId(global.script)
  const globalAddress = validatorToAddress("Preprod", global.script)
  const cTokenPolicy = mintingPolicyToId(validators.scripts.cToken.script)

  lucid.selectWallet.fromPrivateKey('ed25519_sk1m6s42600gmng6r5lhw79rthd579k68tw7rgra9uyk2qhnudrfrjqge87pr')

  const user2PKH = getAddressDetails('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vph88mwyh3uf38t4tzedtq9gvszxax4lqnq7wacxjh8uawg3wunka')
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
      [toUnit(globalCS, cTokenPolicy)]: 1n
    }, mintRedeemer)
    .pay.ToContract(globalAddress, { kind: "inline", value: Data.to(BigInt(0)) }, { [toUnit(globalCS, cTokenPolicy)]: 1n })
    .attach.MintingPolicy(global.script)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

globalMint()