use aiken/collection/dict
use aiken/primitive/bytearray
use aiken/primitive/string
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use playground/types.{Burn, Mint, MintRedeemer}

validator mint {
  mint(r: MintRedeemer, p: PolicyId, tx: Transaction) {
    let Transaction { mint, .. } = tx

    expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    trace @"Minting Tokens:"
    trace string.concat(
      string.concat(bytearray.to_hex(asset_name), string.from_bytearray(" ")),
      string.from_int(amount),
    )

    when r is {
      Mint -> amount >= 1
      Burn -> amount <= -1
    }
  }

  else(_) {
    fail
  }
}
