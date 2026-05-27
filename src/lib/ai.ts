export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('app:anthropicApiKey');
}

interface SuggestBulletsContext {
  title: string;
  company: string;
  existingBullets: string[];
}

export async function suggestBullets(
  apiKey: string,
  context: SuggestBulletsContext
): Promise<string[]> {
  const existingPart =
    context.existingBullets.length > 0
      ? `\nExisting bullets:\n${context.existingBullets.map((b) => `- ${b}`).join('\n')}`
      : '';

  const content =
    `Generate 3 strong resume bullet points for this role.\nTitle: ${context.title}\nCompany: ${context.company}${existingPart}\n\nReturn exactly 3 bullets, one per line, each starting with a strong action verb. Use metrics and impact where possible. No numbering, no extra text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Anthropic API error ${response.status}: ${errorText || response.statusText}`
    );
  }

  const json = await response.json() as { content?: Array<{ text?: string }> };
  const raw = json.content?.[0]?.text ?? '';

  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 3);
}
