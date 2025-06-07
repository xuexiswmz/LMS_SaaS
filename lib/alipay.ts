import { AlipaySdk } from "alipay-sdk";

const alipaySdk = new AlipaySdk({
  appId: process.env.NEXT_PUBLIC_ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  signType: "RSA2",
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: process.env.NEXT_PUBLIC_ALIPAY_GATEWAY, // 网关地址
});

interface CreatePaymentParams {
  subject: string;
  outTradeNo: string;
  totalAmount: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export async function createAlipayPayment(params: CreatePaymentParams) {
  const bizContent = {
    subject: params.subject,
    out_trade_no: params.outTradeNo,
    total_amount: params.totalAmount,
    product_code: "FAST_INSTANT_TRADE_PAY", // 销售产品码，与支付宝签约的产品码保持一致
  };
  return await alipaySdk.exec("alipay.trade.page.pay", {
    bizContent,
    returnUrl: params.returnUrl,
    notifyUrl: params.notifyUrl,
  });
}

export async function verifyAlipayNotify(params: Record<string, string>) {
  return alipaySdk.checkNotifySign(params);
}
