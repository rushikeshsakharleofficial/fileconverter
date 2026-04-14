# n8n Community Node — PixConvert API

**Date:** 2026-04-14
**Status:** Approved

---

## Overview

Build a standalone n8n community node package (`n8n-nodes-pixconvert`) that wraps the PixConvert REST API, plus a set of example workflow JSON templates. Users install the package once, configure a base URL credential, and access all 35 PDF/image tools directly from the n8n node palette.

---

## Goals

- All 35 API endpoints accessible from a single n8n node
- Zero-auth setup — only a base URL credential required
- Binary and URL output modes — works with any downstream node
- 5 ready-to-import workflow templates covering common automation patterns
- Published to npm as `n8n-nodes-pixconvert`

---

## Repository

Separate standalone repository: `n8n-nodes-pixconvert`

Not inside the fileconverter monorepo. Changes to the API that affect node parameters require a coordinated update to this repo.

---

## Repository Structure

```
n8n-nodes-pixconvert/
├── credentials/
│   └── PixConvertApi.credentials.ts
├── nodes/
│   └── PixConvert/
│       ├── PixConvert.node.ts
│       ├── PixConvert.node.json
│       ├── pixconvert.svg
│       ├── operations/
│       │   ├── organize.ts          # 6 ops
│       │   ├── optimize.ts          # 3 ops
│       │   ├── convertToPdf.ts      # 5 ops
│       │   ├── convertFromPdf.ts    # 5 ops
│       │   ├── edit.ts              # 5 ops
│       │   ├── security.ts          # 5 ops
│       │   ├── image.ts             # 6 ops
│       │   └── media.ts             # 2 ops
│       └── transport.ts
├── workflows/
│   ├── merge-pdfs.json
│   ├── compress-and-email.json
│   ├── word-to-pdf-pipeline.json
│   ├── pdf-to-jpg-s3.json
│   └── lock-pdf-workflow.json
├── package.json
├── tsconfig.json
├── gulpfile.js
└── README.md
```

---

## Credential Type

**Name:** `PixConvert API`
**Type:** `pixConvertApi`

Single property:

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Base URL | string | — | Full origin, e.g. `https://api.example.com` |

Test connection: `GET {baseUrl}/api/v1/health` — expects `{ success: true }`.

---

## Node Definition

**Display name:** PixConvert
**Name:** `pixConvert`
**Group:** transform
**Icon:** `pixconvert.svg`

### UI Flow

