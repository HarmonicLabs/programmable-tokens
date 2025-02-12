validator account {
  spend(_d: Option<Data>, r: TransferAction, oref: OutputReference, tx: Transaction) {
    expect Some(ownIn) =
      list.find(tx.inputs, fn(in) { in.output_reference == oref })

    let ownHash = ownIn.output.address.payment_credential
    expect Some(Inline(VerificationKey(owner))) =
      ownIn.output.address.stake_credential

    when r is {
      Transfer { registryNodes } ->
        list.all(
          registryNodes,
          fn(index) {
            // Get our registry RefInput && Datum
            expect Some(registryRef) = list.at(tx.reference_inputs, index)
            expect InlineDatum(datum) = registryRef.output.datum
            expect rDatum: RegistryDatum = datum

            list.has(tx.withdrawals, Pair(rDatum.transferManager, 0)),
          },
        )

      ThirdParty { registryNodes } ->
        list.all(
          registryNodes,
          fn(index) {
            // Get our registry RefInput && Datum
            expect Some(registryRef) = list.at(tx.reference_inputs, index)
            expect InlineDatum(datum) = registryRef.output.datum
            expect rDatum: RegistryDatum = datum

            list.has(tx.withdrawals, Pair(rDatum.thirdPartyAction, 0))
          },
        )
    }
  }

  else(_) {
    fail
  }
}
