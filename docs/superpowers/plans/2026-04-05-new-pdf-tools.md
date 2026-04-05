# New PDF Tools (Sign, Redact, Compare) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three privacy-first, client-side PDF tools: Sign PDF, Redact PDF, and Compare PDF.

**Architecture:** React 19 components using `pdf-lib` for modification, `pdfjs-dist` for rendering/rasterization, and `pixelmatch` for diff analysis.

**Tech Stack:** React, pdf-lib, pdfjs-dist, pixelmatch, native Canvas API, Vanilla CSS.

---

### Task 1: Integration & Routing

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/data/toolsData.js`
- Create: `src/components/SignPdf.jsx`
- Create: `src/components/RedactPdf.jsx`
- Create: `src/components/ComparePdf.jsx`

- [ ] **Step 1: Create placeholder components**
Create empty boilerplate for the three new tools to ensure lazy-loading works.

- [ ] **Step 2: Update App.jsx**
Register the new routes and lazy-load imports.

- [ ] **Step 3: Update toolsData.js**
Remove `comingSoon: true` and link the tools to their paths.

- [ ] **Step 4: Commit integration**
```bash
git add src/App.jsx src/data/toolsData.js src/components/
git commit -m "feat: add routing and placeholders for Sign, Redact, and Compare PDF"
```

---

### Task 2: Utility - PDF Rasterizer

**Files:**
- Create: `src/utils/pdfRasterizer.js`

- [ ] **Step 1: Implement rasterizePage function**
Need a utility to convert a PDF page to a Canvas/ImageData for processing.
```javascript
import * as pdfjs from 'pdfjs-dist';
// ... implementation using pdfjs.getDocument and page.render
```

- [ ] **Step 2: Commit utility**
```bash
git add src/utils/pdfRasterizer.js
git commit -m "feat: add PDF rasterizer utility"
```

---

### Task 3: Sign PDF Tool

**Files:**
- Modify: `src/components/SignPdf.jsx`

- [ ] **Step 1: Implement Signature Canvas**
Create a drawing surface for users to sign with their mouse/touch.

- [ ] **Step 2: Implement Signature Overlay Logic**
Use `pdf-lib` to embed the signature image (drawn, uploaded, or typed) into a PDF page at a user-specified location.

- [ ] **Step 3: Add Drag-and-Resize UI**
Allow users to position and scale their signature on a PDF preview.

- [ ] **Step 4: Commit Sign PDF**
```bash
git add src/components/SignPdf.jsx
git commit -m "feat: implement Sign PDF tool"
```

---

### Task 4: Redact PDF Tool

**Files:**
- Modify: `src/components/RedactPdf.jsx`

- [ ] **Step 1: Implement Redaction UI**
Load PDF as images and allow users to click-and-drag to draw black rectangles.

- [ ] **Step 2: Implement Secure Rasterization Export**
Flatten the black boxes into the image data and re-generate a PDF using `pdf-lib`.

- [ ] **Step 3: Commit Redact PDF**
```bash
git add src/components/RedactPdf.jsx
git commit -m "feat: implement Redact PDF tool"
```

---

### Task 5: Compare PDF Tool

**Files:**
- Modify: `src/components/ComparePdf.jsx`

- [ ] **Step 1: Implement Dual File Upload**
Allow uploading two PDF files and select pages to compare.

- [ ] **Step 2: Implement Pixel Diffing**
Use `pixelmatch` to compare the rasterized output of two pages and generate a diff overlay.

- [ ] **Step 3: Side-by-Side View**
Show File A, File B, and the Diff side-by-side with synchronized zooming.

- [ ] **Step 4: Commit Compare PDF**
```bash
git add src/components/ComparePdf.jsx
git commit -m "feat: implement Compare PDF tool"
```

---

### Task 6: Final Review & Cleanup

- [ ] **Step 1: Run Lint & Build**
Ensure no regressions and successful production build.

- [ ] **Step 2: Final Commit**
```bash
git commit -m "chore: final cleanup for PDF tools launch"
```
