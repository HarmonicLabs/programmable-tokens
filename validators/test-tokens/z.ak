use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}

validator testTokens(_boot: Int) {
  mint(_r: Data, _p: PolicyId, _tx: Transaction) {
    True
  }

  withdraw(_r: Data, _c: Data, _tx: Transaction) {
    True
  }

  else(_) {
    fail
  }
}
