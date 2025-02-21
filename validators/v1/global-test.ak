use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use draft/variables as v
use tools as t
use v1/global_state
use v1/scripts as s
use v1/types.{GMint}

test globalMint() {
  let owner = v.b
  let bootOref = t.oref(v.id0, 1)

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

  let globalValue = t.makeAsset(s.globalState, v.id0, 1)

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

test globalFreeze() {
  let owner = v.b
  let bootOref = t.oref(v.id0, 1)
  let oref = t.oref(v.id2, 2)

  let globalValue = t.makeAsset(s.globalState, v.id2, 1)

  let globalFreezeAction = 1

  let globalInDatum = 0
  let globalOutDatum = 1

  let globalIn =
    t.input(
      oref,
      t.output(
        t.scriptAddress(s.globalState),
        globalValue,
        InlineDatum(globalInDatum),
      ),
    )

  let globalOut =
    t.output(
      t.scriptAddress(s.globalState),
      globalValue,
      InlineDatum(globalOutDatum),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [globalIn],
      outputs: [globalOut],
      extra_signatories: [owner],
    }

  global_state.globalState.spend(
    bootOref,
    owner,
    Some(globalInDatum),
    globalFreezeAction,
    oref,
    tx,
  )
}

test globalUnfreeze() {
  let owner = v.b
  let bootOref = t.oref(v.id0, 1)
  let oref = t.oref(v.id2, 2)

  let globalValue = t.makeAsset(s.globalState, v.id2, 1)

  let globalDefrostAction = 0

  let globalInDatum = 1
  let globalOutDatum = 0

  let globalIn =
    t.input(
      oref,
      t.output(
        t.scriptAddress(s.globalState),
        globalValue,
        InlineDatum(globalInDatum),
      ),
    )

  let globalOut =
    t.output(
      t.scriptAddress(s.globalState),
      globalValue,
      InlineDatum(globalOutDatum),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [globalIn],
      outputs: [globalOut],
      extra_signatories: [owner],
    }

  global_state.globalState.spend(
    bootOref,
    owner,
    Some(globalInDatum),
    globalDefrostAction,
    oref,
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
