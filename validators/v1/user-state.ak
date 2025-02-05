use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use draft/types.{
  Admin, Blacklist, Burn, Freeze, KYC, UBurn, UMint, UserStateAction,
  UserStateDatum, UserStateMintAction,
}

validator userStateManager(owner: ByteArray, _asset: PolicyId) {
  // linked list?
  // user accounts for KYC/blacklisting etc
  mint(r: UserStateMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair(_userName, _userQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      UMint -> {
        trace @"UserStateMint AlwaysSucceeds"
        True
      }
      UBurn -> {
        trace @"UserStateBurn AlwaysSucceeds"
        True
      }
    }
  }

  spend(
    dat: Option<UserStateDatum>,
    r: UserStateAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(_d) = dat

    expect Some(ownInput) =
      list.find(tx.inputs, fn(input) { input.output_reference == oref })

    let inState = assets.without_lovelace(ownInput.output.value)

    expect Script(ownHash) = ownInput.output.address.payment_credential

    when r is {
      Admin -> {
        trace @"UserState MakeAdmin ..."

        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                assets.without_lovelace(out.value) == inState,
                out.address == ownInput.output.address,
              }
            },
          )

        expect InlineDatum(datum) = ownOut.datum
        expect outDatum: UserStateDatum = datum

        and {
          // 1 represents True
          outDatum.admin == 1,
          list.has(tx.extra_signatories, owner),
        }
      }
      KYC -> {
        trace @"UserState KYC ..."
        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                assets.without_lovelace(out.value) == inState,
                out.address == ownInput.output.address,
              }
            },
          )

        expect InlineDatum(datum) = ownOut.datum
        expect outDatum: UserStateDatum = datum

        and {
          // 1 represents True
          outDatum.kyc == 1,
          list.has(tx.extra_signatories, owner),
        }
      }
      Blacklist -> {
        trace @"UserState Blacklist ..."
        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                assets.without_lovelace(out.value) == inState,
                out.address == ownInput.output.address,
              }
            },
          )

        expect InlineDatum(datum) = ownOut.datum
        expect outDatum: UserStateDatum = datum

        and {
          // 1 represents True
          outDatum.blacklist == 1,
          list.has(tx.extra_signatories, owner),
        }
      }
      Freeze -> {
        trace @"UserState Freeze ..."
        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                assets.without_lovelace(out.value) == inState,
                out.address == ownInput.output.address,
              }
            },
          )

        expect InlineDatum(datum) = ownOut.datum
        expect outDatum: UserStateDatum = datum

        and {
          // 1 represents True
          outDatum.freeze == 1,
          list.has(tx.extra_signatories, owner),
        }
      }
      Burn -> {
        trace @"UserState Burn ..."
        let stateVal =
          ownInput.output.value
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        let burnVal =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        and {
          pairs.keys(burnVal) == pairs.keys(stateVal),
          pairs.values(burnVal) == [-1],
          pairs.values(stateVal) == [1],
          list.has(tx.extra_signatories, owner),
        }
      }
    }
  }

  else(_) {
    fail
  }
}
