export const scoreColor = (s) =>
  s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : s >= 30 ? '#F97316' : '#EF4444';

export function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.id = id;
    s.onload = resolve; s.onerror = reject;
    document.body.appendChild(s);
  });
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    if (!window.pdfjsLib) throw new Error('PDF.js not loaded');
    const ab = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((s) => s.str).join(' ') + '\n';
    }
    return text;
  }
  if (ext === 'docx' || ext === 'doc') {
    if (!window.mammoth) throw new Error('Mammoth not loaded');
    const ab = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: ab });
    return result.value;
  }
  throw new Error('Unsupported format');
}

export function extractJSON(raw) {
  let clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1) throw new Error('No JSON found');
  return JSON.parse(clean.slice(start, end + 1));
}
