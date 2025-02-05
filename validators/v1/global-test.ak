// use cardano/transaction.{Transaction, placeholder}
// use v1/global_state

// const globalStateValue = assets.from_asset(#"0000", #"1111", 1)

// test globalMint() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       outputs: [],
//       mint: globalStateValue,
//       extra_signatories: [owner],
//     }

//   globalState.globalState.mint(boot, owner, globalMintAction, p, tx)
// }

// test globalBurn() {
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [],
//       mint: globalStateValue,
//       extra_signatories: [owner],
//     }

//   and {
//     globalState.globalState.mint(boot, owner, globalMintAction, p, tx),
//     global_state.globalState.spend(
//       boot,
//       owner,
//       None,
//       globalFreezeAction,
//       oref,
//       tx,
//     ),
//   }
// }

// test globalFreeze() {
//   globalState.globalState.spend(boot, owner, None, globalFreezeAction, oref, tx)
// }

// test globalUnfreeze() {
//   globalState.globalState.spend(boot, owner, None, globalFreezeAction, oref, tx)
// }
