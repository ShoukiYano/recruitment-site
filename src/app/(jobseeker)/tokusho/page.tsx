import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | AI採用プラットフォーム",
}

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">特定商取引法に基づく表記</h1>
        <p className="text-sm text-gray-500 mb-10">最終更新日：2024年1月1日</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 w-40 align-top">
                  事業者名
                </th>
                <td className="px-6 py-4 text-gray-800">
                  【運営会社名】※ご登録後にご確認いただけます
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  代表者名
                </th>
                <td className="px-6 py-4 text-gray-800">
                  【代表者名】
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  所在地
                </th>
                <td className="px-6 py-4 text-gray-800">
                  【住所】
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  電話番号
                </th>
                <td className="px-6 py-4 text-gray-800">
                  【電話番号】<br />
                  <span className="text-gray-500 text-xs">受付時間：平日 10:00〜17:00（土日祝除く）</span>
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  メールアドレス
                </th>
                <td className="px-6 py-4 text-gray-800">
                  【メールアドレス】
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  サービス内容
                </th>
                <td className="px-6 py-4 text-gray-800">
                  求人情報提供サービス（募集情報等提供事業）<br />
                  採用企業向け求人掲載・応募者管理プラットフォームの提供
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  料金
                </th>
                <td className="px-6 py-4 text-gray-800">
                  <p>求職者：無料</p>
                  <p className="mt-1">採用企業向け有料プラン（税込）：</p>
                  <ul className="mt-1 space-y-1 text-gray-700">
                    <li>スタータープラン：¥33,000/月</li>
                    <li>ビジネスプラン：¥110,000/月</li>
                    <li>エンタープライズプラン：要お問い合わせ</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  支払方法
                </th>
                <td className="px-6 py-4 text-gray-800">
                  クレジットカード決済・銀行振込
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  支払時期
                </th>
                <td className="px-6 py-4 text-gray-800">
                  クレジットカード：ご利用月の翌月カード会社指定日<br />
                  銀行振込：請求書発行後30日以内
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  サービス提供時期
                </th>
                <td className="px-6 py-4 text-gray-800">
                  お申し込み確認後、即日〜3営業日以内にアカウントを発行します
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  解約・返金
                </th>
                <td className="px-6 py-4 text-gray-800">
                  月途中の解約は翌月末日をもってサービス終了となります。<br />
                  日割り計算による返金はいたしません。<br />
                  解約はマイページまたはお問い合わせフォームよりお申し込みください。
                </td>
              </tr>
              <tr>
                <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-600 align-top">
                  動作環境
                </th>
                <td className="px-6 py-4 text-gray-800">
                  最新版のChrome・Firefox・Safari・Edge（インターネット接続環境が必要）
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          ※【】内の情報は正式リリース前に更新されます。ご不明な点はお問い合わせください。
        </p>
      </div>
    </div>
  )
}
