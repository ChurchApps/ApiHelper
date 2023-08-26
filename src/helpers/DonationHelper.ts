export class DonationHelper {
  public static getTransactionFee(amount: number) {
    const fixedFee = 0.30;
    const fixedPercent = 0.029;
    return Math.round(((amount + fixedFee) / (1 - fixedPercent) - amount) * 100) / 100;
  }
}