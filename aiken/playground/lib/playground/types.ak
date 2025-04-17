use aiken/crypto.{VerificationKeyHash}

pub const prefix_100: ByteArray = #"000643b0"

pub const prefix_222: ByteArray = #"000de140"

pub type LockRedeemer {
  Unlock
}

pub type MintRedeemer {
  Mint
  Burn
  Edit
}

pub type LockDatum {
  owner: VerificationKeyHash,
}
