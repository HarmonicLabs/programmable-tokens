use aiken/collection/list
use cardano/address.{Inline, Script, VerificationKey}
use cardano/assets
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use v1/types.{RegistryDatum, ThirdParty, Transfer, TransferAction}

// NOTE: There is a potential problem here where one ThirdParty script relies on another
// in order to override some UTxO. This could result in utxos that are unspendable by 
// a ThirdParty, if the UTxO has multiple assets in it.

validator account {
  spend(
    _d: Option<Data>,
    r: TransferAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(ownIn) =
      list.find(tx.inputs, fn(in) { in.output_reference == oref })

    // let ownHash = ownIn.output.address.payment_credential
    expect Some(Inline(VerificationKey(owner))) =
      ownIn.output.address.stake_credential

    let policyList =
      assets.policies(assets.without_lovelace(ownIn.output.value))

    when r is {
      // registry nodes need to be in lexOrder to map with policyList
      Transfer { registryNodes } -> {
        let boolList =
          list.map2(
            registryNodes,
            policyList,
            fn(regI, polI) -> Bool {
              // Get our registry RefInput && Datum
              expect Some(registryRef) = list.at(tx.reference_inputs, regI)
              expect InlineDatum(datum) = registryRef.output.datum
              expect rDatum: RegistryDatum = datum
              // policy matches registry
              expect polI == rDatum.tokenPolicy
              // transferManager withdraws
              expect
                list.has(
                  tx.withdrawals,
                  Pair(Script(rDatum.transferManagerHash), 0),
                )
              True
            },
          )

        and {
          (list.unique(boolList) == [True])?,
          // account owner signs Tx
          list.has(tx.extra_signatories, owner)?,
          // check all policies match registries
          (list.length(policyList) == list.length(registryNodes))?,
        }
      }
      ThirdParty { registryNodes } -> {
        let boolList =
          list.map2(
            registryNodes,
            policyList,
            fn(regI, polI) {
              // Get our registry RefInput && Datum
              expect Some(registryRef) = list.at(tx.reference_inputs, regI)
              expect InlineDatum(datum) = registryRef.output.datum
              expect rDatum: RegistryDatum = datum

              expect polI == rDatum.tokenPolicy
              expect
                list.has(
                  tx.withdrawals,
                  Pair(Script(rDatum.thirdPartyAction), 0),
                )
              True
            },
          )

        and {
          list.unique(boolList) == [True],
          // check all policies match registries
          list.length(policyList) == list.length(registryNodes),
        }
      }
    }
  }

  else(_) {
    fail
  }
}
