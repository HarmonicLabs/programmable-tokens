// NOTE: There is a potential problem here where one ThirdParty script relies on another
// in order to override some UTxO. This could result in utxos that are unspendable by 
// a ThirdParty, if the UTxO has multiple assets in it.

validator account {
  spend(_d: Option<Data>, r: TransferAction, oref: OutputReference, tx: Transaction) {
    expect Some(ownIn) =
      list.find(tx.inputs, fn(in) { in.output_reference == oref })

    let ownHash = ownIn.output.address.payment_credential
    expect Some(Inline(VerificationKey(owner))) =
      ownIn.output.address.stake_credential

    let policyList = assets.policies(assets.without_lovelace(ownIn))

    when r is {
      // registry nodes need to be in lexOrder to map with policyList
      Transfer { registryNodes } -> {
        and {
          list.map2(
            registryNodes,
            policyList,
            fn(regI, polI) {
              // Get our registry RefInput && Datum
              expect Some(registryRef) = list.at(tx.reference_inputs, regI)
              expect InlineDatum(datum) = registryRef.output.datum
              expect rDatum: RegistryDatum = datum
              and {
                // policy matches registry
                polI == rDatum.tokenPolicy,
                // transferManager withdraws
                list.has(tx.withdrawals, Pair(rDatum.transferManager, 0)),
              }
            },
          )
          // account owner signs Tx
          list.has(tx.extra_signatories, owner),
          // check all policies match registries
          list.length(policyList) == list.length(registryNodes)
        }
      }
      ThirdParty { registryNodes } ->
        and {
          list.map2(
            registryNodes,
            policyList,
            fn(regI, polI) {
              // Get our registry RefInput && Datum
              expect Some(registryRef) = list.at(tx.reference_inputs, regI)
              expect InlineDatum(datum) = registryRef.output.datum
              expect rDatum: RegistryDatum = datum

              and {
                polI == rDatum.tokenPolicy,
                list.has(tx.withdrawals, Pair(rDatum.thirdPartyAction, 0))
              }
            },
          ),
          // check all policies match registries
          list.length(policyList) == list.length(registryNodes)
        }
    }
  }

  else(_) {
    fail
  }
}
