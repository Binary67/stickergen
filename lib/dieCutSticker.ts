"use client";

type CaptionPlacement = "bottom" | "top" | "bubble";

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l]; // achromatic
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === rNorm) {
    h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
  } else if (max === gNorm) {
    h = ((bNorm - rNorm) / d + 2) / 6;
  } else {
    h = ((rNorm - gNorm) / d + 4) / 6;
  }

  return [h * 360, s, l]; // hue in degrees, saturation and lightness 0-1
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load generated image"));
    img.src = src;
  });
}

function clearKeyColorFromEdges(
  imageData: ImageData,
  _keyRgb: [number, number, number],
  _tolerance: number
) {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let sp = 0;

  // Green hue range: approximately 80-160 degrees (covers lime to teal)
  const hueMin = 80;
  const hueMax = 160;
  const saturationMin = 0.25; // Must have some color saturation
  const lightnessMin = 0.15; // Not too dark
  const lightnessMax = 0.85; // Not too bright/white

  const isKey = (pixelIndex: number) => {
    const i = pixelIndex * 4;
    const a = data[i + 3];
    if (a === 0) return true; // Transparent pixels are always "key"

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const [h, s, l] = rgbToHsl(r, g, b);

    // Check if pixel is in the green hue range with sufficient saturation
    return h >= hueMin && h <= hueMax && s >= saturationMin && l >= lightnessMin && l <= lightnessMax;
  };

  const pushIfKey = (pixelIndex: number) => {
    if (visited[pixelIndex]) return;
    if (!isKey(pixelIndex)) return;
    visited[pixelIndex] = 1;
    stack[sp++] = pixelIndex;
  };

  for (let x = 0; x < width; x++) {
    pushIfKey(x);
    pushIfKey(x + (height - 1) * width);
  }
  for (let y = 0; y < height; y++) {
    pushIfKey(y * width);
    pushIfKey(width - 1 + y * width);
  }

  while (sp > 0) {
    const p = stack[--sp];
    const i = p * 4;
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;

    const x = p % width;
    const y = (p - x) / width;

    if (x > 0) pushIfKey(p - 1);
    if (x + 1 < width) pushIfKey(p + 1);
    if (y > 0) pushIfKey(p - width);
    if (y + 1 < height) pushIfKey(p + width);
  }
}

function findAlphaBounds(
  imageData: ImageData,
  alphaThreshold = 12
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a <= alphaThreshold) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY };
}

function makeSilhouetteCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(source, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  caption: string,
  placement: CaptionPlacement,
  layout: {
    size: number;
    margin: number;
    contentBounds: { minX: number; minY: number; maxX: number; maxY: number };
  }
) {
  const { size, margin, contentBounds } = layout;
  const maxTextWidth = size - margin * 2;

  const fontFamily =
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  let fontSize = Math.round(size * 0.12);

  const measure = () => {
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    return ctx.measureText(caption).width;
  };

  while (fontSize > 18 && measure() > maxTextWidth) {
    fontSize = Math.floor(fontSize * 0.92);
  }

  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (placement === "bubble") {
    const textWidth = ctx.measureText(caption).width;
    const padX = Math.round(fontSize * 0.6);
    const padY = Math.round(fontSize * 0.45);
    const bubbleW = Math.min(size - margin * 2, Math.round(textWidth + padX * 2));
    const bubbleH = Math.round(fontSize + padY * 2);

    const targetX = (contentBounds.minX + contentBounds.maxX) / 2;
    const targetY = contentBounds.minY + (contentBounds.maxY - contentBounds.minY) * 0.2;

    let x = contentBounds.maxX - bubbleW;
    let y = contentBounds.minY - bubbleH - Math.round(size * 0.02);
    x = Math.max(margin, Math.min(x, size - margin - bubbleW));
    y = Math.max(margin, Math.min(y, size - margin - bubbleH));

    const tailBaseX = x + bubbleW * 0.55;
    const tailBaseY = y + bubbleH;
    const tailTipX = Math.max(margin, Math.min(targetX, size - margin));
    const tailTipY = Math.max(margin, Math.min(targetY, size - margin));

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.12));

    drawRoundedRect(ctx, x, y, bubbleW, bubbleH, Math.round(fontSize * 0.55));
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tailBaseX - Math.round(fontSize * 0.15), tailBaseY - 1);
    ctx.lineTo(tailBaseX + Math.round(fontSize * 0.15), tailBaseY - 1);
    ctx.lineTo(tailTipX, tailTipY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.fillText(caption, x + bubbleW / 2, y + bubbleH / 2);
    ctx.restore();
    return;
  }

  const y =
    placement === "top"
      ? margin + Math.round(fontSize * 0.8)
      : size - margin - Math.round(fontSize * 0.8);

  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(6, Math.round(fontSize * 0.18));
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.strokeText(caption, size / 2, y);
  ctx.fillText(caption, size / 2, y);
}

