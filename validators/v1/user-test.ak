use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use draft/variables as v
use tools as t
use v1/scripts as s
use v1/types.{Admin, Blacklist, Burn, Freeze, KYC, UBurn, UMint, UserStateDatum}
use v1/user_state

test mintUserState() {
  let owner = v.a
  let user = v.b
  let policy = s.userStateManager
  let asset = v.c

  let userIn =
    t.input(
      t.oref(v.id0, 1),
      t.output(t.walletAddress(user), assets.from_lovelace(100000000), NoDatum),
    )

  let userStateMintAction = UMint
  let userStateValue = t.makeAsset(policy, user, 1)

  let userStateDatum = UserStateDatum(0, 0, 0, 0)

  let userStateOut =
    t.output(
      t.scriptAddress(policy),
      userStateValue,
      InlineDatum(userStateDatum),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userIn],
      outputs: [userStateOut],
      mint: userStateValue,
      extra_signatories: [user],
    }

  user_state.userStateManager.mint(
    owner,
    asset,
    userStateMintAction,
    policy,
    tx,
  )
}

test makeAdmin() {
  let owner = v.a
  let user = v.b
  let policy = s.userStateManager
  let asset = v.c
  let oref = t.oref(v.id0, 1)

  let userStateAction = Admin
  let userStateValue = t.makeAsset(policy, user, 1)

  let inDatum = UserStateDatum(0, 0, 0, 0)
  let outDatum = UserStateDatum(1, 0, 0, 0)

  let userStateIn =
    t.input(
      oref,
      t.output(t.scriptAddress(policy), userStateValue, InlineDatum(inDatum)),
    )

  let userStateOut =
    t.output(t.scriptAddress(policy), userStateValue, InlineDatum(outDatum))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userStateIn],
      outputs: [userStateOut],
      extra_signatories: [owner],
    }

  user_state.userStateManager.spend(
    owner,
    asset,
    Some(inDatum),
    userStateAction,
    oref,
    tx,
  )
}

test makeKyc() {
  let owner = v.a
  let user = v.b
  let policy = s.userStateManager
  let asset = v.c
  let oref = t.oref(v.id0, 1)

  let userStateAction = KYC
  let userStateValue = t.makeAsset(policy, user, 1)

  let inDatum = UserStateDatum(0, 0, 0, 0)
  let outDatum = UserStateDatum(0, 1, 0, 0)

  let userStateIn =
    t.input(
      oref,
      t.output(t.scriptAddress(policy), userStateValue, InlineDatum(inDatum)),
    )

  let userStateOut =
    t.output(t.scriptAddress(policy), userStateValue, InlineDatum(outDatum))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userStateIn],
      outputs: [userStateOut],
      extra_signatories: [owner],
    }

  user_state.userStateManager.spend(
    owner,
    asset,
    Some(inDatum),
    userStateAction,
    oref,
    tx,
  )
}

test makeBlacklist() {
  let owner = v.a
  let user = v.b
  let policy = s.userStateManager
  let asset = v.c
  let oref = t.oref(v.id0, 1)

  let userStateAction = Blacklist
  let userStateValue = t.makeAsset(policy, user, 1)

  let inDatum = UserStateDatum(0, 0, 0, 0)
  let outDatum = UserStateDatum(0, 0, 1, 0)

  let userStateIn =
    t.input(
      oref,
      t.output(t.scriptAddress(policy), userStateValue, InlineDatum(inDatum)),
    )

  let userStateOut =
    t.output(t.scriptAddress(policy), userStateValue, InlineDatum(outDatum))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userStateIn],
      outputs: [userStateOut],
      extra_signatories: [owner],
    }

  user_state.userStateManager.spend(
    owner,
    asset,
    Some(inDatum),
    userStateAction,
    oref,
    tx,
  )
}

test makeFreeze() {
  let owner = v.a
  let user = v.b
  let policy = s.userStateManager
  let asset = v.c
  let oref = t.oref(v.id0, 1)

  let userStateAction = Freeze
  let userStateValue = t.makeAsset(policy, user, 1)

  let inDatum = UserStateDatum(0, 0, 0, 0)
  let outDatum = UserStateDatum(0, 0, 0, 1)

  let userStateIn =
    t.input(
      oref,
      t.output(t.scriptAddress(policy), userStateValue, InlineDatum(inDatum)),
    )

  let userStateOut =
    t.output(t.scriptAddress(policy), userStateValue, InlineDatum(outDatum))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [userStateIn],
      outputs: [userStateOut],
      extra_signatories: [owner],
    }

  user_state.userStateManager.spend(
    owner,
    asset,
    Some(inDatum),
    userStateAction,
    oref,
    tx,
  )
}
// test burnUserState() {
//   and {
//     user_state.userStateManager.mint(),
//     user_state.userStateManager.spend(),
//   }
// }
