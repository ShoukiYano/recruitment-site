/**
 * 請求書のHTMLコンテンツを生成（印刷用）
 * ブラウザでの印刷またはPDF保存を想定
 */
export function generateInvoiceHTML(invoice: any, tenant: any, plan: any): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>請求書 ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; padding: 40px; }
    h1 { text-align: center; }
    .info { display: flex; justify-content: space-between; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .total { font-weight: bold; }
    .bank-info { margin-top: 20px; padding: 15px; background: #f9f9f9; }
  </style>
</head>
<body>
  <h1>請 求 書</h1>
  <div class="info">
    <div>
      <p>請求書番号: ${invoice.invoiceNumber}</p>
      <p>発行日: ${new Date(invoice.issuedAt).toLocaleDateString("ja-JP")}</p>
      <p>支払期限: ${new Date(invoice.dueAt).toLocaleDateString("ja-JP")}</p>
    </div>
    <div>
      <p><strong>${tenant.name} 御中</strong></p>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>内容</th><th>金額</th></tr>
    </thead>
    <tbody>
      <tr><td>${plan.name}プラン（${new Date(invoice.billingPeriodStart).toLocaleDateString("ja-JP")} ～ ${new Date(invoice.billingPeriodEnd).toLocaleDateString("ja-JP")}）</td><td>&yen;${invoice.subtotal.toLocaleString()}</td></tr>
    </tbody>
    <tfoot>
      <tr><td>小計</td><td>&yen;${invoice.subtotal.toLocaleString()}</td></tr>
      <tr><td>消費税（10%）</td><td>&yen;${invoice.tax.toLocaleString()}</td></tr>
      <tr class="total"><td>合計</td><td>&yen;${invoice.total.toLocaleString()}</td></tr>
    </tfoot>
  </table>
  <div class="bank-info">
    <h3>お振込先</h3>
    <p>${process.env.BANK_NAME || "〇〇銀行"} ${process.env.BANK_BRANCH || "〇〇支店"}</p>
    <p>${process.env.BANK_ACCOUNT_TYPE || "普通"} ${process.env.BANK_ACCOUNT_NUMBER || "1234567"}</p>
    <p>口座名義: ${process.env.BANK_ACCOUNT_NAME || "カ）〇〇〇〇"}</p>
  </div>
</body>
</html>`
}
