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

validator transferManager(
  registry: PolicyId,
  account: ByteArray,
  asset: PolicyId,
) {
  withdraw(r: Int, cred: Credential, tx: Transaction) {
    let ownIns =
      list.filter(
        tx.inputs,
        fn(in) { in.output.address.payment_credential == Script(account) },
      )

    let ownOuts =
      list.filter(
        tx.outputs,
        fn(out) { out.address.payment_credential == Script(account) },
      )

    // Get our registry RefInput && Datum
    expect Some(registryRef) = list.at(tx.reference_inputs, r)
    expect
      assets.without_lovelace(registryRef.output.value) == assets.from_asset(
        registry,
        asset,
        1,
      )

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
      rDatum.tokenPolicy == asset,
    }
  }

  else(_) {
    fail
  }
}
