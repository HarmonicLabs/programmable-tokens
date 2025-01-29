import { Lucid, Blockfrost, MintingPolicy, applyParamsToScript, applyDoubleCborEncoding, fromText, getAddressDetails, Constr, fromHex, Script, validatorToAddress, validatorToScriptHash, toUnit, Data } from '@lucid-evolution/lucid'
import { readFile } from 'fs/promises'

export async function globalMint() {
  const validators = JSON.parse(await readFile('../plutus.json', { encoding: "utf-8" }))
  const lucid = await Lucid(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      '',
    ),
    "Preview",
  );

  lucid.selectWallet.fromPrivateKey('')

  const ownerPKH = getAddressDetails('addr_test1vqlhvhcwaddssxnkfugwlvmk69925xjdx7nc20j2nzuc0gq43pzgq')
    .paymentCredential!.hash;

  console.log(ownerPKH)

  const utxos = await lucid.utxosAt('addr_test1vqlhvhcwaddssxnkfugwlvmk69925xjdx7nc20j2nzuc0gq43pzgq')

  const utxo = utxos[0]

  console.log(utxo)

  const oref = new Constr(0, [utxo.txHash, BigInt(utxo.outputIndex)])

  function readConfigMint(): Script {
    const validator = validators.validators[0].compiledCode;
    return {
      type: "PlutusV3",
      script: applyParamsToScript(
        validator, [oref, ownerPKH]
      ),
    };
  }

  const globalVal = readConfigMint()

  console.log(globalVal)

  const address = validatorToAddress("Preview", globalVal)
  const hash = validatorToScriptHash(globalVal)

  console.log(address)
  console.log(hash)

  const mintRedeemer = Data.to(new Constr(0, []))

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .mintAssets({
      [toUnit(hash, fromText(''))]: 1n
    }, mintRedeemer)
    .pay.ToContract(address, { kind: "inline", value: Data.to(BigInt(0)) }, { [toUnit(hash, fromText(''))]: 1n })
    .attach.MintingPolicy(globalVal)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

globalMint()