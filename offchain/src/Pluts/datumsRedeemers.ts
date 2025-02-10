// import { bs, Constr, DataB, DataConstr, DataI, pstruct } from "@harmoniclabs/plu-ts";

// export const dTrue = new DataI(1)
// export const dFalse = new DataI(0)

// export const initGlobalDatum = dFalse

// export const freezeGlobalDatum = dTrue

// export const globalMintAction =
//   new DataConstr(0, [])

// export const globalBurnAction =
//   new DataConstr(1, [])

// export const transferSpend =
//   new DataConstr(0, [])

// export const transferClawback =
//   new DataConstr(1, [])

// // Registry Datum / Redeemers

// export function registryDatum(policy: string, next: string, transferHash: string, userStateHash: string, globalStateHash: string) {
//   const datum = new DataConstr(0, [
//     new DataB(policy),
//     new DataB(next),
//     new DataB(transferHash),
//     new DataB(userStateHash),
//     new DataB(globalStateHash)
//   ])

//   return datum
// }

// // export const pRegistryDatum = pstruct({
// //   Datum: {
// //     tokenPolicy: bs,
// //     nextTokenPolicy: bs,
// //     transferManagerHash: bs,
// //     userStateManagerHash: bs,
// //     globalStatePolicy: bs,
// //   }
// // })

// export const registryInsertAction =
//   new DataConstr(0, [])

// export const registryRemoveAction =
//   new DataConstr(1, [])

// export const registryPreviousAction =
//   new DataConstr(2, [])

// export function registryMintAction(policy: string, next: string, transferHash: string, userStateHash: string, globalStateHash: string) {
//   const action = new DataConstr(0, [
//     new DataB(policy),
//     new DataB(next),
//     new DataB(transferHash),
//     new DataB(userStateHash),
//     new DataB(globalStateHash)
//   ])

//   return action
// }

// export const registryBurnAction =
//   new DataConstr(1, [])

// // User State Datum / Redeemers

// export function userStateDatum(admin: number, kyc: number, blacklist: number, freeze: number) {
//   const datum = new DataConstr(0, [
//     new DataI(admin),
//     new DataI(kyc),
//     new DataI(blacklist),
//     new DataI(freeze)
//   ])

//   return datum
// }

// export const userStateMintAction =
//   new DataConstr(0, [])

// export const userStateBurnAction =
//   new DataConstr(1, [])

// // for these redeemers we need to attach an Int so we can update these fields
// export const userStateAdmin =
//   new DataConstr(0, [])

// export const userStateKyc =
//   new DataConstr(1, [])

// export const userStateBlacklist =
//   new DataConstr(2, [])

// export const userStateFreeze =
//   new DataConstr(3, [])

// export const userStateBurn =
//   new DataConstr(4, [])
