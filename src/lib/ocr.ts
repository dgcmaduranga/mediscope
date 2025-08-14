"use client";
import Tesseract from "tesseract.js";

async function fileToDataURL(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export async function ocrImage(
  file: File,
  onProgress?: (p: number) => void
): Promise<string> {
  const dataUrl = await fileToDataURL(file);

  const { data } = await Tesseract.recognize(dataUrl, "eng", {
    // CDN paths keep it simple for dev
    workerPath: "https://unpkg.com/tesseract.js@v5.0.5/dist/worker.min.js",
    corePath: "https://unpkg.com/tesseract.js-core@v5.0.0/tesseract-core.wasm.js",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });

  return (data.text || "").replace(/\u00A0/g, " ");
}
