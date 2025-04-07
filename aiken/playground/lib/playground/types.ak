use aiken/crypto.{VerificationKeyHash}

pub type LockRedeemer {
  Unlock
}

pub type LockDatum {
  owner: VerificationKeyHash,
}
