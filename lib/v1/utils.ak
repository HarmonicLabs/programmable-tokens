use aiken/builtin
use aiken/collection/list
use cardano/address.{Credential, Inline, Script, VerificationKey}
use cardano/assets.{Lovelace, PolicyId}
use cardano/transaction.{InlineDatum, Input, OutputReference, Transaction}
use v1/types.{RegistryDatum, ThirdParty, Transfer, TransferAction}

pub fn registryPolicies(
  withdrawals: Pairs<Credential, Lovelace>,
  reference: List<Input>,
  registryNodes: List<Int>,
  tailPolicies: List<PolicyId>,
) -> Bool {
  when registryNodes is {
    [] -> {
      expect [] = tailPolicies
      True
    }
    [rHead, ..rTail] -> {
      expect Some(input) = list.at(reference, rHead)
      expect [pHead, ..pTail] = tailPolicies
      // Get our registry Datum
      expect InlineDatum(datum) = input.output.datum
      expect rDatum: RegistryDatum = datum
      // policy matches registry
      expect pHead == rDatum.tokenPolicy
      // transferManager withdraws
      expect Some(data) =
        list.find(
          withdrawals,
          fn(index) {
            builtin.head_list(builtin.unconstr_fields(builtin.fst_pair(index))) == builtin.b_data(
              rDatum.transferManagerHash,
            )
          },
        )

      registryPolicies(withdrawals, reference, rTail, pTail)
    }
  }
}

pub fn registryStd(
  withdrawals: Pairs<Credential, Lovelace>,
  reference: List<Input>,
  registryNodes: List<Int>,
  tailPolicies: List<PolicyId>,
) -> Bool {
  when registryNodes is {
    [] -> {
      expect [] = tailPolicies
      True
    }
    [rHead, ..rTail] -> {
      expect Some(input) = list.at(reference, rHead)
      expect [pHead, ..pTail] = tailPolicies
      // Get our registry Datum
      expect InlineDatum(datum) = input.output.datum
      expect rDatum: RegistryDatum = datum
      // policy matches registry
      expect pHead == rDatum.tokenPolicy
      // transferManager withdraws
      expect list.has(withdrawals, Pair(Script(rDatum.transferManagerHash), 0))
      registryStd(withdrawals, reference, rTail, pTail)
    }
  }
}

pub fn registry2(
  withdrawals: List<Credential>,
  reference: List<Input>,
  registryNodes: List<Int>,
  tailPolicies: List<PolicyId>,
) -> Bool {
  when registryNodes is {
    [] -> {
      expect [] = tailPolicies
      True
    }
    [rHead, ..rTail] -> {
      expect Some(input) = list.at(reference, rHead)
      expect [pHead, ..pTail] = tailPolicies
      // Get our registry Datum
      expect InlineDatum(datum) = input.output.datum
      expect rDatum: RegistryDatum = datum
      // policy matches registry
      expect pHead == rDatum.tokenPolicy
      // transferManager withdraws
      expect Some(data) =
        list.find(
          withdrawals,
          fn(index) {
            builtin.head_list(builtin.unconstr_fields(index)) == builtin.b_data(
              rDatum.transferManagerHash,
            )
          },
        )
      registry2(withdrawals, reference, rTail, pTail)
    }
  }
}
