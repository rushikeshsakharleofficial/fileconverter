import { useState } from 'react';
import * as XLSX from 'xlsx';
import DropZone from './DropZone';
import formatSize from '../utils/formatSize';
import { htmlToPdfBytes } from '../utils/htmlToPdf';

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const ExcelToPdf = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (files) => {
    if (!files.length) return;
    const f = files[0];
    const n = f.name.toLowerCase();
    if (!/\.(xlsx|xls|csv)$/.test(n) && !f.type.includes('sheet') && !f.type.includes('csv')) {
      setError('Please upload .xlsx, .xls, or .csv.');
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
      const wb = XLSX.read(buf, { type: 'array' });
      let html =
        '<style>table{border-collapse:collapse;width:100%;font-size:12px;margin-bottom:1.25rem;}td,th{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;}th{background:#f1f5f9;font-weight:600;}h2{font-size:1.1rem;margin:0 0 0.5rem;color:#0f172a;}</style>';

      wb.SheetNames.forEach((name) => {
        const sheet = wb.Sheets[name];
        if (!sheet) return;
        html += `<h2>${escapeHtml(name)}</h2>`;
        html += XLSX.utils.sheet_to_html(sheet, { id: `s-${name}` });
      });

      if (!wb.SheetNames.length) {
        html += '<p>(No sheets found)</p>';
      }

      const bytes = await htmlToPdfBytes(html);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, '')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to convert spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="tool-info-bar">
        <p className="tool-info-desc">
          Convert Excel or CSV to a printable PDF. Each sheet becomes a section in the PDF.
        </p>
        <div className="tool-feats">
          <span className="tool-feat hi">📈 Sheet → PDF</span>
          <span className="tool-feat ok">✓ 100% private</span>
          <span className="tool-feat ok">✓ No upload</span>
        </div>
      </div>

      <DropZone
        onFiles={handleFiles}
        multiple={false}
        maxFiles={1}
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        label="Drop .xlsx, .xls, or .csv here — or click to browse"
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

export default ExcelToPdf;
