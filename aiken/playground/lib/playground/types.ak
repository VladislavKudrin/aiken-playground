use aiken/crypto.{VerificationKeyHash}

pub type LockRedeemer {
  Unlock
}

pub type MintRedeemer {
  Mint
  Burn
}

pub type LockDatum {
  owner: VerificationKeyHash,
}
