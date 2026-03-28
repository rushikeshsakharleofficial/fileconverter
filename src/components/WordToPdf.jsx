import { useState } from 'react';
import mammoth from 'mammoth';
import DropZone from './DropZone';
import ToolProgressBar from './ToolProgressBar';
import formatSize from '../utils/formatSize';
import { htmlToPdfBytes } from '../utils/htmlToPdf';

const WordToPdf = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (files) => {
    if (!files.length) return;
    const f = files[0];
    const n = f.name.toLowerCase();
    if (!n.endsWith('.docx') && f.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('Please upload a .docx file. Legacy .doc is not supported in the browser.');
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
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
      const wrapped = `<div class="doc-root">${html || '<p>(Empty document)</p>'}</div>`;
      const styled = `
        <style>
          .doc-root h1{font-size:1.75rem;margin:0.75em 0 0.35em;}
          .doc-root h2{font-size:1.4rem;margin:0.65em 0 0.3em;}
          .doc-root p{margin:0.4em 0;}
          .doc-root table{border-collapse:collapse;width:100%;margin:0.5em 0;}
          .doc-root td,.doc-root th{border:1px solid #ddd;padding:6px;}
        </style>
        ${wrapped}
      `;
      const bytes = await htmlToPdfBytes(styled);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, '')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to convert document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="tool-info-bar">
        <p className="tool-info-desc">
          Convert Word (.docx) to PDF in your browser. Layout is approximated from the document structure.
        </p>
        <div className="tool-feats">
          <span className="tool-feat hi">📝 DOCX → PDF</span>
          <span className="tool-feat ok">✓ 100% private</span>
          <span className="tool-feat ok">✓ No upload</span>
        </div>
      </div>

      <DropZone
        onFiles={handleFiles}
        multiple={false}
        maxFiles={1}
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        label="Drop a .docx file here — or click to browse"
      />

      {file && (
        <div className="tool-info-bar fade-in" style={{ marginTop: '1rem' }}>
          <p className="tool-info-desc">{file.name} ({formatSize(file.size)})</p>
          <button type="button" className="btn btn-primary" onClick={convert} disabled={isProcessing}>
            {isProcessing ? 'Converting…' : 'Download PDF'}
          </button>
          <ToolProgressBar active={isProcessing} label="Converting to PDF…" />
        </div>
      )}

      {error && <p className="text-danger" style={{ marginTop: '0.9rem', fontWeight: 600 }}>{error}</p>}
    </div>
  );
};

export default WordToPdf;
