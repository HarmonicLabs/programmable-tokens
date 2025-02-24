use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Inline, VerificationKey}
use cardano/assets
use cardano/transaction.{OutputReference, Transaction}
use v1/types.{ThirdParty, Transfer, TransferAction}
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

    expect [_lovelace, ..tailPolicies] = assets.policies(ownIn.output.value)

    let stakeHashes = pairs.keys(tx.withdrawals)

    when r is {
      Transfer { registryNodes } -> and {
          utils.registry2(
            stakeHashes,
            tx.reference_inputs,
            registryNodes,
            tailPolicies,
          ),
          // account owner signs Tx
          list.has(tx.extra_signatories, owner)?,
        }
      ThirdParty { registryNodes } ->
        utils.third2(
          stakeHashes,
          tx.reference_inputs,
          registryNodes,
          tailPolicies,
        )
    }
  }

  else(_) {
    fail
  }
}
