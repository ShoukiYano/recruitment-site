interface EvaluationPromptInput {
  job: { title: string; description: string; requirements: any; employmentType: string }
  application: { formData: any }
  weights: { skillMatch: number; experience: number; education: number; motivation: number; responseQuality: number }
  requiredSkills: string[]
}

export function buildEvaluationPrompt(input: EvaluationPromptInput): string {
  return `あなたは採用担当のエキスパートです。以下の求人情報と応募者情報を元に、応募者を評価してください。

## 求人情報
- 求人タイトル: ${input.job.title}
- 仕事内容: ${input.job.description}
- 応募資格: ${JSON.stringify(input.job.requirements, null, 2)}
- 必須スキル: ${input.requiredSkills.join(", ")}

## 応募者情報
${JSON.stringify(input.application.formData, null, 2)}

## 評価基準と重み
- スキルマッチ: ${input.weights.skillMatch}%
- 経験年数: ${input.weights.experience}%
- 学歴・資格: ${input.weights.education}%
- 志望動機: ${input.weights.motivation}%
- レスポンス品質: ${input.weights.responseQuality}%

## 出力形式（JSON）
{
  "score": <0-100の数値>,
  "breakdown": {
    "skillMatch": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "motivation": <0-100>,
    "responseQuality": <0-100>
  },
  "aiComment": "<採用担当者向けの評価コメント（日本語、200字以内）>"
}`
}
