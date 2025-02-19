use aiken/primitive/bytearray
use cardano/address.{Script}
use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use draft/variables as v
use tools as t
use v1/account_wallet
use v1/scripts as s
use v1/transfer_manager
use v1/types.{RegistryDatum, ThirdParty, Transfer, UserStateDatum}

test sendToOne_Inclusive() {
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
      bytearray.concat(s.globalState, v.tokenPolicy),
      #"0000",
    )

  let globalStateDatum = 0
  let userStateDatum = UserStateDatum(0, 1, 0, 0)
  let recStateDatum = UserStateDatum(0, 1, 0, 0)

  let registryRef =
    t.input(
      t.oref(v.id4, 4),
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(s.tokenRegistry, v.tokenPolicy, 1),
        InlineDatum(registryDatum),
      ),
    )

  let globalRef =
    t.input(
      t.oref(v.id3, 3),
      t.output(
        t.scriptAddress(s.globalState),
        t.makeAsset(s.globalState, v.tokenPolicy, 1),
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
        assets.merge(
          assets.from_lovelace(100),
          t.makeAsset(v.tokenPolicy, "", 100),
        ),
        NoDatum,
      ),
    )

  let userOut =
    t.output(
      t.stakeAddress(s.transferManager, user),
      t.makeAsset(v.tokenPolicy, "", 50),
      NoDatum,
    )

  let rec1 =
    t.output(
      t.stakeAddress(s.transferManager, rec1),
      t.makeAsset(v.tokenPolicy, "", 50),
      NoDatum,
    )

  let transferAction = Transfer([0])
  let withdraw0 = t.withdrawal(s.transferManager)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [userOut, rec1],
      reference_inputs: [registryRef, globalRef, userRef, recRef],
      extra_signatories: [user],
      withdrawals: withdraw0,
    }

  account_wallet.account.spend(None, transferAction, oref, tx)
  // and {
  //   account_wallet.account.spend(None, transferAction, oref, tx)?,
  //   transfer_manager.transferManager.withdraw(
  //     s.tokenRegistry,
  //     s.account,
  //     v.tokenPolicy,
  //     0,
  //     Script(s.transferManager),
  //     tx,
  //   )?,
  // }
}

test sendToOne() {
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
      bytearray.concat(s.globalState, v.tokenPolicy),
      #"0000",
    )

  let globalStateDatum = 0
  let userStateDatum = UserStateDatum(0, 1, 0, 0)
  let recStateDatum = UserStateDatum(0, 1, 0, 0)

  let registryRef =
    t.input(
      t.oref(v.id4, 4),
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(s.tokenRegistry, v.tokenPolicy, 1),
        InlineDatum(registryDatum),
      ),
    )

  let globalRef =
    t.input(
      t.oref(v.id3, 3),
      t.output(
        t.scriptAddress(s.globalState),
        t.makeAsset(s.globalState, v.tokenPolicy, 1),
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
        assets.merge(
          assets.from_lovelace(100),
          t.makeAsset(v.tokenPolicy, "", 100),
        ),
        NoDatum,
      ),
    )

  let userOut =
    t.output(
      t.stakeAddress(s.transferManager, user),
      t.makeAsset(v.tokenPolicy, "", 50),
      NoDatum,
    )

  let rec1 =
    t.output(
      t.stakeAddress(s.transferManager, rec1),
      t.makeAsset(v.tokenPolicy, "", 50),
      NoDatum,
    )

  let transferAction = Transfer([0])
  let withdraw0 = t.withdrawal(s.transferManager)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [userOut, rec1],
      reference_inputs: [registryRef, globalRef, userRef, recRef],
      extra_signatories: [user],
      withdrawals: withdraw0,
    }

  // and {
  account_wallet.account.spend(None, transferAction, oref, tx)?
  //   transfer_manager.transferManager.withdraw(
  //     s.tokenRegistry,
  //     s.account,
  //     v.tokenPolicy,
  //     0,
  //     Script(s.transferManager),
  //     tx,
  //   )?,
  // }
}

test sendToOneFail() fail {
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
      bytearray.concat(s.globalState, v.tokenPolicy),
      #"0000",
    )

  let globalStateDatum = 0
  let userStateDatum = UserStateDatum(0, 1, 0, 0)
  let recStateDatum = UserStateDatum(0, 1, 0, 0)

  let registryRef =
    t.input(
      t.oref(v.id4, 4),
      t.output(
        t.scriptAddress(s.tokenRegistry),
        t.makeAsset(s.tokenRegistry, v.tokenPolicy, 1),
        InlineDatum(registryDatum),
      ),
    )

  let globalRef =
    t.input(
      t.oref(v.id3, 3),
      t.output(
        t.scriptAddress(s.globalState),
        t.makeAsset(s.globalState, v.tokenPolicy, 1),
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
        assets.merge(
          assets.from_lovelace(100),
          t.makeAsset(v.tokenPolicy, "", 100),
        ),
        NoDatum,
      ),
    )

  let userOut =
    t.output(
      t.stakeAddress(s.transferManager, user),
      t.makeAsset(v.tokenPolicy, "", 50),
      NoDatum,
    )

  let rec1 =
    t.output(
      t.stakeAddress(s.transferManager, rec1),
      t.makeAsset(v.tokenPolicy, "", 50),
      NoDatum,
    )

  let transferAction = Transfer([1])
  let withdraw0 = t.withdrawal(s.transferManager)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [userOut, rec1],
      reference_inputs: [registryRef, globalRef, userRef, recRef],
      extra_signatories: [user],
      withdrawals: withdraw0,
    }

  // and {
  account_wallet.account.spend(None, transferAction, oref, tx)?
  // }
  // transfer_manager.transferManager.withdraw(
  //   s.tokenRegistry,
  //   s.account,
  //   v.tokenPolicy,
  //   0,
  //   Script(s.transferManager),
  //   tx,
  // )?,
}
