export interface IPayArgs {
    productIndex: 0 | 1 | 2;
    paymentType: "main" | "offer";
    paymentMethod: "quickPay" | "creditCard";
  }