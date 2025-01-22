use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Address, Credential, Inline, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use draft/types.{
  Admin, Blacklist, Burn, ClawBack, Freeze, GBurn, GMint, GState, GUpdate,
  GlobalAction, GlobalDatum, GlobalMintAction, KYC, RBurn, RInsert, RMint,
  RPrevious, RRemove, RegistryAction, RegistryDatum, RegistryMintAction, Spend,
  TransferAction, UBurn, UMint, UserStateAction, UserStateDatum,
  UserStateMintAction,
}
use draft/utils

validator tokenRegistry {
  mint(r: RegistryMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair(listName, listQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      RMint { policy, transfer, user, global } -> {
        expect Some(registryOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                out.address.payment_credential == Script(p),
                assets.without_lovelace(out.value) == assets.from_asset(
                  p,
                  listName,
                  1,
                ),
              }
            },
          )

        expect InlineDatum(datum) = registryOut.datum
        expect rDatum: RegistryDatum = datum

        and {
          listQty == 1,
          rDatum.tokenPolicy == policy,
          rDatum.nextTokenPolicy == "",
          rDatum.transferManagerHash == transfer,
          rDatum.userStateManagerHash == user,
          rDatum.globalStatePolicy == global,
        }
      }
      RBurn -> listQty == -1
    }
  }

  spend(
    dat: Option<RegistryDatum>,
    r: RegistryAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(ownInput) =
      list.find(tx.inputs, fn(input) { input.output_reference == oref })

    expect Script(ownHash) = ownInput.output.address.payment_credential

    expect Some(d) = dat

    when r is {
      RInsert -> {
        // new list element
        expect [Pair(newTokenName, 1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()
        // original element output
        expect Some(listOut) =
          list.find(
            tx.outputs,
            fn(output) { output.value == ownInput.output.value },
          )
        expect InlineDatum(datum) = listOut.datum
        expect outDatum: RegistryDatum = datum

        // new element output
        expect Some(newOut) =
          list.find(
            tx.outputs,
            fn(output) {
              dict.to_pairs(assets.tokens(output.value, ownHash)) == [
                Pair(newTokenName, 1),
              ]
            },
          )
        expect InlineDatum(datum) = newOut.datum
        expect newDatum: RegistryDatum = datum

        and {
          newDatum.nextTokenPolicy == "",
          newDatum.tokenPolicy == newTokenName,
          outDatum.nextTokenPolicy == newTokenName,
          d.tokenPolicy == outDatum.tokenPolicy,
          d.transferManagerHash == outDatum.transferManagerHash,
          d.userStateManagerHash == outDatum.userStateManagerHash,
          d.globalStatePolicy == outDatum.globalStatePolicy,
        }
      }
      RRemove -> {
        // remove an element from the list
        // check input has 1 token of our policy
        expect [Pair(tokenName, 1)] =
          ownInput.output.value
            |> assets.tokens(ownHash)
            |> dict.to_pairs()
        // check we are burning one token
        expect [Pair(burnName, -1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()
        // find another input
        expect Some(prevNode) =
          list.find(
            tx.inputs,
            fn(input) {
              input.output.address.payment_credential == Script(ownHash) && oref != input.output_reference
            },
          )

        expect InlineDatum(datum) = prevNode.output.datum
        expect prevDatum: RegistryDatum = datum
        expect prevDatum.nextTokenPolicy == burnName

        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(output) {
              and {
                output.value == prevNode.output.value,
                output.address.payment_credential == Script(ownHash),
              }
            },
          )

        expect InlineDatum(datum) = ownOut.datum
        expect newDatum: RegistryDatum = datum

        and {
          tokenName == burnName,
          newDatum.nextTokenPolicy == d.nextTokenPolicy,
          newDatum.transferManagerHash == prevDatum.transferManagerHash,
          newDatum.userStateManagerHash == prevDatum.userStateManagerHash,
          newDatum.globalStatePolicy == prevDatum.globalStatePolicy,
        }
      }
      RPrevious -> {
        // this is for the prevNode of the list to update it when you are removing one
        expect Some(nextNode) =
          list.find(
            tx.inputs,
            fn(input) {
              input.output.address.payment_credential == Script(ownHash) && oref != input.output_reference
            },
          )

        expect InlineDatum(datum) = nextNode.output.datum
        expect nextDatum: RegistryDatum = datum

        expect [Pair(nextName, 1)] =
          nextNode.output.value
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        expect [Pair(burnName, -1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(output) { output.address.payment_credential == Script(ownHash) },
          )
        expect InlineDatum(datum) = ownOut.datum
        expect outDatum: RegistryDatum = datum

        and {
          ownOut.value == ownInput.output.value,
          nextDatum.nextTokenPolicy == outDatum.nextTokenPolicy,
          outDatum.tokenPolicy == d.tokenPolicy,
          outDatum.transferManagerHash == d.transferManagerHash,
          outDatum.userStateManagerHash == d.userStateManagerHash,
          outDatum.globalStatePolicy == d.globalStatePolicy,
          nextName == d.nextTokenPolicy,
          nextName == burnName,
        }
      }
    }
  }

  else(_) {
    fail
  }
}

validator globalState(boot: OutputReference, owner: ByteArray) {
  // globalState refIn w scripts
  // references withdrawal scripts for various asset functions
  mint(r: GlobalMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair("", supplyQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      GMint { actions } -> {
        expect Some(_bootIn) =
          list.find(tx.inputs, fn(in) { in.output_reference == boot })

        expect Some(globalOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                out.address.payment_credential == Script(p),
                assets.without_lovelace(out.value) == assets.from_asset(
                  p,
                  "",
                  1,
                ),
              }
            },
          )
        expect InlineDatum(datum) = globalOut.datum
        expect gDatum: GlobalDatum = datum

        and {
          gDatum.freeze == False,
          gDatum.actions == actions,
        }
      }
      GBurn -> and {
          supplyQty == -1,
          list.has(tx.extra_signatories, owner),
        }
    }
  }

  spend(
    dat: Option<GlobalDatum>,
    r: GlobalAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(d) = dat

    expect Some(ownInput) =
      list.find(tx.inputs, fn(input) { input.output_reference == oref })

    expect Some(ownOut) =
      list.find(
        tx.outputs,
        fn(out) {
          and {
            out.address.payment_credential == ownInput.output.address.payment_credential,
            assets.without_lovelace(ownInput.output.value) == assets.without_lovelace(
              out.value,
            ),
          }
        },
      )
    expect InlineDatum(datum) = ownOut.datum
    expect outDatum: GlobalDatum = datum

    when r is {
      GState { freeze } -> and {
          outDatum.freeze == freeze,
          outDatum.actions == d.actions,
          list.has(tx.extra_signatories, owner),
        }
      GUpdate { actions } -> and {
          outDatum.actions == actions,
          outDatum.freeze == d.freeze,
          list.has(tx.extra_signatories, owner),
        }
    }
  }

  else(_) {
    fail
  }
}

validator transferManager(registry: PolicyId, owner: ByteArray) {
  spend(
    _d: Option<Data>,
    r: TransferAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(ownIn) =
      list.find(tx.inputs, fn(in) { in.output_reference == oref })

    expect Address(ownHash, Some(Inline(Script(userKey)))) =
      ownIn.output.address

    let ownIns =
      list.filter(
        tx.inputs,
        fn(in) { in.output.address.payment_credential == ownHash },
      )
    expect list.length(ownIns) == 1

    let ownOuts =
      list.filter(
        tx.outputs,
        fn(out) { out.address.payment_credential == ownHash },
      )

    expect Some(registryRef) =
      list.find(
        tx.reference_inputs,
        fn(input) { list.has(assets.policies(input.output.value), registry) },
      )
    expect InlineDatum(datum) = registryRef.output.datum
    expect rDatum: RegistryDatum = datum

    let outTokens =
      utils.foldPolicyOut(ownOuts, rDatum.tokenPolicy)
        |> assets.quantity_of(rDatum.tokenPolicy, "")

    when r is {
      Spend -> {
        expect Some(globalRef) =
          list.find(
            tx.reference_inputs,
            fn(input) {
              list.has(
                assets.policies(input.output.value),
                rDatum.globalStatePolicy,
              )
            },
          )

        expect InlineDatum(datum) = globalRef.output.datum
        expect gDatum: GlobalDatum = datum

        expect gDatum.freeze == False

        let recCreds =
          list.map(
            ownOuts,
            fn(out) {
              when out.address.stake_credential is {
                Some(hash) -> hash
                None -> fail
              }
            },
          )

        let ownState = (rDatum.userStateManagerHash, userKey, 1)
        let userRefs =
          list.filter(
            tx.reference_inputs,
            fn(ref) {
              ref.output.address.payment_credential == Script(
                rDatum.userStateManagerHash,
              )
            },
          )

        and {
          outTokens == assets.quantity_of(
            ownIn.output.value,
            rDatum.tokenPolicy,
            "",
          ),
          utils.txSignedByStake(ownIns, tx.extra_signatories),
          list.all(
            userRefs,
            fn(user) {
              expect InlineDatum(datum) = user.output.datum
              expect uDatum: UserStateDatum = datum

              if list.has(
                assets.flatten(user.output.value),
                (rDatum.userStateManagerHash, userKey, 1),
              ) {
                and {
                  uDatum.blacklist == False,
                  uDatum.freeze == False,
                }
              } else {
                uDatum.blacklist == False
              }
            },
          ),
        }
      }
      ClawBack -> list.has(tx.extra_signatories, owner)
    }
  }

  else(_) {
    fail
  }
}

validator userStateManager(owner: ByteArray, asset: PolicyId) {
  // linked list?
  // user accounts for KYC/blacklisting etc
  mint(r: UserStateMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair(userName, userQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      UMint -> True
      UBurn -> True
    }
  }

  spend(
    dat: Option<UserStateDatum>,
    r: UserStateAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(d) = dat

    expect Some(ownInput) =
      list.find(tx.inputs, fn(input) { input.output_reference == oref })
    let inState = assets.without_lovelace(ownInput.output.value)

    expect Script(ownHash) = ownInput.output.address.payment_credential

    when r is {
      Admin -> {
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
          outDatum.admin == True,
          list.has(tx.extra_signatories, owner),
        }
      }
      KYC -> {
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
          outDatum.kyc == True,
          list.has(tx.extra_signatories, owner),
        }
      }
      Blacklist -> {
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
          outDatum.blacklist == True,
          list.has(tx.extra_signatories, owner),
        }
      }
      Freeze -> {
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
          outDatum.blacklist == True,
          list.has(tx.extra_signatories, owner),
        }
      }
      Burn -> {
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
