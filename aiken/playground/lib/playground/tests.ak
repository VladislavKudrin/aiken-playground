use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference}

pub fn vkey(hash: ByteArray) -> VerificationKeyHash {
  let vkey = crypto.blake2b_224(hash)
  vkey
}

pub fn oref(txHash: ByteArray, index: Int) {
  let oref = OutputReference { transaction_id: txHash, output_index: index }
  oref
}
