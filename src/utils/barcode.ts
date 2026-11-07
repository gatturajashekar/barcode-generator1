import JsBarcode from 'jsbarcode';
import type { BarcodeItem, ClothingSize } from '../types';

export function formatBarcodeId(sequence: number): string {
  return `BLT${sequence}`;
}

export function encodeCode128(value: string): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  try {
    JsBarcode(svg, value, {
      format: 'CODE128',
      displayValue: false,
      margin: 0,
      width: 1.6,
      height: 50,
      background: '#ffffff',
      lineColor: '#4d0011',
    });
    return svg.outerHTML;
  } catch {
    return fallbackBars(value);
  }
}

function fallbackBars(value: string): string {
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const rects: string[] = [];
  let x = 0;
  for (let i = 0; i < 50; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const width = 1 + (seed % 3);
    const dark = (seed >> 3) % 3 !== 0;
    if (dark) {
      rects.push(`<rect x="${x}" y="0" width="${width}" height="50" fill="#4d0011"/>`);
    }
    x += width;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 50" preserveAspectRatio="none">${rects.join('')}</svg>`;
}

type AllocResult = {
  starting: number;
  ending: number;
};

type SizeRun = {
  size: ClothingSize | null;
  quantity: number;
  sellingPrice: number;
};

/**
 * Build BarcodeItem objects from a list of size runs and a contiguous sequence range.
 * Each physical piece gets its own unique barcode ID and its own selling price.
 */
export function buildBarcodeItems(
  sizeRuns: SizeRun[],
  startingSequence: number,
): BarcodeItem[] {
  const items: BarcodeItem[] = [];
  let seq = startingSequence;
  for (const run of sizeRuns) {
    for (let i = 0; i < run.quantity; i++) {
      const barcodeId = formatBarcodeId(seq);
      items.push({
        id: `${barcodeId}-${seq}`,
        barcodeId,
        sequenceNumber: seq,
        svg: encodeCode128(barcodeId),
        size: run.size,
        sellingPrice: run.sellingPrice,
      });
      seq += 1;
    }
  }
  return items;
}

/**
 * Fallback local sequence (used only if Supabase RPC is unreachable).
 * Reads/writes localStorage so it is still monotonic within a session, but
 * the authoritative source is the backend allocate_barcodes RPC.
 */
const LOCAL_SEQ_KEY = 'blt-barcode-sequence-fallback';
const LOCAL_START = 10000001;

export function localAllocate(count: number): AllocResult {
  let current = LOCAL_START;
  try {
    const stored = localStorage.getItem(LOCAL_SEQ_KEY);
    const parsed = stored ? Number(stored) : LOCAL_START;
    if (Number.isFinite(parsed) && parsed >= LOCAL_START) current = parsed;
  } catch {
    /* ignore */
  }
  const starting = current;
  const ending = current + count - 1;
  try {
    localStorage.setItem(LOCAL_SEQ_KEY, String(ending + 1));
  } catch {
    /* ignore */
  }
  return { starting, ending };
}
