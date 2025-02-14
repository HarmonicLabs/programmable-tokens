import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "./blockfrost.js"
import { readFile } from 'fs/promises'

// TODO: Transaction incomplete and untested

export async function mintInsertRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))

  const registry = validators.scripts.registry
  const account = validators.scripts.account
  const cToken = validators.scripts.cToken
  const bToken = validators.scripts.bToken
  const cTransfer = validators.scripts.cTransfer
  const bTransfer = validators.scripts.bTransfer
  const cUser = validators.scripts.cUser
  const bUser = validators.scripts.bUser
  const cGlobal = validators.scripts.cGlobal
  const bGlobal = validators.scripts.bGlobal
  const cTokenHash = validatorToScriptHash(cToken.script)
  const bTokenHash = validatorToScriptHash(bToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const cGlobalHash = validatorToScriptHash(cGlobal.script)
  const cUserHash = validatorToScriptHash(cUser.script)
  const cTransferHash = validatorToScriptHash(cTransfer.script)
  const bGlobalHash = validatorToScriptHash(bGlobal.script)
  const bUserHash = validatorToScriptHash(bUser.script)
  const bTransferHash = validatorToScriptHash(bTransfer.script)
  const registryAddress = validatorToAddress("Preprod", registry.script)

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  // const DatumSchema = Data.Object({
  //   policy: Data.Bytes(),
  //   next: Data.Bytes(),
  //   transfer: Data.Bytes(),
  //   user: Data.Bytes(),
  //   global: Data.Bytes(),
  //   third: Data.Bytes(),
  // });
  // type DatumType = Data.Static<typeof DatumSchema>;
  // const DatumType = DatumSchema as unknown as DatumType;

  const prevUnit = toUnit(registryHash, cTokenHash)
  const registryIn = await lucid.utxosAtWithUnit(registryAddress, prevUnit)
  // const inDatum = Data.from(registryIn[0].datum!, DatumType);
  // const inTokenHash = inDatum.policy
  // console.log(inDatum)
  // console.log(inTokenHash)

  const insertAction =
    Data.to(new Constr(0, []))

  const cRegistryDatum =
    Data.to(new Constr(0, [cTokenHash, bTokenHash, cTransferHash, cUserHash, cGlobalHash, cTokenHash]))

  const registryMintAction =
    Data.to(new Constr(0, [bTokenHash, bTransferHash, bUserHash, bGlobalHash, bTokenHash]))

  const bRegistryDatum =
    Data.to(new Constr(0, [bTokenHash, fromText(''), bTransferHash, bUserHash, bGlobalHash, bTokenHash]))

  const unit = toUnit(registryHash, bTokenHash)

  console.log(registryIn[0])

  const tx = await lucid
    .newTx()
    // .collectFrom([utxo])
    .collectFrom([registryIn[0]], insertAction)
    .mintAssets({
      [unit]: 1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registryAddress, { kind: "inline", value: bRegistryDatum }, { [unit]: 1n })
    .pay.ToContract(registryAddress, { kind: "inline", value: cRegistryDatum }, { [prevUnit]: 1n })
    .attach.SpendingValidator(registry.script)
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInsertRegistry()