"use client";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs"; // ensures worker is bundled
import Tesseract from "tesseract.js";

// Reuse same CDN core/worker for reliability
const tessOpts = {
  workerPath: "https://unpkg.com/tesseract.js@v5.0.5/dist/worker.min.js",
  corePath: "https://unpkg.com/tesseract.js-core@v5.0.0/tesseract-core.wasm.js",
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
};

type ProgressCb = (p: number) => void;

/** Render a PDF page to a canvas dataURL (white background). */
async function pageToDataURL(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, scale = 2): Promise<string> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // white bg (helps OCR)
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx as any, viewport }).promise;
  return canvas.toDataURL("image/png");
}

/** OCR one dataURL */
async function ocrDataURL(dataUrl: string): Promise<string> {
  const { data } = await Tesseract.recognize(dataUrl, "eng", tessOpts);
  return (data.text || "").replace(/\u00A0/g, " ");
}

/** OCR a whole PDF (first N pages), merge text, report progress */
export async function ocrPdf(file: File, onProgress?: ProgressCb, maxPages = 3): Promise<string> {
  const buf = await file.arrayBuffer();
  // @ts-ignore - pdfjs worker already imported above
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const pages = Math.min(maxPages, pdf.numPages);
  let combined = "";
  for (let i = 1; i <= pages; i++) {
    const dataUrl = await pageToDataURL(pdf, i, 2);
    const text = await ocrDataURL(dataUrl);
    combined += `\n--- Page ${i} ---\n` + text;
    if (onProgress) onProgress(Math.round((i / pages) * 100));
  }
  return combined.trim();
}


