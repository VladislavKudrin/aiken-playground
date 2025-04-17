use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
// use aiken/primitive/bytearray
// use aiken/primitive/string
use cardano/assets.{PolicyId}
use cardano/transaction.{Datum, InlineDatum, OutputReference, Transaction}
use playground/helpers as h
use playground/types.{Burn, Edit, Mint, MintRedeemer}

validator mint {
  mint(r: MintRedeemer, p: PolicyId, tx: Transaction) {
    let Transaction { mint, .. } = tx

    expect [Pair(_asset_name, amount)] =
      mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    // trace @"Minting Tokens:"
    // trace string.concat(
    //   string.concat(bytearray.to_hex(asset_name), string.from_bytearray(" ")),
    //   string.from_int(amount),
    // )
    when r is {
      Mint -> amount >= 1
      Burn -> amount <= -1
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

validator mint68(owner: VerificationKeyHash) {
  mint(r: MintRedeemer, p: PolicyId, tx: Transaction) {
    let Transaction { mint, .. } = tx

    expect [
      Pair(_ref_asset_name, ref_amount), Pair(_nft_asset_name, nft_amount),
    ] =
      mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    expect h.tx_signed_by(tx, owner)
    when r is {
      Mint -> and {
          ref_amount == 1,
          nft_amount == 1,
        }
      Burn -> and {
          ref_amount == -1,
          nft_amount == -1,
        }
      _ -> False
    }
  }

  spend(
    _d: Option<Datum>,
    r: MintRedeemer,
    oref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { inputs, outputs, mint, .. } = tx

    expect h.tx_signed_by(tx, owner)
    when r is {
      Edit -> {
        expect Some(ownInput) =
          list.find(inputs, fn(input) { input.output_reference == oref })

        let ownHash = ownInput.output.address.payment_credential

        expect Some(ownOutput) =
          list.find(
            outputs,
            fn(output) {
              output.address.payment_credential == ownHash && assets.without_lovelace(
                output.value,
              ) == assets.without_lovelace(ownInput.output.value)
            },
          )

        expect InlineDatum(_datum) = ownOutput.datum
        True
      }
      Burn -> {
        expect Some(ownInput) =
          list.find(inputs, fn(input) { input.output_reference == oref })

        expect Some(p) =
          assets.policies(assets.without_lovelace(ownInput.output.value))
            |> list.head()

        expect [
          Pair(_ref_asset_name, ref_amount), Pair(_nft_asset_name, nft_amount),
        ] =
          mint
            |> assets.tokens(p)
            |> dict.to_pairs()

        and {
          ref_amount == -1,
          nft_amount == -1,
        }
      }

      _ -> False
    }
  }

  else(_) {
    fail
  }
}
