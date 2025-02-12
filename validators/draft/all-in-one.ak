use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use aiken/primitive/bytearray
use cardano/address.{Address, Credential, Inline, Script, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use draft/utils
use v1/types.{
  RegistryDatum, ThirdParty, Transfer, TransferAction, UserStateDatum,
}

validator transferManager(registry: PolicyId) {
  // change to spend/withdraw
  // withdraw needs if(refInput) {check} else {}
  withdraw(r: TransferAction, cred: Credential, tx: Transaction) {
    expect ownHash = cred

    let ownIns =
      list.filter(
        tx.inputs,
        fn(in) { in.output.address.payment_credential == ownHash },
      )

    let ownOuts =
      list.filter(
        tx.outputs,
        fn(out) { out.address.payment_credential == ownHash },
      )

    when r is {
      Transfer { registryNodes } -> {
        trace @"Spending ..."

        list.all(
          registryNodes,
          fn(index) {
            // Get our registry RefInput && Datum
            expect Some(registryRef) = list.at(tx.reference_inputs, index)
            expect InlineDatum(datum) = registryRef.output.datum
            expect rDatum: RegistryDatum = datum
            // fold outputValue for assets
            let outTokens =
              utils.foldPolicyOut(ownOuts, rDatum.tokenPolicy)
                |> assets.quantity_of(rDatum.tokenPolicy, "")
            let inTokens =
              utils.foldPolicyIn(ownIns, rDatum.tokenPolicy)
                |> assets.quantity_of(rDatum.tokenPolicy, "")

            // find globalState at globalValidator && check it isnt Frozen
            let globalCheck =
              when rDatum.globalStateUnit is {
                "" -> True
                _ -> {
                  let globalPolicy = bytearray.take(rDatum.globalStateUnit, 28)
                  let globalName = bytearray.drop(rDatum.globalStateUnit, 28)

                  expect Some(globalRef) =
                    list.find(
                      tx.reference_inputs,
                      fn(input) {
                        dict.has_key(
                          assets.tokens(input.output.value, globalPolicy),
                          globalName,
                        ) && input.output.address.payment_credential == Script(
                          globalPolicy,
                        )
                      },
                    )

                  expect InlineDatum(datum) = globalRef.output.datum
                  expect gDatum: Int = datum

                  // 0 represents False
                  gDatum == 0
                }
              }

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
              // all spenders have signed
              utils.txSignedByStake(ownIns, tx.extra_signatories),
              // ensure all spender is KYC'd && not Blacklist or Frozen
              list.all(
                userRefs,
                fn(user) {
                  expect InlineDatum(datum) = user.output.datum
                  expect uDatum: UserStateDatum = datum
                  // This example requires KYC to spend
                  expect uDatum.kyc == 1

                  expect [Pair(userKey, 1)] =
                    user.output.value
                      |> assets.tokens(rDatum.userStateManagerHash)
                      |> dict.to_pairs()

                  and {
                    // 0 represents False
                    uDatum.blacklist == 0,
                    uDatum.freeze == 0,
                  }
                },
              ),
              globalCheck == True,
              inTokens == outTokens,
            }
          },
        )
      }
      ThirdParty { registryNodes } ->
        list.all(
          registryNodes,
          fn(index) {
            expect Some(ref) = list.at(tx.reference_inputs, index)

            expect InlineDatum(datum) = ref.output.datum
            expect refDatum: RegistryDatum = datum
            pairs.has_key(tx.withdrawals, Script(refDatum.thirdPartyAction))
          },
        )
    }
  }

  spend(_d: Option<Data>, _r: Data, oref: OutputReference, tx: Transaction) {
    expect Some(ownIn) =
      list.find(tx.inputs, fn(in) { in.output_reference == oref })

    list.has(tx.withdrawals, Pair(ownIn.output.address.payment_credential, 0))
  }

  else(_) {
    fail
  }
}
