validator testTokens(boot: Int) {
  mint(_r: Data, _p: PolicyId, _tx: Transaction) {
    True
  }

  else(_) {
    fail
  }
}
