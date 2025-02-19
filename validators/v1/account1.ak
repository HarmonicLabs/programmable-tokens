use aiken/collection/list
use cardano/address.{Inline, Script, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use v1/types.{RegistryDatum, ThirdParty, Transfer, TransferAction}
use v1/utils

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

    expect Some(Inline(VerificationKey(owner))) =
      ownIn.output.address.stake_credential

    expect [lovelace, ..tailPolicies] = assets.policies(ownIn.output.value)

    // trace tailPolicies
    when r is {
      // registry nodes need to be in lexOrder to map with policyList
      Transfer { registryNodes } -> {
        let nodes =
          list.map(
            registryNodes,
            fn(index) { list.at(tx.reference_inputs, index) },
          )

        and {
          utils.registryPolicies(nodes, tailPolicies, tx.withdrawals),
          // account owner signs Tx
          list.has(tx.extra_signatories, owner)?,
        }
      }
      ThirdParty { registryNodes } -> {
        let nodes =
          list.map(
            registryNodes,
            fn(index) { list.at(tx.reference_inputs, index) },
          )

        and {
          utils.registryPolicies(nodes, tailPolicies, tx.withdrawals),
          // account owner signs Tx
          list.has(tx.extra_signatories, owner)?,
        }
      }
    }
  }

  else(_) {
    fail
  }
}
