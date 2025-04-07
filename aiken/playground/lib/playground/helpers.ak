use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction}

pub fn tx_signed_by(tx: Transaction, pkh: VerificationKeyHash) {
  list.has(tx.extra_signatories, pkh)
}
