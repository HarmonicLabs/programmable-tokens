use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use draft/types.{GBurn, GMint, GlobalMintAction}

validator globalState(boot: OutputReference, owner: ByteArray) {
  // globalState refIn w scripts
  // references withdrawal scripts for various asset functions
  mint(r: GlobalMintAction, p: PolicyId, tx: Transaction) {
    expect [Pair("", supplyQty)] =
      tx.mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      GMint -> {
        expect Some(_bootIn) =
          list.find(tx.inputs, fn(in) { in.output_reference == boot })

        expect Some(globalOut) =
          list.find(
            tx.outputs,
            fn(out) {
              and {
                out.address.payment_credential == Script(p),
                assets.without_lovelace(out.value) == assets.from_asset(
                  p,
                  "",
                  1,
                ),
              }
            },
          )
        expect InlineDatum(datum) = globalOut.datum
        expect gDatum: Int = datum

        // 0 represents False
        gDatum == 0
      }
      // gDatum.actions == actions,
      GBurn -> and {
          supplyQty == -1,
          list.has(tx.extra_signatories, owner),
        }
    }
  }

  spend(dat: Option<Int>, r: Int, oref: OutputReference, tx: Transaction) {
    expect Some(d) = dat

    expect Some(ownInput) =
      list.find(tx.inputs, fn(input) { input.output_reference == oref })

    expect Some(ownOut) =
      list.find(
        tx.outputs,
        fn(out) {
          and {
            out.address.payment_credential == ownInput.output.address.payment_credential,
            assets.without_lovelace(ownInput.output.value) == assets.without_lovelace(
              out.value,
            ),
          }
        },
      )
    expect InlineDatum(datum) = ownOut.datum
    expect outDatum: Int = datum

    when r is {
      1 -> and {
          outDatum == 1,
          // outDatum.actions == d.actions,
          list.has(tx.extra_signatories, owner),
        }
      0 -> and {
          outDatum == 0,
          // outDatum.actions == d.actions,
          list.has(tx.extra_signatories, owner),
        }
      _ -> fail
    }
    // We dont need this as we are not using withdrawal scripts for actions
    // GUpdate { actions } -> and {
    //     outDatum.actions == actions,
    //     outDatum.freeze == d.freeze,
    //     list.has(tx.extra_signatories, owner),
    //   }
  }

  else(_) {
    fail
  }
}
