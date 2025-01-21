use aiken/collection/list
use cardano/address.{Inline, VerificationKey}
use cardano/assets.{PolicyId, Value}
use cardano/transaction.{Input, Output}

// returns a combined input value of a single policyId
pub fn foldPolicyIn(ins: List<Input>, policy: PolicyId) -> Value {
  let value =
    list.foldl(
      ins,
      assets.zero,
      fn(in, acc) { assets.merge(in.output.value, acc) },
    )
  assets.restricted_to(value, [policy])
}

// returns a combined output value of a single policyId
pub fn foldPolicyOut(outs: List<Output>, policy: PolicyId) -> Value {
  let value =
    list.foldl(outs, assets.zero, fn(out, acc) { assets.merge(out.value, acc) })
  assets.restricted_to(value, [policy])
}

// builtins.head(builtins.snd(builtins.unconstr_data(freezeFlag)))

pub fn txSignedByStake(inputs: List<Input>, sigs: List<ByteArray>) {
  let credList =
    list.filter_map(inputs, fn(in) { in.output.address.stake_credential })
  list.all(
    credList,
    fn(cred) {
      expect Inline(VerificationKey(hash)) = cred
      list.has(sigs, hash)
    },
  )
}

pub fn checkPayment(
  r: List<(Int, Int, Int)>,
  ins: List<Input>,
  outs: List<Output>,
  policy: ByteArray,
  validate: fn(Int, Int, Int, Int) -> Bool,
) -> Bool {
  let transferList =
    list.map(
      r,
      fn(index) {
        let (ownIx, recIx, amount) = index
        expect Some(ownOut) = list.at(outs, ownIx)
        expect Some(recOut) = list.at(outs, recIx)
        expect Some(ownIn) =
          list.find(ins, fn(in) { in.output.address == ownOut.address })
        (ownIn, ownOut, recOut, amount)
      },
    )

  list.all(
    transferList,
    fn(index) {
      let (ownIn, ownOut, recOut, amount) = index

      validate(
        assets.quantity_of(ownIn.output.value, policy, ""),
        assets.quantity_of(ownOut.value, policy, ""),
        assets.quantity_of(recOut.value, policy, ""),
        amount,
      )
    },
  )
}