1. **Resource** — dropdown, 8 options matching API categories
2. **Operation** — dropdown, filtered per resource via `displayOptions`
3. **Input Source** — `Binary Input` (file from previous node's binary property) or `URL` (string field for remote file)
4. **Operation Parameters** — shown/hidden per operation (see parameters table below)
5. **Output Mode** — `Binary` (default) or `URL`
   - Binary: API response streamed back as n8n binary item
   - URL: `?output=url` appended, node returns `{ url: "..." }` JSON

### Operations by Resource

#### Organize PDF (6)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| Merge PDF | `/merge-pdf` | — (accepts multiple binary items) |
| Split PDF | `/split-pdf` | pages (string, optional) |
| Remove Pages | `/remove-pages` | pages (string, required) |
| Extract Pages | `/extract-pages` | pages (string, required) |
| Organize PDF | `/organize-pdf` | order (JSON array string, required) |
| Scan to PDF | `/scan-to-pdf` | — (accepts multiple image items) |

#### Optimize PDF (3)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| Compress PDF | `/compress-pdf` | quality (low/medium/high, default: medium) |
| Repair PDF | `/repair-pdf` | — |
| OCR PDF | `/ocr-pdf` | lang (string, default: eng), format (pdf/txt, default: pdf) |

#### Convert to PDF (5)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| JPG to PDF | `/jpg-to-pdf` | orientation (portrait/landscape), margin (number) |
| Word to PDF | `/word-to-pdf` | — |
| PowerPoint to PDF | `/powerpoint-to-pdf` | — |
| Excel to PDF | `/excel-to-pdf` | — |
| HTML to PDF | `/html-to-pdf` | format (A4/Letter), landscape (boolean) |

#### Convert from PDF (5)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| PDF to JPG | `/pdf-to-jpg` | dpi (number, default: 150), quality (number, default: 90) |
| PDF to Word | `/pdf-to-word` | — |
| PDF to PowerPoint | `/pdf-to-powerpoint` | — |
| PDF to Excel | `/pdf-to-excel` | — |
| PDF to PDF/A | `/pdf-to-pdfa` | — |

#### Edit PDF (5)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| Rotate PDF | `/rotate-pdf` | angle (90/180/270, required), pages (string, optional) |
| Add Page Numbers | `/add-page-numbers` | position, startFrom, fontSize, format |
| Add Watermark | `/add-watermark` | text (string), opacity (0-1), rotation (number), fontSize |
| Crop PDF | `/crop-pdf` | top, right, bottom, left (numbers, points) |
| Edit PDF | `/edit-pdf` | annotations (JSON array string, required) |

#### PDF Security (5)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| Unlock PDF | `/unlock-pdf` | password (string, optional) |
| Lock PDF | `/lock-pdf` | password (string, required) |
| Sign PDF | `/sign-pdf` | page, x, y, width, height (numbers) + signature binary input |
| Redact PDF | `/redact-pdf` | regions (JSON array string, required) |
| Compare PDF | `/compare-pdf` | — (accepts two binary items) |

#### Image Conversion (6)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| JPG to PNG | `/jpg-to-png` | quality (number) |
| PNG to JPG | `/png-to-jpg` | quality (number) |
| WebP to JPG | `/webp-to-jpg` | quality (number) |
| HEIC to JPG | `/heic-to-jpg` | quality (number) |
| BMP to PNG | `/bmp-to-png` | — |
| Photo to Markdown | `/photo-to-markdown` | lang (string, default: eng) |

#### Media (2)
| Operation | Endpoint | Extra Parameters |
|-----------|----------|-----------------|
| Universal Convert | `/convert` | to (target format, required) |
| GIF Maker | `/gif` | delay (ms, default: 100), loop (0=infinite) |

---

## Transport Layer (`transport.ts`)

Single exported function: `pixConvertRequest(options)`

**Responsibilities:**
1. Resolve base URL from credential
2. Accept binary item(s) from n8n or a URL string → build `FormData`
3. Append operation-specific form fields (all as strings)
4. If output mode is URL: append `?output=url` to the request
5. Execute `POST {baseUrl}/api/v1/{endpoint}` with the FormData
6. If output=binary: attach response buffer to n8n binary item with correct MIME type, return
7. If output=url: parse and return `{ url: "..." }` JSON

**Error handling:**
- Non-200 response: parse `{ success: false, error: "..." }` body, throw as `NodeOperationError`
- File too large (>50MB): check before sending, throw user-friendly error
- Rate limited (429): retry once after 1000ms, then throw `NodeOperationError` with rate limit message
- Network failure: rethrow with endpoint context

---

## Workflow Templates

5 JSON files in `workflows/` — ready to import into any n8n instance.

| File | Trigger | Flow |
|------|---------|------|
| `merge-pdfs.json` | Manual | Read File A + File B → PixConvert Merge → Write File |
| `compress-and-email.json` | Webhook (PDF upload) | PixConvert Compress → Gmail send as attachment |
| `word-to-pdf-pipeline.json` | Watch folder (.docx) | PixConvert Word→PDF → Move to output folder |
| `pdf-to-jpg-s3.json` | HTTP Request (URL input) | PixConvert PDF→JPG (URL mode) → S3 Upload each image |
| `lock-pdf-workflow.json` | Webhook (PDF + password) | PixConvert Lock PDF → Respond with binary download |

---

## package.json Key Fields

```json
{
  "name": "n8n-nodes-pixconvert",
  "version": "1.0.0",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/PixConvertApi.credentials.js"],
    "nodes": ["dist/nodes/PixConvert/PixConvert.node.js"]
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

---

## Build Process

- TypeScript → `dist/` via `tsc`
- `gulpfile.js` copies `*.svg`, `*.json` icon files to `dist/`
- Local dev: `npm link` the package into an n8n instance
- Release: `npm publish`

---

## Out of Scope

- No authentication on the API (open source, no token)
- No webhook/trigger node (API is request-response only)
- No n8n Cloud listing in this version (can be submitted after stable release)
