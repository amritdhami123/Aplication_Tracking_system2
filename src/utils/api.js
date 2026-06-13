import { extractJSON } from './helpers.js';
const MODEL = 'claude-sonnet-4-20250514';
const buildPrompt = (resumeText, jobDesc) => `You are an expert ATS analyst. Return ONLY valid JSON, no markdown.
RESUME: ${resumeText.slice(0, 3000)}
JOB DESCRIPTION: ${jobDesc.slice(0, 2000)}
Return: {"ats_score":65,"verdict":"Good Match","verdict_desc":"summary","chips":["chip1","chip2","chip3"],"metrics":{"keyword_match":70,"skills_alignment":60,"experience_relevance":65,"format_ats_score":80},"keywords":{"found":["react"],"missing":["aws"],"partial":["js"]},"keyword_stats":{"total_jd_keywords":20,"matched_count":12,"missing_count":8,"match_percentage":60},"suggestions":[{"priority":"high","title":"Add keywords","detail":"Add AWS to skills.","category":"Keywords"},{"priority":"medium","title":"Quantify","detail":"Add numbers.","category":"Impact"}],"score_breakdown":[{"name":"Keyword Density","score":70,"color":"#10B981"},{"name":"Skills Coverage","score":60,"color":"#06B6D4"},{"name":"Experience Match","score":65,"color":"#7C3AED"},{"name":"ATS Formatting","score":80,"color":"#F59E0B"},{"name":"Role Alignment","score":55,"color":"#F97316"}],"detailed_analysis":"Full analysis here."}
Fill in REAL values. verdict must be one of: Exceptional Match, Strong Match, Good Match, Moderate Match, Needs Work. Give 5-7 suggestions.`;

export async function analyzeResume(resumeText, jobDesc, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: buildPrompt(resumeText, jobDesc) }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const raw = data.content.map((i) => i.text || '').join('');
  return extractJSON(raw);
}
