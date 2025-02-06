use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use draft/variables as v
use tools as t
use v1/global_state
use v1/scripts as s
use v1/types.{GMint, GlobalMintAction, RInsert}

test globalMint() {
  let owner = v.b
  let bootOref = t.oref(v.a, 1)

  let bootIn =
    t.input(
      bootOref,
      t.output(
        t.walletAddress(owner),
        assets.from_lovelace(1000000000000),
        NoDatum,
      ),
    )

  let globalMintAction = GMint
  let globalStateDatum = 0

  let globalValue = t.makeAsset(s.globalState, "", 1)

  let globalOut =
    t.output(
      t.scriptAddress(s.globalState),
      globalValue,
      InlineDatum(globalStateDatum),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [bootIn],
      outputs: [globalOut],
      mint: globalValue,
      extra_signatories: [owner],
    }

  global_state.globalState.mint(
    bootOref,
    owner,
    globalMintAction,
    s.globalState,
    tx,
  )
}
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
