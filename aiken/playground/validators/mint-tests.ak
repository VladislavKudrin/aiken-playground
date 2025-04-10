use cardano/transaction.{Transaction, placeholder}
use mint
use playground/tests as t
use playground/types.{Burn, Mint}

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
