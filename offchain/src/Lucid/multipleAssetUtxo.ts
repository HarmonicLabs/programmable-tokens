// const tx = await lucid
//   .newTx()
//   .readFrom([
//     aRegistryUtxo[0],
//     aGlobalUtxo[0],
//     aUser1StateUtxo[0],
//     aUser2StateUtxo[0],
//     bRegistryUtxo[0],
//     bGlobalUtxo[0],
//     bUser1StateUtxo[0],
//     bUser2StateUtxo[0]
//   ])
//   .collectFrom([aUtxo], transferAction)
//   .collectFrom([bUtxo], transferAction)
//   .pay.ToAddress(user1TransferAddress, { [aUnit]: 50n, [bUnit]: 50n })
//   .pay.ToAddress(user2TransferAddress, { [aUnit]: 50n, [bUnit]: 50n })
//   .attach.SpendingValidator(aTransfer.script)
//   .attach.SpendingValidator(bTransfer.script)
//   .withdraw(aTransferManager, 0n, aWithdrawRedeemer)
//   .withdraw(bTransferManager, 0n, bWithdrawRedeemer)
//   .attach.WithdrawalValidator(aTransfer.script)
//   .attach.WithdrawalValidator(bTransfer.script)
//   .addSignerKey(user1PKH)
//   .addSignerKey(user2PKH)
//   .complete()

// const user1Sign = await tx.partialSign.withWallet()
// const user2Sign = await tx.partialSign.withPrivateKey(user2SKey)

// const assembledTx = await tx.assemble([user1Sign, user2Sign]).complete();

// const submitTx = await assembledTx.submit()