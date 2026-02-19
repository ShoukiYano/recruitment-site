import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "利用規約 | AI採用プラットフォーム",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-sm text-gray-500 mb-10">最終更新日：2024年1月1日</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第1条　適用範囲</h2>
            <p>
              本利用規約（以下「本規約」）は、当社が提供する求人情報提供サービス（以下「本サービス」）の
              利用に関する条件を定めるものです。本サービスを利用するすべての方（求職者・採用企業担当者）に適用されます。
              本サービスを利用した時点で、本規約に同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第2条　禁止事項</h2>
            <p className="mb-2">利用者は以下の行為を行ってはなりません。</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>虚偽の情報を登録・掲載する行為</li>
              <li>他人になりすます行為</li>
              <li>本サービスのデータを無断でスクレイピング・複製・転用する行為</li>
              <li>スパムメッセージの送信</li>
              <li>反社会的勢力による利用</li>
              <li>採用目的以外での求職者情報の利用</li>
              <li>差別的・誹謗中傷を含む求人の掲載</li>
              <li>法令または公序良俗に違反する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>その他当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第3条　知的財産権</h2>
            <p>
              本サービス上のコンテンツ（デザイン・ロゴ・テキスト・ソフトウェア等）の著作権その他知的財産権は、
              当社または掲載企業に帰属します。無断転載・複製・改変・再配布を禁止します。
              求職者がアップロードした応募書類等の著作権は求職者本人に帰属します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第4条　免責事項</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>掲載求人情報の正確性・完全性について、当社は保証しません</li>
              <li>採用成立・内定獲得を保証するものではありません</li>
              <li>掲載企業と求職者間のトラブルについて、当社は責任を負いません</li>
              <li>システム障害・メンテナンスによるサービス停止について、当社は責任を負いません</li>
              <li>当社の故意または重大な過失による損害については、この限りではありません</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第5条　サービスの変更・終了</h2>
            <p>
              当社は、ユーザーへの事前通知なくサービス内容を変更・停止・終了することがあります。
              ただし、有料プランを利用中の場合は、原則として30日前に通知します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第6条　アカウントの停止・削除</h2>
            <p>
              当社は、利用者が本規約に違反した場合、事前通知なくアカウントを停止または削除することができます。
              違反行為による損害については、利用者が賠償責任を負うものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第7条　準拠法・管轄裁判所</h2>
            <p>
              本規約は日本法に準拠します。本サービスに関する紛争については、
              東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第8条　お問い合わせ</h2>
            <p>
              本規約に関するお問い合わせは、サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
