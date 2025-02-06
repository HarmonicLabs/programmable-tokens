use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use v1/types.{
  Admin, Blacklist, Burn, Freeze, KYC, UBurn, UMint, UserStateAction,
  UserStateDatum, UserStateMintAction,
}

validator userStateManager(owner: ByteArray, _asset: PolicyId) {
  // linked list?
  // user accounts for KYC/blacklisting etc
  mint(r: UserStateMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair(userName, userQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      UMint -> {
        trace @"UserStateMint userName ..."
        expect Some(stateOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                out.address.payment_credential == Script(p),
                assets.without_lovelace(out.value) == assets.from_asset(
                  p,
                  userName,
                  userQty,
                ),
              }
            },
          )
        expect InlineDatum(datum) = stateOut.datum
        expect sDatum: UserStateDatum = datum

        and {
          userQty == 1,
          sDatum.admin == 0,
          sDatum.kyc == 0,
          sDatum.blacklist == 0,
          sDatum.freeze == 0,
          list.has(tx.extra_signatories, userName),
        }
      }
      UBurn -> {
        trace @"UserStateBurn AlwaysSucceeds"
        and {
          list.has(tx.extra_signatories, owner),
          userQty == -1,
        }
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
