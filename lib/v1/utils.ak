use aiken/collection/list
use cardano/address.{Credential, Inline, Script, VerificationKey}
use cardano/assets.{Lovelace, PolicyId}
use cardano/transaction.{InlineDatum, Input, OutputReference, Transaction}
use v1/types.{RegistryDatum, ThirdParty, Transfer, TransferAction}

pub fn registryPolicies(
  registryNodes: List<Option<Input>>,
  tailPolicies: List<PolicyId>,
  withdrawals: Pairs<Credential, Lovelace>,
) -> Bool {
  when registryNodes is {
    [rHead] -> {
      expect Some(input) = rHead
      expect [pHead] = tailPolicies
      // Get our registry Datum
      expect InlineDatum(datum) = input.output.datum
      expect rDatum: RegistryDatum = datum
      // policy matches registry
      expect pHead == rDatum.tokenPolicy
      // transferManager withdraws
      list.has(withdrawals, Pair(Script(rDatum.transferManagerHash), 0))
    }
    [rHead, ..rTail] -> {
      expect Some(input) = rHead
      expect [pHead, ..pTail] = tailPolicies
      // Get our registry Datum
      expect InlineDatum(datum) = input.output.datum
      expect rDatum: RegistryDatum = datum
      // policy matches registry
      expect pHead == rDatum.tokenPolicy
      // transferManager withdraws
      expect list.has(withdrawals, Pair(Script(rDatum.transferManagerHash), 0))

      registryPolicies(rTail, pTail, withdrawals)
    }
    // }
    _ ->
      if list.length(tailPolicies) == 0 {
        True
      } else {
        False
      }
  }
}
