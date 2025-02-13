// use cardano/address.{Script}
// use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
// use draft/scripts as s
// use draft/variables as v
// use tools as t
// use v1/transfer_manager
// use v1/types.{RegistryDatum, ThirdParty, Transfer, UserStateDatum}

// test sendToOne() {
//   let user = v.a
//   let rec1 = v.b
//   let owner = v.c
//   let policy = v.d

//   let oref = t.oref(v.id0, 1)

//   let registryDatum =
//     RegistryDatum(
//       v.tokenPolicy,
//       v.a,
//       s.transferManager,
//       s.userStateManager,
//       s.globalState,
//       #"0000",
//     )

//   let globalStateDatum = 0
//   let userStateDatum = UserStateDatum(0, 1, 0, 0)
//   let recStateDatum = UserStateDatum(0, 1, 0, 0)

//   let registryRef =
//     t.input(
//       t.oref(v.id4, 4),
//       t.output(
//         t.scriptAddress(s.tokenRegistry),
//         t.makeAsset(s.tokenRegistry, "", 1),
//         InlineDatum(registryDatum),
//       ),
//     )

//   let globalRef =
//     t.input(
//       t.oref(v.id3, 3),
//       t.output(
//         t.scriptAddress(s.globalState),
//         t.makeAsset(s.globalState, "", 1),
//         InlineDatum(globalStateDatum),
//       ),
//     )

//   let userRef =
//     t.input(
//       t.oref(v.id2, 2),
//       t.output(
//         t.scriptAddress(s.userStateManager),
//         t.makeAsset(s.userStateManager, user, 1),
//         InlineDatum(userStateDatum),
//       ),
//     )

//   let recRef =
//     t.input(
//       t.oref(v.id1, 1),
//       t.output(
//         t.scriptAddress(s.userStateManager),
//         t.makeAsset(s.userStateManager, rec1, 1),
//         InlineDatum(recStateDatum),
//       ),
//     )

//   let userIn =
//     t.input(
//       oref,
//       t.output(
//         t.stakeAddress(s.transferManager, user),
//         t.makeAsset(policy, "", 100),
//         NoDatum,
//       ),
//     )

//   let userOut =
//     t.output(
//       t.stakeAddress(s.transferManager, user),
//       t.makeAsset(policy, "", 50),
//       NoDatum,
//     )

//   let rec1 =
//     t.output(
//       t.stakeAddress(s.transferManager, rec1),
//       t.makeAsset(policy, "", 50),
//       NoDatum,
//     )

//   let transferAction = Transfer([0])
//   let withdraw0 = t.withdrawal(s.transferManager)

//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//       withdrawals: withdraw0,
//     }

//   and {
//     transfer_manager.transferManager.spend(s.tokenRegistry, None, 0, oref, tx),
//     transfer_manager.transferManager.withdraw(
//       s.tokenRegistry,
//       transferAction,
//       Script(s.transferManager),
//       tx,
//     ),
//   }
// }

// test sendToMany() {
//   let user = v.a
//   let rec1 = v.b
//   let rec2 = v.c
//   let policy = v.d

//   let oref = t.oref(v.id0, 1)

//   let registryDatum =
//     RegistryDatum(
//       v.tokenPolicy,
//       v.a,
//       s.transferManager,
//       s.userStateManager,
//       s.globalState,
//       #"0000",
//     )

//   let globalStateDatum = 0
//   let userStateDatum = UserStateDatum(0, 1, 0, 0)
//   let recStateDatum = UserStateDatum(0, 1, 0, 0)

//   let registryRef =
//     t.input(
//       t.oref(v.id4, 4),
//       t.output(
//         t.scriptAddress(s.tokenRegistry),
//         t.makeAsset(s.tokenRegistry, "", 1),
//         InlineDatum(registryDatum),
//       ),
//     )

//   let globalRef =
//     t.input(
//       t.oref(v.id3, 3),
//       t.output(
//         t.scriptAddress(s.globalState),
//         t.makeAsset(s.globalState, "", 1),
//         InlineDatum(globalStateDatum),
//       ),
//     )

//   let userRef =
//     t.input(
//       t.oref(v.id2, 2),
//       t.output(
//         t.scriptAddress(s.userStateManager),
//         t.makeAsset(s.userStateManager, user, 1),
//         InlineDatum(userStateDatum),
//       ),
//     )

//   let recRef =
//     t.input(
//       t.oref(v.id1, 1),
//       t.output(
//         t.scriptAddress(s.userStateManager),
//         t.makeAsset(s.userStateManager, rec1, 1),
//         InlineDatum(recStateDatum),
//       ),
//     )

