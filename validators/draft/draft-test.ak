use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use draft/scripts as s
use draft/transfer_manager
use draft/types.{GlobalDatum, RegistryDatum, Spend, UserStateDatum}
use draft/variables as v
use tools as t

// TODO: Complete Transfer Manager test

// send tokens with change
test transferManagerSpend() {
  let user = v.a
  let rec1 = v.b
  let owner = v.c
  let policy = v.d

  let oref = t.oref(v.id0, 1)

  let registryDatum =
    RegistryDatum(
      v.tokenPolicy,
      v.a,
      s.transferManager,
      s.userStateManager,
      s.globalState,
    )

  let globalStateDatum = GlobalDatum(False, [])
  let userStateDatum = UserStateDatum(False, False, False, False)
  let recStateDatum = UserStateDatum(False, False, False, False)

  let registryRef =
    t.input(
      t.oref(v.id4, 4),
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(s.tokenRegistry, "", 1),
        InlineDatum(registryDatum),
      ),
    )

  let globalRef =
    t.input(
      t.oref(v.id3, 3),
      t.output(
        t.scriptAddress(s.globalState),
        t.makeAsset(s.globalState, "", 1),
        InlineDatum(globalStateDatum),
      ),
    )

  let userRef =
    t.input(
      t.oref(v.id2, 2),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, user, 1),
        InlineDatum(userStateDatum),
      ),
    )

  let recRef =
    t.input(
      t.oref(v.id1, 1),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, rec1, 1),
        InlineDatum(recStateDatum),
      ),
    )

  let userIn =
    t.input(
      oref,
      t.output(
        t.stakeAddress(s.transferManager, user),
        t.makeAsset(policy, "", 100),
        NoDatum,
      ),
    )

  let userOut =
    t.output(
      t.stakeAddress(s.transferManager, user),
      t.makeAsset(policy, "", 50),
      NoDatum,
    )
  let rec1 =
    t.output(
      t.stakeAddress(s.transferManager, rec1),
      t.makeAsset(policy, "", 50),
      NoDatum,
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [userOut, rec1],
      reference_inputs: [registryRef, globalRef, userRef, recRef],
      extra_signatories: [user],
    }

  transfer_manager.transferManager.spend(
    s.tokenRegistry,
    owner,
    None,
    Spend,
    oref,
    tx,
  )?
}

// send all tokens to recipient
test transferManagerSpendAll() {
  let user = v.a
  let rec1 = v.b
  let owner = v.c
  let policy = v.d

  let oref = t.oref(v.id0, 1)

  let registryDatum =
    RegistryDatum(
      v.tokenPolicy,
      v.a,
      s.transferManager,
      s.userStateManager,
      s.globalState,
    )

  let globalStateDatum = GlobalDatum(False, [])
  let userStateDatum = UserStateDatum(False, False, False, False)
  let recStateDatum = UserStateDatum(False, False, False, False)

  let registryRef =
    t.input(
      t.oref(v.id4, 4),
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(s.tokenRegistry, "", 1),
        InlineDatum(registryDatum),
      ),
    )

  let globalRef =
    t.input(
      t.oref(v.id3, 3),
      t.output(
        t.scriptAddress(s.globalState),
        t.makeAsset(s.globalState, "", 1),
        InlineDatum(globalStateDatum),
      ),
    )

  let userRef =
    t.input(
      t.oref(v.id2, 2),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, user, 1),
        InlineDatum(userStateDatum),
      ),
    )

  let recRef =
    t.input(
      t.oref(v.id1, 1),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, rec1, 1),
        InlineDatum(recStateDatum),
      ),
    )

  let userIn =
    t.input(
      oref,
      t.output(
        t.stakeAddress(s.transferManager, user),
        t.makeAsset(policy, "", 100),
        NoDatum,
      ),
    )

  let rec1 =
    t.output(
      t.stakeAddress(s.transferManager, rec1),
      t.makeAsset(policy, "", 100),
      NoDatum,
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [rec1],
      reference_inputs: [registryRef, globalRef, userRef, recRef],
      extra_signatories: [user],
    }

  transfer_manager.transferManager.spend(
    s.tokenRegistry,
    owner,
    None,
    Spend,
    oref,
    tx,
  )?
}

// Multi Recipient test
test transferManagerMulti() {
  let user = v.a
  let rec1 = v.b
  let rec2 = v.c
  let owner = v.d
  let policy = v.e

  let oref = t.oref(v.id0, 1)

  let registryDatum =
    RegistryDatum(
      v.tokenPolicy,
      v.a,
      s.transferManager,
      s.userStateManager,
      s.globalState,
    )

  let globalStateDatum = GlobalDatum(False, [])
  let userStateDatum = UserStateDatum(False, False, False, False)
  let recStateDatum = UserStateDatum(False, False, False, False)

  let registryRef =
    t.input(
      t.oref(v.id4, 4),
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(s.tokenRegistry, "", 1),
        InlineDatum(registryDatum),
      ),
    )

  let globalRef =
    t.input(
      t.oref(v.id3, 3),
      t.output(
        t.scriptAddress(s.globalState),
        t.makeAsset(s.globalState, "", 1),
        InlineDatum(globalStateDatum),
      ),
    )

  let userRef =
    t.input(
      t.oref(v.id2, 2),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, user, 1),
        InlineDatum(userStateDatum),
      ),
    )

  let rec1Ref =
    t.input(
      t.oref(v.id1, 1),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, rec1, 1),
        InlineDatum(recStateDatum),
      ),
    )

  let rec2Ref =
    t.input(
      t.oref(v.id0, 4),
      t.output(
        t.scriptAddress(s.userStateManager),
        t.makeAsset(s.userStateManager, rec2, 1),
        InlineDatum(recStateDatum),
      ),
    )

  let userIn =
    t.input(
      oref,
      t.output(
        t.stakeAddress(s.transferManager, user),
        t.makeAsset(policy, "", 100),
        NoDatum,
      ),
    )

  let rec2Out =
    t.output(
      t.stakeAddress(s.transferManager, rec2),
      t.makeAsset(policy, "", 50),
      NoDatum,
    )

  let rec1Out =
    t.output(
      t.stakeAddress(s.transferManager, rec1),
      t.makeAsset(policy, "", 50),
      NoDatum,
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [rec2Out, rec1Out],
      reference_inputs: [registryRef, globalRef, userRef, rec1Ref, rec2Ref],
      extra_signatories: [user],
    }

  transfer_manager.transferManager.spend(
    s.tokenRegistry,
    owner,
    None,
    Spend,
    oref,
    tx,
  )?
}
