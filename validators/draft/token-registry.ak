use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use draft/types.{
  BurnHead, RBurn, RInsert, RMint, RPrevious, RRemove, RegistryAction,
  RegistryDatum, RegistryMintAction,
}

validator tokenRegistry {
  mint(r: RegistryMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair(listName, listQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      RMint { policy, transfer, user, global } -> {
        expect Some(registryOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                out.address.payment_credential == Script(p),
                assets.without_lovelace(out.value) == assets.from_asset(
                  p,
                  listName,
                  1,
                ),
              }
            },
          )

        expect InlineDatum(datum) = registryOut.datum
        expect rDatum: RegistryDatum = datum

        and {
          listQty == 1,
          rDatum.tokenPolicy == policy,
          rDatum.nextTokenPolicy == "",
          rDatum.transferManagerHash == transfer,
          rDatum.userStateManagerHash == user,
          rDatum.globalStatePolicy == global,
        }
      }
      RBurn -> listQty == -1
    }
  }

  spend(
    dat: Option<RegistryDatum>,
    r: RegistryAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(ownInput) =
      list.find(tx.inputs, fn(input) { input.output_reference == oref })

    expect Script(ownHash) = ownInput.output.address.payment_credential

    expect Some(d) = dat

    when r is {
      RInsert -> {
        // new list element
        expect [Pair(newTokenName, 1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()
        // original element output
        expect Some(listOut) =
          list.find(
            tx.outputs,
            fn(output) {
              assets.without_lovelace(output.value) == assets.without_lovelace(
                ownInput.output.value,
              )
            },
          )
        expect InlineDatum(datum) = listOut.datum
        expect outDatum: RegistryDatum = datum

        // new element output
        expect Some(newOut) =
          list.find(
            tx.outputs,
            fn(output) {
              dict.to_pairs(assets.tokens(output.value, ownHash)) == [
                Pair(newTokenName, 1),
              ]
            },
          )
        expect InlineDatum(datum) = newOut.datum
        expect newDatum: RegistryDatum = datum

        and {
          newDatum.nextTokenPolicy == "",
          newDatum.tokenPolicy == newTokenName,
          outDatum.nextTokenPolicy == newTokenName,
          d.tokenPolicy == outDatum.tokenPolicy,
          d.transferManagerHash == outDatum.transferManagerHash,
          d.userStateManagerHash == outDatum.userStateManagerHash,
          d.globalStatePolicy == outDatum.globalStatePolicy,
        }
      }
      RRemove -> {
        // remove an element from the list
        // check input has 1 token of our policy
        expect [Pair(tokenName, 1)] =
          ownInput.output.value
            |> assets.tokens(ownHash)
            |> dict.to_pairs()
        // check we are burning one token
        expect [Pair(burnName, -1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()
        // find another input
        expect Some(prevNode) =
          list.find(
            tx.inputs,
            fn(input) {
              input.output.address.payment_credential == Script(ownHash) && oref != input.output_reference
            },
          )

        expect InlineDatum(datum) = prevNode.output.datum
        expect prevDatum: RegistryDatum = datum
        expect prevDatum.nextTokenPolicy == burnName

        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(output) {
              and {
                output.value == prevNode.output.value,
                output.address.payment_credential == Script(ownHash),
              }
            },
          )

        expect InlineDatum(datum) = ownOut.datum
        expect newDatum: RegistryDatum = datum

        and {
          tokenName == burnName,
          newDatum.nextTokenPolicy == d.nextTokenPolicy,
          newDatum.transferManagerHash == prevDatum.transferManagerHash,
          newDatum.userStateManagerHash == prevDatum.userStateManagerHash,
          newDatum.globalStatePolicy == prevDatum.globalStatePolicy,
        }
      }
      RPrevious -> {
        // this is for the prevNode of the list to update it when you are removing one
        expect Some(nextNode) =
          list.find(
            tx.inputs,
            fn(input) {
              input.output.address.payment_credential == Script(ownHash) && oref != input.output_reference
            },
          )

        expect InlineDatum(datum) = nextNode.output.datum
        expect nextDatum: RegistryDatum = datum

        expect [Pair(nextName, 1)] =
          nextNode.output.value
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        expect [Pair(burnName, -1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        expect Some(ownOut) =
          list.find(
            tx.outputs,
            fn(output) { output.address.payment_credential == Script(ownHash) },
          )
        expect InlineDatum(datum) = ownOut.datum
        expect outDatum: RegistryDatum = datum

        and {
          ownOut.value == ownInput.output.value,
          nextDatum.nextTokenPolicy == outDatum.nextTokenPolicy,
          outDatum.tokenPolicy == d.tokenPolicy,
          outDatum.transferManagerHash == d.transferManagerHash,
          outDatum.userStateManagerHash == d.userStateManagerHash,
          outDatum.globalStatePolicy == d.globalStatePolicy,
          nextName == d.nextTokenPolicy,
          nextName == burnName,
        }
      }
      BurnHead -> {
        expect [Pair(tokenName, 1)] =
          ownInput.output.value
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        // check we are burning one token
        expect [Pair(burnName, -1)] =
          tx.mint
            |> assets.tokens(ownHash)
            |> dict.to_pairs()

        and {
          tokenName == burnName,
          d.nextTokenPolicy == "",
        }
      }
    }
  }

  else(_) {
    fail
  }
}
