import JSZip from 'jszip';

/**
 * Extract visible text from each slide of a .pptx file (best-effort, client-side).
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<string[]>} One string per slide (may be empty)
 */
export async function extractPptxSlideTexts(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/i)?.[1] || '0', 10);
      const nb = parseInt(b.match(/slide(\d+)/i)?.[1] || '0', 10);
      return na - nb;
    });

  const slides = [];
  for (const path of slideFiles) {
    const xml = await zip.file(path).async('string');
    const texts = [];
    const re = /<a:t[^>]*>([^<]*)<\/a:t>/g;
    let m = re.exec(xml);
    while (m) {
      if (m[1].trim()) texts.push(m[1]);
      m = re.exec(xml);
    }
    slides.push(texts.join(' ').replace(/\s+/g, ' ').trim());
  }

  return slides.length ? slides : [''];
}
