import { useState, useEffect, useRef, useCallback } from 'react';
import heic2any from 'heic2any';
import JSZip from 'jszip';
import DropZone from './DropZone';
import FolderUpload from './FolderUpload';

const formats = [
  { value: 'image/png',    label: 'PNG',  ext: 'png'  },
  { value: 'image/jpeg',   label: 'JPEG', ext: 'jpg'  },
  { value: 'image/webp',   label: 'WebP', ext: 'webp' },
  { value: 'image/bmp',    label: 'BMP',  ext: 'bmp'  },
  { value: 'image/avif',   label: 'AVIF', ext: 'avif' },
  { value: 'image/x-icon', label: 'ICO',  ext: 'ico'  },
  { value: 'image/tiff',   label: 'TIFF', ext: 'tiff' },
];

const noQualityFormats = ['image/png', 'image/bmp', 'image/x-icon', 'image/tiff'];

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
};

const readFile = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

const loadImg = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = src;
});

const isHeic = (file) => {
  const name = file.name.toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif') ||
         file.type === 'image/heic' || file.type === 'image/heif';
};

const drawToCanvas = (img, fmt, resizeW, resizeH) => {
  const w = resizeW || img.naturalWidth;
  const h = resizeH || img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (fmt === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
};

const UniversalConverter = () => {
  const [files, setFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(92);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeW, setResizeW] = useState(512);
  const [resizeH, setResizeH] = useState(512);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressValue, setProgressValue] = useState(0);

  // Live preview state (first file only)
  const [livePreview, setLivePreview] = useState(null);
  const liveDebounce = useRef(null);
  const cachedImg = useRef(null);
  const cachedFile = useRef(null);

  useEffect(() => {
    return () => {
      results.forEach(r => {
        if (r.url) URL.revokeObjectURL(r.url);
        if (r.previewUrl && r.previewUrl.startsWith('blob:')) URL.revokeObjectURL(r.previewUrl);
      });
    };
  }, [results]);

  useEffect(() => {
    return () => { if (livePreview?.src?.startsWith('blob:')) URL.revokeObjectURL(livePreview.src); };
  }, [livePreview]);

  const renderLivePreview = useCallback(async (file, fmt, q, w, h) => {
    try {
      if (cachedFile.current !== file) {
        let src;
        if (isHeic(file)) {
          const pngBlob = await heic2any({ blob: file, toType: 'image/png', quality: 1 });
          src = URL.createObjectURL(Array.isArray(pngBlob) ? pngBlob[0] : pngBlob);
        } else {
          src = await readFile(file);
        }
        cachedImg.current = await loadImg(src);
        cachedFile.current = file;
      }
      const canvas = drawToCanvas(cachedImg.current, fmt, w, h);
      const qualityArg = noQualityFormats.includes(fmt) ? undefined : q / 100;
      let blob = await new Promise(res => canvas.toBlob(res, fmt, qualityArg));
      if (!blob) blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      setLivePreview(prev => {
        if (prev?.src?.startsWith('blob:')) URL.revokeObjectURL(prev.src);
        return { src: URL.createObjectURL(blob), size: blob.size, origSize: file.size };
      });
    } catch { /* skip */ }
  }, []);

  useEffect(() => {
    if (!files.length) { setLivePreview(null); return; }
    clearTimeout(liveDebounce.current);
    liveDebounce.current = setTimeout(
      () => renderLivePreview(files[0], outputFormat, quality, resizeEnabled ? resizeW : null, resizeEnabled ? resizeH : null),
      300
    );
    return () => clearTimeout(liveDebounce.current);
  }, [files, outputFormat, quality, resizeW, resizeH, resizeEnabled, renderLivePreview]);

  const getExt = () => (formats.find(f => f.value === outputFormat) || { ext: 'png' }).ext;
  const handleFiles = (newFiles) => { setFiles(newFiles); setResults([]); cachedFile.current = null; };

  const convertAll = async () => {
    setProcessing(true);
    setProgressStage('Converting…');
    setProgressValue(0);
    const rw = resizeEnabled ? resizeW : null;
    const rh = resizeEnabled ? resizeH : null;
    const out = [];
    const fd = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        let url;
        if (isHeic(file)) {
          const pngBlob = await heic2any({ blob: file, toType: 'image/png', quality: 1 });
          url = URL.createObjectURL(Array.isArray(pngBlob) ? pngBlob[0] : pngBlob);
        } else {
          url = await readFile(file);
        }
        const img = await loadImg(url);
        const canvas = drawToCanvas(img, outputFormat, rw, rh);
        const q = noQualityFormats.includes(outputFormat) ? undefined : quality / 100;
        let blob = await new Promise(res => canvas.toBlob(res, outputFormat, q));
        if (!blob) blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const name = file.name.replace(/\.[^.]+$/, '') + '.' + getExt();
        fd.append('files', blob, name);
        out.push({ name, originalSize: file.size, newSize: blob.size, url: URL.createObjectURL(blob), previewUrl: url });
      } catch (err) {
        out.push({ name: file.name, error: err.message });
      }
      setProgressValue(Math.round(((i + 1) / files.length) * 100));
    }

    // Auto-save all converted files to server via tracking XHR
    if (out.length > 0) {
      setProgressStage('Uploading…');
      setProgressValue(0);
      try {
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload');
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgressValue(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => resolve();
          xhr.onerror = () => reject();
          xhr.send(fd);
        });
      } catch { /* server unavailable — silently skip */ }
    }

    setResults(out);
    setProcessing(false);
    setProgressStage('');
    setProgressValue(0);
  };

  const downloadFile = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; a.click(); };
  const downloadAll = async () => {
    const validResults = results.filter(r => r.url);
    if (!validResults.length) return;

    if (validResults.length === 1) {
      downloadFile(validResults[0].url, validResults[0].name);
      return;
    }

    setZipping(true);
    setProgressStage('Preparing ZIP…');
    setProgressValue(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < validResults.length; i++) {
        const r = validResults[i];
        const response = await fetch(r.url);
        const blob = await response.blob();
        zip.file(r.name, blob);
        setProgressValue(Math.round(((i + 1) / validResults.length) * 50));
      }
      setProgressStage('Archiving ZIP…');
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
        setProgressValue(50 + Math.round(meta.percent / 2));
      });
      const zipUrl = URL.createObjectURL(zipBlob);
      downloadFile(zipUrl, 'converted_files.zip');
      setTimeout(() => URL.revokeObjectURL(zipUrl), 2000);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      alert('Failed to create ZIP archive.');
    } finally {
      setZipping(false);
      setProgressStage('');
      setProgressValue(0);
    }
  };

  const showsQuality = !noQualityFormats.includes(outputFormat);

  return (
    <div>
      <DropZone onFiles={handleFiles} maxFiles={100} accept="image/*,.heic,.heif"
        label="Drop images to convert — supports PNG, JPG, WebP, HEIC, HEIF & more" />
      <FolderUpload onFiles={handleFiles} />

      {files.length > 0 && (
        <>
          <div className="controls-row">
            <label>Convert to:</label>
            <select value={outputFormat} onChange={e => { setOutputFormat(e.target.value); setResults([]); }}>
              {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            {showsQuality && (
              <>
                <label>Quality:</label>
                <div className="quality-control">
                  <input
                    type="range" min="1" max="100" value={quality}
                    onChange={e => setQuality(+e.target.value)}
                    className="quality-slider"
                    style={{ background: `linear-gradient(to right, var(--teal) 0%, var(--teal) ${quality}%, var(--border) ${quality}%, var(--border) 100%)` }}
                  />
                  <input
                    type="number" min="1" max="100" value={quality}
                    onChange={e => setQuality(Math.max(1, Math.min(100, +e.target.value)))}
                    className="quality-number"
                  />
                  <span style={{ fontSize: '.85rem', color: 'var(--text2)' }}>%</span>
                </div>
              </>
            )}
            <label className="resize-toggle-label">
              <input
                type="checkbox"
                checked={resizeEnabled}
                onChange={e => setResizeEnabled(e.target.checked)}
                style={{ accentColor: 'var(--teal)', marginRight: '.35rem' }}
              />
              Resize
            </label>
            {resizeEnabled && (
              <>
                <input
                  type="number" min="1" max="8000" placeholder="W"
                  value={resizeW}
                  onChange={e => setResizeW(Math.max(1, Math.min(8000, +e.target.value)))}
                  className="px-input" title="Width (px)"
                />
                <span style={{ fontSize: '.9rem', color: 'var(--text2)', fontWeight: 600 }}>×</span>
                <input
                  type="number" min="1" max="8000" placeholder="H"
                  value={resizeH}
                  onChange={e => setResizeH(Math.max(1, Math.min(8000, +e.target.value)))}
                  className="px-input" title="Height (px)"
                />
                <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}>px</span>
              </>
            )}
            <button className="btn btn-primary btn-sm" onClick={convertAll} disabled={processing}>
              {processing ? 'Converting…' : `Convert ${files.length} file${files.length > 1 ? 's' : ''}`}
            </button>
          </div>
          {resizeEnabled && <p style={{ fontSize: '.8rem', color: 'var(--teal)', marginBottom: '.5rem' }}>
            ↔ Output will be resized to {resizeW}×{resizeH}px
          </p>}
          <p style={{ color: 'var(--text2)', fontSize: '.85rem' }}>
            {files.length} file{files.length > 1 ? 's' : ''} selected: {files.map(f => f.name).join(', ')}
          </p>

          {progressStage && (
            <div className="progress-container fade-in visible" style={{ margin: '1rem 0', padding: '1rem', background: 'var(--glass)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text)', fontWeight: 600 }}>
                <span>{progressStage}</span>
                <span>{progressValue}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressValue}%`, height: '100%', background: 'var(--teal)', transition: 'width 0.2s ease', borderRadius: '4px' }} />
              </div>
            </div>
          )}

          {livePreview && (
            <div className="live-preview-panel">
              <div className="live-preview-label">Live Preview{files.length > 1 ? ' (first image)' : ''}</div>
              <div className="live-preview-images">
                <div className="live-preview-img-wrap">
                  <span className="live-preview-tag">Original</span>
                  {cachedImg.current && <img src={cachedImg.current.src} alt="Original" />}
                  <span className="live-preview-size">{formatSize(livePreview.origSize)}</span>
                </div>
                <div className="live-preview-arrow">→</div>
                <div className="live-preview-img-wrap">
                  <span className="live-preview-tag output">
                    {formats.find(f => f.value === outputFormat)?.label}
                    {showsQuality ? ` @ ${quality}%` : ''}
                    {resizeEnabled ? ` · ${resizeW}×${resizeH}` : ''}
                  </span>
                  <img src={livePreview.src} alt="Preview" />
                  <span className="live-preview-size" style={{ color: livePreview.size < livePreview.origSize ? 'var(--teal)' : '#f87171' }}>
                    {formatSize(livePreview.size)}
                    {' '}({livePreview.size < livePreview.origSize
                      ? `-${Math.round((1 - livePreview.size / livePreview.origSize) * 100)}%`
                      : `+${Math.round((livePreview.size / livePreview.origSize - 1) * 100)}%`})
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {results.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0 0' }}>
            <button className="btn btn-outline btn-sm" onClick={downloadAll} disabled={zipping}>
              {zipping ? '⏳ Zipping...' : '⬇ Download All as ZIP'}
            </button>
          </div>
          <div className="preview-grid">
            {results.map((r, i) => (
              <div className="preview-card" key={i}>
                {r.url ? (
                  <>
                    <img src={r.url} alt={r.name} />
                    <div className="preview-info">
                      <div className="name" title={r.name}>{r.name}</div>
                      <div className="sizes">
                        <span>{formatSize(r.originalSize)}</span>
                        <span>→</span>
                        <span className="new-size">{formatSize(r.newSize)}</span>
                      </div>
                    </div>
                    <div className="preview-actions">
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                        onClick={() => downloadFile(r.url, r.name)}>⬇ Download</button>
                    </div>
                  </>
                ) : (
                  <div className="preview-info">
                    <div className="name">{r.name}</div>
                    <p style={{ color: '#f87171' }}>Error: {r.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UniversalConverter;