export async function createDieCutSticker(options: {
  sourceImageUrl: string;
  keyBackgroundColor?: string;
  caption?: string;
  captionPlacement?: CaptionPlacement;
  outputSize?: number;
}): Promise<string> {
  const outputSize = options.outputSize ?? 1024;
  const keyRgb = hexToRgb(options.keyBackgroundColor ?? "#00FF00") ?? [0, 255, 0];
  const captionPlacement = options.captionPlacement ?? "bottom";
  const caption = options.caption?.trim();

  const img = await loadImage(options.sourceImageUrl);

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = img.naturalWidth || img.width;
  sourceCanvas.height = img.naturalHeight || img.height;
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx) throw new Error("Canvas not supported");
  sourceCtx.imageSmoothingEnabled = true;
  sourceCtx.drawImage(img, 0, 0);

  const sourceImageData = sourceCtx.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );

  clearKeyColorFromEdges(sourceImageData, keyRgb, 90);
  sourceCtx.putImageData(sourceImageData, 0, 0);

  const bounds = findAlphaBounds(sourceImageData);
  if (!bounds) return options.sourceImageUrl;

  const margin = Math.round(outputSize * 0.07);
  const captionReserve =
    caption && caption.length > 0 && captionPlacement !== "bubble"
      ? Math.round(outputSize * 0.18)
      : 0;

  const contentW = bounds.maxX - bounds.minX + 1;
  const contentH = bounds.maxY - bounds.minY + 1;

  const availableW = outputSize - margin * 2;
  const availableH = outputSize - margin * 2 - captionReserve;

  const scale = Math.min(availableW / contentW, availableH / contentH);
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;

  const yOffset =
    captionReserve === 0
      ? (outputSize - scaledH) / 2
      : captionPlacement === "top"
        ? captionReserve + (outputSize - captionReserve - scaledH) / 2
        : (outputSize - captionReserve - scaledH) / 2;

  const x = (outputSize - scaledW) / 2 - bounds.minX * scale;
  const y = yOffset - bounds.minY * scale;

  const cutCanvas = document.createElement("canvas");
  cutCanvas.width = outputSize;
  cutCanvas.height = outputSize;
  const cutCtx = cutCanvas.getContext("2d", { willReadFrequently: true });
  if (!cutCtx) throw new Error("Canvas not supported");
  cutCtx.imageSmoothingEnabled = true;
  cutCtx.clearRect(0, 0, outputSize, outputSize);
  cutCtx.drawImage(sourceCanvas, x, y, sourceCanvas.width * scale, sourceCanvas.height * scale);

  const contentBounds = {
    minX: x + bounds.minX * scale,
    minY: y + bounds.minY * scale,
    maxX: x + bounds.maxX * scale,
    maxY: y + bounds.maxY * scale,
  };

  const silhouetteCanvas = makeSilhouetteCanvas(cutCanvas);

  const outlineCanvas = document.createElement("canvas");
  outlineCanvas.width = outputSize;
  outlineCanvas.height = outputSize;
  const outlineCtx = outlineCanvas.getContext("2d");
  if (!outlineCtx) throw new Error("Canvas not supported");
  outlineCtx.clearRect(0, 0, outputSize, outputSize);
  outlineCtx.imageSmoothingEnabled = true;

  const stroke = Math.max(10, Math.round(outputSize * 0.02));
  const steps = Math.max(18, Math.round(2 * Math.PI * stroke));
  for (let s = 0; s < steps; s++) {
    const a = (s / steps) * Math.PI * 2;
    const dx = Math.round(Math.cos(a) * stroke);
    const dy = Math.round(Math.sin(a) * stroke);
    outlineCtx.drawImage(silhouetteCanvas, dx, dy);
  }
  outlineCtx.drawImage(silhouetteCanvas, 0, 0);

  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = outputSize;
  finalCanvas.height = outputSize;
  const ctx = finalCanvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.clearRect(0, 0, outputSize, outputSize);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = Math.round(outputSize * 0.02);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.round(outputSize * 0.01);
  ctx.drawImage(outlineCanvas, 0, 0);
  ctx.restore();

  ctx.drawImage(outlineCanvas, 0, 0);
  ctx.drawImage(cutCanvas, 0, 0);

  if (caption && caption.length > 0) {
    drawCaption(ctx, caption, captionPlacement, { size: outputSize, margin, contentBounds });
  }

  return finalCanvas.toDataURL("image/png");
}

