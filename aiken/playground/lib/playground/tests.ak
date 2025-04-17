use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{Value}
use cardano/transaction.{Datum, Input, Output, OutputReference}

pub fn vkey(hash: ByteArray) -> VerificationKeyHash {
  let vkey = crypto.blake2b_224(hash)
  vkey
}

pub fn oref(txHash: ByteArray, index: Int) {
  let oref = OutputReference { transaction_id: txHash, output_index: index }
  oref
}

pub fn makeAsset(
  policyId: ByteArray,
  assetName: ByteArray,
  quantity: Int,
) -> Value {
  let asset = assets.from_asset(policyId, assetName, quantity)

  asset
}

pub fn scriptAddress(hash: ByteArray) -> Address {
  let address =
    Address { payment_credential: Script(hash), stake_credential: None }

  address
}

pub fn output(addr: Address, value: Value, datum: Datum) -> Output {
  let output = Output { address: addr, value, datum, reference_script: None }

  output
}

pub fn input(oref: OutputReference, output: Output) -> Input {
  let input = Input { output_reference: oref, output }

  input
}
