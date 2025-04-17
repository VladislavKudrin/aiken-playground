use aiken/primitive/bytearray
use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use mint
use playground/tests as t
use playground/types.{Burn, Edit, Mint, prefix_100, prefix_222}

test mint() {
  let redeemer = Mint
  let policy = #"f4c9f9c4252d86702c2f4c2e49e6648c7cffe3c8f2b6b7d779788f50"
  let assetName = #"deed"
  let asset = t.makeAsset(policy, assetName, 100)
  let tx = Transaction { ..placeholder, mint: asset }
  mint.mint.mint(redeemer, policy, tx)
}

test burn() {
  let redeemer = Burn
  let policy = #"f4c9f9c4252d86702c2f4c2e49e6648c7cffe3c8f2b6b7d779788f50"
  let assetName = #"deed"
  let asset = t.makeAsset(policy, assetName, -10)
  let tx = Transaction { ..placeholder, mint: asset }
  mint.mint.mint(redeemer, policy, tx)
}

test mint68() {
  let ownerHash = t.vkey(#"beef")

  let redeemer = Mint
  let policy = #"f4c9f9c4252d86702c2f4c2e49e6648c7cffe3c8f2b6b7d779788f50"
  let assetName = #"deed"
  let refAsset = t.makeAsset(policy, bytearray.concat(prefix_100, assetName), 1)
  let userAsset =
    t.makeAsset(policy, bytearray.concat(prefix_222, assetName), 1)
  let tx =
    Transaction {
      ..placeholder,
      mint: assets.merge(refAsset, userAsset),
      extra_signatories: [ownerHash],
    }
  mint.mint68.mint(ownerHash, redeemer, policy, tx)
}

test burn68() {
  let ownerHash = t.vkey(#"beef")
  let redeemer = Burn
  let policy = #"f4c9f9c4252d86702c2f4c2e49e6648c7cffe3c8f2b6b7d779788f50"
  let assetName = #"deed"
  let refAsset =
    t.makeAsset(policy, bytearray.concat(prefix_100, assetName), -1)
  let userAsset =
    t.makeAsset(policy, bytearray.concat(prefix_222, assetName), -1)
  let tx =
    Transaction {
      ..placeholder,
      mint: assets.merge(refAsset, userAsset),
      extra_signatories: [ownerHash],
    }
  mint.mint68.mint(ownerHash, redeemer, policy, tx)
}

test edit68() {
  let ownerHash = t.vkey(#"beef")
  let redeemer = Edit
  let policy = #"f4c9f9c4252d86702c2f4c2e49e6648c7cffe3c8f2b6b7d779788f50"
  let scriptAddress = t.scriptAddress(policy)
  let scriptOref = t.oref(#"beef", 0)

  let assetName = #"deed"
  let refAsset = t.makeAsset(policy, bytearray.concat(prefix_100, assetName), 1)

  let datum = NoDatum
  let oldTokenDatum = "oldCIP68Datum"
  let newTokenDatum = "newCIP68Datum"

  let scriptInput =
    t.input(
      scriptOref,
      t.output(scriptAddress, refAsset, InlineDatum(oldTokenDatum)),
    )
  let scriptOut = t.output(scriptAddress, refAsset, InlineDatum(newTokenDatum))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [scriptInput],
      outputs: [scriptOut],
      extra_signatories: [ownerHash],
    }
  mint.mint68.spend(ownerHash, Some(datum), redeemer, scriptOref, tx)
}
