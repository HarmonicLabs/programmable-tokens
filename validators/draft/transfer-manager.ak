use aiken/collection/list
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use draft/types.{ClawBack, RegistryDatum, Spend, TransferAction, UserStateDatum}
use draft/utils

validator transferManager(registry: PolicyId, owner: ByteArray) {
  spend(
    _d: Option<Data>,
    r: TransferAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(ownIn) =
      list.find(tx.inputs, fn(in) { in.output_reference == oref })

    expect Address(ownHash, Some(Inline(VerificationKey(userKey)))) =
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
        expect gDatum: Int = datum

        // 0 represents False
        expect gDatum == 0

        // let recCreds =
        //   list.map(
        //     ownOuts,
        //     fn(out) {
        //       when out.address.stake_credential is {
        //         Some(hash) -> hash
        //         None -> fail
        //       }
        //     },
        //   )
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

              if list.has(assets.flatten(user.output.value), ownState) {
                and {
                  // 0 represents False
                  uDatum.blacklist == 0,
                  uDatum.freeze == 0,
                }
              } else {
                // 0 represents False
                uDatum.blacklist == 0
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
