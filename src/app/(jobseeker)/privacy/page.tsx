import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー | AI採用プラットフォーム",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mb-10">最終更新日：2024年1月1日</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第1条　基本方針</h2>
            <p>
              当社は、求人情報提供サービス（以下「本サービス」）を運営するにあたり、
              利用者（求職者・採用企業担当者）の個人情報を適切に取り扱うことを重要な責務と認識し、
              個人情報の保護に関する法律（個人情報保護法）その他関連法令を遵守します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第2条　取得する個人情報の項目</h2>
            <p className="mb-2">当社は、以下の個人情報を取得します。</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>氏名・フリガナ</li>
              <li>メールアドレス</li>
              <li>電話番号</li>
              <li>生年月日</li>
              <li>学歴・職歴・資格等の経歴情報</li>
              <li>自己PR・志望動機等の応募書類情報</li>
              <li>IPアドレス・CookieID・ブラウザ情報等のアクセスログ</li>
              <li>採用企業担当者の氏名・所属・連絡先</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第3条　個人情報の利用目的</h2>
            <p className="mb-2">取得した個人情報は、以下の目的のために利用します。</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>求人情報の提供・閲覧サービスの運営</li>
              <li>求職者から採用企業への応募情報の提供</li>
              <li>採用企業から求職者へのスカウトメッセージの送信</li>
              <li>会員登録・ログイン・アカウント管理</li>
              <li>お問い合わせ・サポート対応</li>
              <li>サービス改善のための統計分析</li>
              <li>不正利用の検知・防止</li>
              <li>法令に基づく対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第4条　第三者提供</h2>
            <p className="mb-2">
              当社は、以下の場合を除き、ご本人の同意なく個人情報を第三者に提供しません。
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>求職者が応募した採用企業への応募情報の提供（応募時に同意を取得）</li>
              <li>法令に基づく開示要請がある場合</li>
              <li>人の生命・身体・財産の保護のために必要な場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第5条　委託先・外部サービス</h2>
            <p className="mb-2">
              当社は、以下の外部サービスを利用しており、業務の一部を委託する場合があります。
              委託先には適切な安全管理を義務付けます。
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Supabase（データベース・認証）：米国サーバー利用</li>
              <li>Vercel（ウェブサーバー・ホスティング）：米国サーバー利用</li>
              <li>OpenAI（AI機能・応募評価）：米国サーバー利用。送信データは個人特定情報を含まない形で最小化</li>
            </ul>
            <p className="mt-2 text-sm text-gray-500">
              ※上記は海外サーバーを利用するため、個人情報の越境移転が発生します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第6条　保管期間・削除</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>応募データ：採用終了後1年間保管し、その後3年以内に削除</li>
              <li>会員データ：退会後6ヶ月間保管し、その後2年以内に削除</li>
              <li>監査ログ：3年間保管後に削除</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第7条　安全管理措置</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>通信の暗号化（TLS1.2以上）</li>
              <li>パスワードのハッシュ化保管</li>
              <li>ロールベースのアクセス制御</li>
              <li>操作ログの記録・保全</li>
              <li>従業員への定期的な個人情報保護教育</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第8条　ご本人の権利（開示・訂正・削除・利用停止）</h2>
            <p className="mb-2">
              ご本人は、当社が保有する個人情報について、以下の請求を行うことができます。
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>利用目的の通知</li>
              <li>開示</li>
              <li>訂正・追加・削除</li>
              <li>利用停止・消去</li>
              <li>第三者提供の停止</li>
            </ul>
            <p className="mt-3">
              請求はお問い合わせフォームよりご連絡ください。本人確認後、30日以内に対応いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第9条　Cookieおよびアクセス解析</h2>
            <p className="mb-2">
              当サービスでは、サービス改善・利便性向上のためCookieを使用します。
              初回アクセス時にCookie同意バナーが表示されます。
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>必須Cookie：ログイン状態の維持等、サービス提供に必要なもの（同意不要）</li>
              <li>分析Cookie：アクセス解析のため（同意が必要）</li>
            </ul>
            <p className="mt-2">
              ブラウザの設定からCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第10条　AI機能の利用</h2>
            <p>
              当サービスでは、OpenAI社のAPIを利用した応募書類の評価・マッチング機能を提供しています。
              AIによる評価はあくまで参考情報であり、採用判断はすべて採用企業が行います。
              AIに送信するデータは、氏名・連絡先等の個人特定情報を含まない形に加工しています。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第11条　お問い合わせ</h2>
            <p>
              個人情報の取り扱いに関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第12条　プライバシーポリシーの改定</h2>
            <p>
              本ポリシーは法令改正やサービス変更に伴い改定することがあります。
              重要な変更の場合はサービス内でお知らせします。改定後も継続してご利用いただいた場合は、
              改定後のポリシーに同意いただいたものとみなします。
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
