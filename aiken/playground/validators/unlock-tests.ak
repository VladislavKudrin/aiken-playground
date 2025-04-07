use cardano/transaction.{Transaction, placeholder}
use playground/tests as t
use playground/types.{LockDatum, Unlock}
use unlock

test unlock() {
  let ownerVkey = t.vkey(#"beef")
  let redeemer = Unlock

  let lockDatum = LockDatum { owner: ownerVkey }
  let outRef = t.oref(#"face", 1)

  let tx = Transaction { ..placeholder, extra_signatories: [ownerVkey] }
  unlock.unlock.spend(Some(lockDatum), redeemer, outRef, tx)
}
