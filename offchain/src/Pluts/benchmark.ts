// import { compileUPLC, parseUPLC, showUPLC, UPLCProgram, Machine, TxRedeemer, pstruct, DataConstr, DataList, CborObj, CborString, Data, Credential, Application } from "@harmoniclabs/plu-ts"
// import { Address, Hash28, StakeCredentials, StakeCredentialsType, StakeValidatorHash, Tx, TxBody, TxOut, TxOutRef, TxRedeemerTag, UTxO, Value, VoterKind } from "@harmoniclabs/cardano-ledger-ts";
// import { fromHex, fromUtf8 } from "@harmoniclabs/uint8array-utils"
// import { readFile } from 'fs/promises'
// import { initGlobalDatum, freezeGlobalDatum, globalMintAction, globalBurnAction, transferSpend, transferClawback, registryDatum, registryInsertAction, registryRemoveAction, registryPreviousAction, registryMintAction, registryBurnAction, userStateDatum, userStateMintAction, userStateBurnAction, userStateAdmin, userStateKyc, userStateBlacklist, userStateFreeze, userStateBurn } from './datumsRedeemers.js'
// import { ExBudget } from "@harmoniclabs/plutus-machine";
// import { getSpendingPurposeData } from './getSpendingPurposeData.js'
// import { getTxInfos } from './getTxInfos.js'
// import { ToDataVersion } from "@harmoniclabs/cardano-ledger-ts/dist/toData/defaultToDataVersion.js";
// import { utxosToCores, validatorToScriptHash } from "@lucid-evolution/lucid";

// export function mintContext() {
//   // {
//   //   tx: Transaction,
//   //   redeemer: TxRedeemer,
//   //   info: {
//   //     Mint(PolicyId)
//   //   },
//   // }

// }

// export function transferSpendingContext() {
//   // {
//   //   tx: Transaction,
//   //   redeemer: TxRedeemer,
//   //   info: {
//   //     Spend { oref, datum }
//   //   },
//   // }
//   const registryRef = new UTxO({
//     utxoRef: new TxOutRef({
//       id: '0000000000000000000000000000000000000000000000000000000000000000',
//       index: 0
//     }),
//     resolved: new TxOut({
//       address: new Address(
//         "testnet",
//         Credential.script('00000000000000000000000000000000000000000000000000000000'),
//         StakeCredentials.keyHash('00000000000000000000000000000000000000000000000000000000')
//       ),
//       value: Value.singleAsset(
//         new Hash28('00000000000000000000000000000000000000000000000000000000'),
//         fromUtf8('00000000000000000000000000000000000000000000000000000000'),
//         100
//       ),
//       datum: registryDatum(
//         '00000000000000000000000000000000000000000000000000000000',
//         '00000000000000000000000000000000000000000000000000000000',
//         registry.hash,
//         user.hash,
//         global.hash
//       ),
//     })
//   })

//   const globalRef = new UTxO({
//     utxoRef: new TxOutRef({
//       id: '0000000000000000000000000000000000000000000000000000000000000000',
//       index: 1
//     }),
//     resolved: new TxOut({
//       address: new Address(
//         "testnet",
//         Credential.script('00000000000000000000000000000000000000000000000000000000'),
//         StakeCredentials.keyHash('00000000000000000000000000000000000000000000000000000000')
//       ),
//       value: Value.singleAsset(
//         new Hash28('00000000000000000000000000000000000000000000000000000000'),
//         fromUtf8(''),
//         100
//       ),
//       datum: initGlobalDatum,
//     })
//   })

//   const userStateRef = new UTxO({
//     utxoRef: new TxOutRef({
//       id: '0000000000000000000000000000000000000000000000000000000000000000',
//       index: 2
//     }),
//     resolved: new TxOut({
//       address: new Address(
//         "testnet",
//         Credential.script('00000000000000000000000000000000000000000000000000000000'),
//         StakeCredentials.keyHash('11111111111111111111111111111111111111111111111111111111')
//       ),
//       value: Value.singleAsset(
//         new Hash28('00000000000000000000000000000000000000000000000000000000'),
//         fromUtf8('00000000000000000000000000000000000000000000000000000000'),
//         100
//       ),
//       datum: userStateDatum(0, 0, 0, 0),
//     })
//   })

