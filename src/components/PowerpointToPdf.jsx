import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import DropZone from './DropZone';
import formatSize from '../utils/formatSize';
import { extractPptxSlideTexts } from '../utils/pptxExtractText';

const wrapLines = (text, maxChars) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
};

const PowerpointToPdf = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (files) => {
    if (!files.length) return;
    const f = files[0];
    const n = f.name.toLowerCase();
    if (!n.endsWith('.pptx') && f.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      setError('Please upload a .pptx file.');
      return;
    }
    setFile(f);
    setError(null);
  };

  const convert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const slides = await extractPptxSlideTexts(buf);
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const size = 11;
      const lineHeight = size * 1.35;
      const margin = 50;
      const maxChars = 95;

      slides.forEach((raw, idx) => {
        const text = raw.trim() || '(No text found on this slide — charts and images are not extracted.)';
        const page = pdf.addPage();
        const { height } = page.getSize();
        const lines = wrapLines(text, maxChars);
        const titleSize = size + 2;
        page.drawText(`Slide ${idx + 1}`, {
          x: margin,
          y: height - margin * 0.75,
          size: titleSize,
          font,
          color: rgb(0.15, 0.2, 0.3),
        });
        let y = height - margin * 1.35 - titleSize;
        for (const line of lines) {
          if (y < margin) break;
          page.drawText(line, { x: margin, y, size, font, color: rgb(0.1, 0.1, 0.12) });
          y -= lineHeight;
        }
      });

      const bytes = await pdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, '')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to convert presentation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="tool-info-bar">
        <p className="tool-info-desc">
          Convert PowerPoint (.pptx) to PDF. This extracts slide text in your browser. Visual slides, charts, and images are not rendered — only text content.
        </p>
        <div className="tool-feats">
          <span className="tool-feat hi">📊 PPTX → PDF</span>
          <span className="tool-feat inf">Text-based export</span>
          <span className="tool-feat ok">✓ 100% private</span>
        </div>
      </div>

      <DropZone
        onFiles={handleFiles}
        multiple={false}
        maxFiles={1}
        accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        label="Drop a .pptx file here — or click to browse"
      />

      {file && (
        <div className="tool-info-bar fade-in" style={{ marginTop: '1rem' }}>
          <p className="tool-info-desc">{file.name} ({formatSize(file.size)})</p>
          <button type="button" className="btn btn-primary" onClick={convert} disabled={isProcessing}>
            {isProcessing ? 'Converting…' : 'Download PDF'}
          </button>
        </div>
      )}

      {error && <p className="text-danger" style={{ marginTop: '0.9rem', fontWeight: 600 }}>{error}</p>}
    </div>
  );
};

export default PowerpointToPdf;
