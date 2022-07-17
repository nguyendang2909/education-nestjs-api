export enum EPaymentMethod {
  MoneyTransfer = 'moneyTransfer',
  Momo = 'momo',
  Direct = 'direct',
}

export enum EOrderStatus {
  // WaitForConfirmation = 'waitForConfirmation',
  WaitForPayment = 'waitForPayment',
  Cancel = 'cancel',
  Success = 'success',
}