//   const recipientStateRef = new UTxO({
//     utxoRef: new TxOutRef({
//       id: '0000000000000000000000000000000000000000000000000000000000000000',
//       index: 3
//     }),
//     resolved: new TxOut({
//       address: new Address(
//         "testnet",
//         Credential.script('00000000000000000000000000000000000000000000000000000000'),
//         StakeCredentials.keyHash('2222222222222222222222222222222222222222222222222222222')
//       ),
//       value: Value.singleAsset(
//         new Hash28('00000000000000000000000000000000000000000000000000000000'),
//         fromUtf8('00000000000000000000000000000000000000000000000000000000'),
//         100
//       ),
//       datum: userStateDatum(0, 0, 0, 0),
//     })
//   })

//   const inUtxo = new UTxO({
//     utxoRef: new TxOutRef({
//       id: '0000000000000000000000000000000000000000000000000000000000000000',
//       index: 4
//     }),
//     resolved: new TxOut({
//       address: new Address(
//         "testnet",
//         Credential.script('00000000000000000000000000000000000000000000000000000000'),
//         StakeCredentials.keyHash('11111111111111111111111111111111111111111111111111111111')
//       ),
//       value: Value.singleAsset(
//         new Hash28('00000000000000000000000000000000000000000000000000000000'),
//         fromUtf8(''),
//         100
//       ),
//     })
//   })

//   const redeemer = {
//     tag: 0,
//     index: 0,
//     data: transferSpend,
//     execUnits: new ExBudget({ mem: 12_000_000, cpu: 10_000_000_000 }),
//   }

//   const userOut = new TxOut({
//     address: new Address(
//       "testnet",
//       Credential.script('00000000000000000000000000000000000000000000000000000000'),
//       StakeCredentials.keyHash('22222222222222222222222222222222222222222222222222222222')
//     ),
//     value: Value.singleAsset(
//       new Hash28('00000000000000000000000000000000000000000000000000000000'),
//       fromUtf8(''),
//       100
//     ),
//   })

//   const recipientOut = new TxOut({
//     address: new Address(
//       "testnet",
//       Credential.script('00000000000000000000000000000000000000000000000000000000'),
//       StakeCredentials.keyHash('00000000000000000000000000000000000000000000000000000000')
//     ),
//     value: Value.singleAsset(
//       new Hash28('00000000000000000000000000000000000000000000000000000000'),
//       fromUtf8(''),
//       100
//     ),
//   })

//   const tx = new TxBody({
//     inputs: [inUtxo],
//     outputs: [userOut, recipientOut],
//     fee: 0,
//     refInputs: [registryRef, globalRef, userStateRef, recipientStateRef],
//     requiredSigners: [userPkh]
//   })

//   const spendPurpose = getSpendingPurposeData(
//     new TxRedeemer(redeemer),
//     tx,
//     "v3"
//   )

//   return spendPurpose
// }

// export async function benchmark() {
//   const plutus = JSON.parse(await readFile('../validators.json', { encoding: "utf-8" }))

//   // const registry = parseUPLC(fromHex(plutus.scripts.registry.script.script))
//   // const global = parseUPLC(fromHex(plutus.scripts.global.script.script))
//   // const user = parseUPLC(fromHex(plutus.scripts.user.script.script))
//   const transfer = parseUPLC(fromHex(plutus.scripts.transfer.script.script))

//   const spendPurpose = transferSpendingContext()

//   const transferProgram = compileUPLC(
//     new UPLCProgram(
//       transfer.version,
//       new Application(
//         transfer.body,
//         spendPurpose
//       )
//     )
//   )

//   // const registryEval = Machine.eval(registry.body)
//   // const globalEval = Machine.eval(global.body)
//   // const userEval = Machine.eval(user.body)
//   const transferEval = Machine.eval(transfer.body)

//   // console.log(registryEval.budgetSpent.toJSON())
//   // console.log(registryEval.logs)
//   // console.log(globalEval.budgetSpent.toJSON())
//   // console.log(globalEval.logs)
//   // console.log(userEval.budgetSpent.toJSON())
//   // console.log(userEval.logs)
//   console.log(transferEval.budgetSpent.toJSON())
//   console.log(transferEval.logs)

// }

// benchmark()

