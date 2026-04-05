import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Initialize the worker
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Rasterizes a PDF page to a Canvas element or ImageData.
 * 
 * @param {Uint8Array|string|Object} source - PDF source (Uint8Array, URL, or already loaded PDFDocumentProxy).
 * @param {number} pageNum - The 1-indexed page number to rasterize.
 * @param {Object} [options={}] - Rendering options.
 * @param {number} [options.scale=1.5] - The base scale factor.
 * @param {boolean} [options.useDPR=true] - Whether to multiply scale by window.devicePixelRatio for high-DPI.
 * @param {boolean} [options.returnImageData=false] - If true, returns ImageData instead of HTMLCanvasElement.
 * @returns {Promise<HTMLCanvasElement|ImageData>}
 */
export async function rasterizePage(source, pageNum, options = {}) {
  const { 
    scale = 1.5, 
    useDPR = true, 
    returnImageData = false 
  } = options;

  let pdf;
  let loadingTask = null;

  if (typeof source === 'object' && source.getPage) {
    // source is already a PDFDocumentProxy
    pdf = source;
  } else {
    // Load the document
    loadingTask = pdfjsLib.getDocument(
      typeof source === 'string' ? source : { data: source }
    );
    pdf = await loadingTask.promise;
  }

  try {
    const page = await pdf.getPage(pageNum);
    
    // Handle High-DPI (Retina) rendering
    const dpr = useDPR ? (window.devicePixelRatio || 1) : 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    const canvas = document.createElement('canvas');
    // willReadFrequently optimization for cases like Redact or Compare that use getImageData
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) {
      throw new Error('Could not create canvas context');
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    if (returnImageData) {
      return context.getImageData(0, 0, canvas.width, canvas.height);
    }

    return canvas;
  } finally {
    // We only want to clean up if we were the ones who loaded the document
    // However, destroying the document would prevent further use of it.
    // In many cases, the caller will handle the document lifecycle.
    // For this utility, we'll leave the document open to avoid unexpected side effects.
  }
}
