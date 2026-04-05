# PixConvert Code Graph
_Last updated: 2025-05-22 | Nodes: 45_

## Routes (App.jsx lazy routes)
| Route Path | Component File | Status |
|---|---|---|
| / | src/components/Home.jsx | stable |
| /tools | src/components/Tools.jsx | stable |
| /tools/converter | src/components/UniversalConverter.jsx | stable |
| /tools/gif | src/components/GifMaker.jsx | stable |
| /tools/pdf | src/components/PdfUnlocker.jsx | stable |
| /tools/pdf-lock | src/components/PdfLocker.jsx | stable |
| /tools/jpg-to-png | src/components/UniversalConverter.jsx | stable |
| /tools/png-to-jpg | src/components/UniversalConverter.jsx | stable |
| /tools/webp-to-jpg | src/components/UniversalConverter.jsx | stable |
| /tools/heic-to-jpg | src/components/UniversalConverter.jsx | stable |
| /tools/bmp-to-png | src/components/UniversalConverter.jsx | stable |
| /tools/photo-to-markdown | src/components/OcrTool.jsx | stable |
| /tools/pdf-to-jpg | src/components/PdfToJpg.jsx | stable |
| /tools/pdf-to-word | src/components/PdfToWord.jsx | stable |
| /tools/pdf-to-powerpoint | src/components/PdfToPowerpoint.jsx | stable |
| /tools/pdf-to-excel | src/components/PdfToExcel.jsx | stable |
| /tools/pdf-to-pdf-a | src/components/PdfToPdfA.jsx | stable |
| /tools/merge-pdf | src/components/MergePdf.jsx | stable |
| /tools/split-pdf | src/components/SplitPdf.jsx | stable |
| /tools/remove-pages | src/components/RemovePages.jsx | stable |
| /tools/extract-pages | src/components/ExtractPages.jsx | stable |
| /tools/organize-pdf | src/components/OrganizePdf.jsx | stable |
| /tools/scan-to-pdf | src/components/ScanToPdf.jsx | stable |
| /tools/ocr-pdf | src/components/OcrTool.jsx | stable |
| /tools/jpg-to-pdf | src/components/JpgToPdf.jsx | stable |
| /tools/word-to-pdf | src/components/WordToPdf.jsx | stable |
| /tools/powerpoint-to-pdf | src/components/PowerpointToPdf.jsx | stable |
| /tools/excel-to-pdf | src/components/ExcelToPdf.jsx | stable |
| /tools/html-to-pdf | src/components/HtmlToPdf.jsx | stable |
| /tools/rotate-pdf | src/components/RotatePdf.jsx | stable |
| /tools/add-page-numbers | src/components/AddPageNumbers.jsx | stable |
| /tools/add-watermark | src/components/AddWatermark.jsx | stable |
| /tools/crop-pdf | src/components/CropPdf.jsx | stable |
| /tools/edit-pdf | src/components/EditPdf.jsx | stable |
| /about | src/components/About.jsx | stable |
| /privacy | src/components/Privacy.jsx | stable |
| /contact | src/components/Contact.jsx | stable |

## Components
### MergePdf.jsx
- **Imports:** pdf-lib, src/components/DropZone.jsx, src/components/ToolProgressBar.jsx, src/utils/formatSize.js
- **Exports:** default MergePdf
- **Uses server:** no
- **Last reviewed:** 2025-05-22
- **Flags:** —

### UniversalConverter.jsx
- **Imports:** heic2any, jszip, src/components/DropZone.jsx, src/components/ToolProgressBar.jsx, src/components/FolderUpload.jsx, src/utils/formatSize.js, src/utils/isHeic.js, src/utils/fileHelpers.js (readFile, loadImg)
- **Exports:** default UniversalConverter
- **Uses server:** no
- **Last reviewed:** 2025-05-22
- **Flags:** —

### OcrTool.jsx
- **Imports:** pdfjs-dist, tesseract.js, src/components/DropZone.jsx, src/components/ToolProgressBar.jsx
- **Exports:** default OcrTool
- **Uses server:** no
- **Last reviewed:** 2025-05-22
- **Flags:** —

### Contact.jsx
- **Imports:** react
- **Exports:** default Contact
- **Uses server:** yes (/api/contact)
- **Last reviewed:** 2025-05-22
- **Flags:** USES_SERVER

### PdfToWord.jsx
- **Imports:** pdfjs-dist, docx, src/components/DropZone.jsx, src/components/ToolProgressBar.jsx, src/utils/pdfPasswordCheck.js (isEncryptedError)
- **Exports:** default PdfToWord
- **Uses server:** no
- **Last reviewed:** 2025-05-22
- **Flags:** —

## Utilities (src/utils/)
### fileHelpers.js
- **Exports:** readFile, loadImg
- **Used by:** UniversalConverter.jsx

### formatSize.js
- **Exports:** default formatSize
- **Used by:** AddPageNumbers.jsx, AddWatermark.jsx, MergePdf.jsx, JpgToPdf.jsx, HtmlToPdf.jsx, GifMaker.jsx, ExtractPages.jsx, ExcelToPdf.jsx, EditPdf.jsx, CropPdf.jsx, PowerpointToPdf.jsx, RemovePages.jsx, PdfUnlocker.jsx, UniversalConverter.jsx

### htmlToPdf.js
- **Exports:** htmlToPdfBytes
- **Imports:** html2canvas, pdf-lib, dompurify
- **Used by:** HtmlToPdf.jsx, ExcelToPdf.jsx

### isHeic.js
- **Exports:** default isHeic
- **Used by:** UniversalConverter.jsx, GifMaker.jsx

### pdfPasswordCheck.js
- **Exports:** isEncryptedError
- **Used by:** PdfToWord.jsx, PdfToPowerpoint.jsx

### pptxExtractText.js
- **Exports:** extractPptxSlideTexts
- **Imports:** jszip
- **Used by:** PowerpointToPdf.jsx

## Server Endpoints (server.js)
| Method | Path | Purpose |
|---|---|---|
| POST | /api/upload | Multer file intake |
| GET | /api/files | List uploaded files (admin) |
| DELETE | /api/files/:id | Delete specific file (admin) |
| POST | /api/contact | Nodemailer email |

## Dependency Index (library → components)
| Library | Used In |
|---|---|
| pdf-lib | MergePdf.jsx, AddPageNumbers.jsx, AddWatermark.jsx, EditPdf.jsx, CropPdf.jsx, RotatePdf.jsx, JpgToPdf.jsx, ExtractPages.jsx, RemovePages.jsx, OrganizePdf.jsx, ScanToPdf.jsx, PowerpointToPdf.jsx, htmlToPdf.js |
| pdfjs-dist | ExtractPages.jsx, RemovePages.jsx, PdfToWord.jsx, PdfToPowerpoint.jsx, OcrTool.jsx, PdfToExcel.jsx, PdfToJpg.jsx |
| tesseract.js | OcrTool.jsx |
| heic2any | UniversalConverter.jsx, GifMaker.jsx |
| html2canvas | htmlToPdf.js |
| jszip | UniversalConverter.jsx, pptxExtractText.js |
| docx | PdfToWord.jsx |
| pptxgenjs | PdfToPowerpoint.jsx |
| xlsx | ExcelToPdf.jsx, PdfToExcel.jsx |
| gif.js | GifMaker.jsx |
| dompurify | htmlToPdf.js |
