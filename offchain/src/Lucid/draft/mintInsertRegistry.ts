import { Constr, Data, fromHex, fromText, getAddressDetails, toUnit, validatorToAddress, validatorToScriptHash } from "@lucid-evolution/lucid"
import { blockfrost } from "../blockfrost.js"
import { readFile } from 'fs/promises'

// TODO: Transaction incomplete and untested

export async function mintInsertRegistry() {
  const validators = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))

  const registry = validators.scripts.registry
  const aToken = validators.scripts.aToken
  const bToken = validators.scripts.bToken
  const transfer = validators.scripts.transfer
  const user = validators.scripts.user
  const global = validators.scripts.global
  const aTokenHash = validatorToScriptHash(aToken.script)
  const bTokenHash = validatorToScriptHash(bToken.script)
  const registryHash = validatorToScriptHash(registry.script)
  const globalHash = validatorToScriptHash(global.script)
  const userHash = validatorToScriptHash(user.script)
  const transferHash = validatorToScriptHash(transfer.script)
  const registryAddress = validatorToAddress("Preview", registry.script)

  const lucid = await blockfrost()

  lucid.selectWallet.fromPrivateKey('ed25519_sk16pq9yuhe4vxq3raxqh3jkngdrep9lm85qkpfjeradelrecs8mvlq6w4wjf')

  const ownerPKH = getAddressDetails('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
    .paymentCredential!.hash;

  const utxos = await lucid.utxosAt('addr_test1vpygkhec6ghfqvac76uy972rqjwplccv3rvna9qfy43tlqs57l3up')
  const utxo = utxos[0]

  const DatumSchema = Data.Object({
    policy: Data.Bytes(),
    prev: Data.Bytes(),
    transfer: Data.Bytes(),
    user: Data.Bytes(),
    global: Data.Bytes(),
  });
  type DatumType = Data.Static<typeof DatumSchema>;
  const DatumType = DatumSchema as unknown as DatumType;

  const prevUnit = toUnit(registryHash, aTokenHash)
  const registryIn = await lucid.utxosAtWithUnit(registryAddress, prevUnit)
  const inDatum = Data.from(registryIn[0].datum!, DatumType);
  const inTokenHash = inDatum.policy
  console.log(inDatum)
  console.log(inTokenHash)

  const insertAction =
    Data.to(new Constr(0, []))

  const prevDatum = Data.to(new Constr(0, [
    inDatum.policy,
    bTokenHash,
    inDatum.transfer,
    inDatum.user,
    inDatum.global
  ]))

  const registryMintAction =
    Data.to(new Constr(0, [bTokenHash, transferHash, userHash, globalHash]))

  const registryDatum =
    Data.to(new Constr(0, [bTokenHash, fromText(''), transferHash, userHash, globalHash]))

  const unit = toUnit(registryHash, bTokenHash)

  console.log(registryIn[0])

  const tx = await lucid
    .newTx()
    .collectFrom([utxo])
    .collectFrom([registryIn[0]], insertAction)
    .mintAssets({
      [unit]: 1n,
    }, registryMintAction)
    .attach.MintingPolicy(registry.script)
    .pay.ToContract(registryAddress, { kind: "inline", value: registryDatum }, { [unit]: 1n })
    .pay.ToContract(registryAddress, { kind: "inline", value: prevDatum }, { [prevUnit]: 1n })
    .attach.SpendingValidator(registry.script)
    .addSignerKey(ownerPKH)
    .complete()

  const signedTx = await tx.sign.withWallet().complete()

  const submitTx = await signedTx.submit()

  console.log(submitTx)

  return submitTx
}

mintInsertRegistry()