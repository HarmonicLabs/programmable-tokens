// use cardano/transaction.{Transaction, placeholder}
// use v1/transfer_manager

// test sendToOne() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test sendToMany() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test sendManyToOne() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test sendManyToMany() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test overRide() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test recieveWhithoutState() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test spendAndOverride() fail {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test spendToBlacklist() fail {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }

// test spendNoKyc() fail {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [userIn],
//       outputs: [userOut, rec1],
//       reference_inputs: [registryRef, globalRef, userRef, recRef],
//       extra_signatories: [user],
//     }

//   transfer_manager.transferManager.spend(
//     registry,
//     owner,
//     None,
//     transferAction,
//     oref,
//     tx,
//   )
// }
