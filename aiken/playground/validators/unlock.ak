use aiken/primitive/bytearray
use cardano/transaction.{OutputReference, Transaction}
use playground/helpers as helpers
use playground/types.{LockDatum, LockRedeemer, Unlock}

validator unlock {
  spend(
    datum: Option<LockDatum>,
    redeemer: LockRedeemer,
    _utxo: OutputReference,
    self: Transaction,
  ) {
    let Unlock = redeemer
    expect Some(LockDatum { owner }) = datum
    trace bytearray.to_hex(owner)
    helpers.tx_signed_by(self, owner)
  }

  else(_) {
    fail
  }
}