//   let userIn =
//     t.input(
//       oref,
//       t.output(
//         t.stakeAddress(s.transferManager, user),
//         t.makeAsset(policy, "", 200),
//         NoDatum,
//       ),
//     )

//   let userOut =
//     t.output(
//       t.stakeAddress(s.transferManager, user),
//       t.makeAsset(policy, "", 100),
//       NoDatum,
//     )

//   let rec1 =
//     t.output(
//       t.stakeAddress(s.transferManager, rec1),
//       t.makeAsset(policy, "", 60),
//       NoDatum,
//     )

//   let rec2 =
//     t.output(
//       t.stakeAddress(s.transferManager, rec2),
//       t.makeAsset(policy, "", 40),
//       NoDatum,
//     )

//   let transferAction = Transfer([0])
//   let withdraw0 = t.withdrawal(s.transferManager)

//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1, rec2],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//       withdrawals: withdraw0,
//     }

//   and {
//     transfer_manager.transferManager.spend(s.tokenRegistry, None, 0, oref, tx),
//     transfer_manager.transferManager.withdraw(
//       s.tokenRegistry,
//       transferAction,
//       Script(s.transferManager),
//       tx,
//     ),
//   }
// }

// test sendManyToOne() {
//   let user = v.a
//   let rec1 = v.b
//   let owner = v.c
//   let policy = v.d

//   let oref1 = t.oref(v.id0, 1)
//   let oref2 = t.oref(v.id0, 2)
//   let oref3 = t.oref(v.id0, 3)

//   let registryDatum =
//     RegistryDatum(
//       v.tokenPolicy,
//       v.a,
//       s.transferManager,
//       s.userStateManager,
//       s.globalState,
//       #"0000",
//     )

//   let globalStateDatum = 0
//   let userStateDatum = UserStateDatum(0, 1, 0, 0)
//   let recStateDatum = UserStateDatum(0, 1, 0, 0)

//   let registryRef =
//     t.input(
//       t.oref(v.id4, 4),
//       t.output(
//         t.scriptAddress(s.tokenRegistry),
//         t.makeAsset(s.tokenRegistry, "", 1),
//         InlineDatum(registryDatum),
//       ),
//     )

//   let globalRef =
//     t.input(
//       t.oref(v.id3, 3),
//       t.output(
//         t.scriptAddress(s.globalState),
//         t.makeAsset(s.globalState, "", 1),
//         InlineDatum(globalStateDatum),
//       ),
//     )

//   let userRef =
//     t.input(
//       t.oref(v.id2, 2),
//       t.output(
//         t.scriptAddress(s.userStateManager),
//         t.makeAsset(s.userStateManager, user, 1),
//         InlineDatum(userStateDatum),
//       ),
//     )

//   let recRef =
//     t.input(
//       t.oref(v.id1, 1),
//       t.output(
//         t.scriptAddress(s.userStateManager),
//         t.makeAsset(s.userStateManager, rec1, 1),
//         InlineDatum(recStateDatum),
//       ),
//     )

//   let userIn1 =
//     t.input(
//       oref1,
//       t.output(
//         t.stakeAddress(s.transferManager, user),
//         t.makeAsset(policy, "", 100),
//         NoDatum,
//       ),
//     )

//   let userIn2 =
//     t.input(
//       oref2,
//       t.output(
//         t.stakeAddress(s.transferManager, user),
//         t.makeAsset(policy, "", 100),
//         NoDatum,
//       ),
//     )

//   let userIn3 =
//     t.input(
//       oref3,
//       t.output(
//         t.stakeAddress(s.transferManager, user),
//         t.makeAsset(policy, "", 100),
//         NoDatum,
//       ),
//     )

//   let userOut =
//     t.output(
//       t.stakeAddress(s.transferManager, user),
//       t.makeAsset(policy, "", 50),
//       NoDatum,
//     )

//   let rec1 =
//     t.output(
//       t.stakeAddress(s.transferManager, rec1),
//       t.makeAsset(policy, "", 250),
//       NoDatum,
//     )

//   let transferAction = Transfer([0])
//   let withdraw0 = t.withdrawal(s.transferManager)

//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn1, userIn2, userIn3],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//       withdrawals: withdraw0,
//     }

//   and {
//     transfer_manager.transferManager.spend(s.tokenRegistry, None, 0, oref1, tx),
//     transfer_manager.transferManager.spend(s.tokenRegistry, None, 0, oref2, tx),
//     transfer_manager.transferManager.spend(s.tokenRegistry, None, 0, oref3, tx),
//     transfer_manager.transferManager.withdraw(
//       s.tokenRegistry,
//       transferAction,
//       Script(s.transferManager),
//       tx,
//     ),
//   }
// }
