import { Printer, Download, Barcode, Tag, IndianRupee, Shirt } from 'lucide-react';
import type { BarcodeItem, ProductEntry } from '../types';

type BarcodePreviewProps = {
  product: ProductEntry | null;
  items: BarcodeItem[];
  totalCount: number;
};

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export default function BarcodePreview({ product, items, totalCount }: BarcodePreviewProps) {
  if (!product) {
    return <EmptyState />;
  }

  return (
    <section className="animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3.5 sm:gap-3 sm:px-7 sm:py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-maroon-50 text-maroon-700 ring-1 ring-maroon-100 sm:h-10 sm:w-10">
          <Barcode size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-base text-maroon-800 sm:text-lg md:text-xl">
            Barcode Preview
          </h2>
          <p className="truncate text-xs text-slate-500 sm:text-sm">
            Showing {items.length} of {totalCount} generated label
            {totalCount !== 1 ? 's' : ''} — Code 128.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-100 sm:inline">
          Scannable
        </span>
      </div>

      {/* Preview canvas */}
      <div className="bg-grid px-4 py-6 sm:px-7 sm:py-7">
        <div className="print-area mx-auto w-full max-w-md">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {items.map((item) => (
              <LabelCard key={item.id} product={product} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:px-7 sm:py-5">
        <button
          onClick={() => window.print()}
          className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-maroon-700 px-5 py-3.5 text-sm font-semibold text-white shadow-maroon transition-all duration-200 hover:bg-maroon-800 hover:shadow-lg active:scale-[0.98] sm:px-6"
        >
          <Printer size={18} className="transition-transform group-hover:scale-110" />
          Print Labels
        </button>
        <button
          onClick={() => downloadPrintable(product, product.items)}
          className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-maroon-200 bg-maroon-50 px-5 py-3.5 text-sm font-semibold text-maroon-700 transition-all duration-200 hover:bg-maroon-100 active:scale-[0.98] sm:px-6"
        >
          <Download size={18} className="transition-transform group-hover:translate-y-0.5" />
          Download PDF
        </button>
      </div>
    </section>
  );
}

function LabelCard({ product, item }: { product: ProductEntry; item: BarcodeItem }) {
  const showSize = product.category === 'Other' && item.size;
  return (
    <div className="print-label overflow-hidden rounded-xl border-2 border-maroon-700 bg-white shadow-sm">
      {/* Brand strip */}
      <div className="flex items-center justify-between bg-maroon-700 px-2.5 py-1.5 text-white sm:px-3">
        <span className="truncate font-serif text-[0.65rem] tracking-wide sm:text-[0.7rem]">
          Bhagya Lakshmi Textiles
        </span>
        <span className="ml-1.5 shrink-0 rounded bg-white/15 px-1.5 py-0.5 text-[0.5rem] uppercase tracking-wider text-gold-200 sm:text-[0.55rem]">
          {product.category}
        </span>
      </div>

      {/* Body */}
      <div className="px-2.5 py-2.5 sm:px-3 sm:py-3">
        <p className="mb-2 line-clamp-2 break-words text-xs font-semibold leading-snug text-slate-800 sm:text-sm">
          {product.productName}
        </p>

        <div className="mb-2.5 flex items-baseline justify-between gap-2 sm:mb-3">
          <div className="min-w-0">
            <span className="block text-[0.5rem] uppercase tracking-wider text-slate-400 sm:text-[0.55rem]">
              Price
            </span>
            <p className="flex items-center font-serif text-sm text-maroon-800 sm:text-base">
              <IndianRupee size={11} className="mr-0.5 shrink-0 sm:size-[12px]" />
              <span className="truncate">{formatINR(product.sellingPrice)}</span>
            </p>
          </div>
          {showSize && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-maroon-50 px-2 py-0.5 text-[0.6rem] font-bold text-maroon-700 sm:text-[0.65rem]">
              <Shirt size={10} className="shrink-0" />
              {item.size}
            </span>
          )}
          <span
            className={`shrink-0 font-mono text-[0.55rem] text-slate-400 sm:text-[0.6rem] ${
              showSize ? 'hidden sm:inline' : ''
            }`}
          >
            {item.barcodeId}
          </span>
        </div>

        {/* Scannable Code 128 barcode — preserve aspect ratio, never distort */}
        <div className="flex w-full items-center justify-center overflow-hidden rounded bg-white">
          <span
            className="barcode-svg block aspect-[3/1] h-auto w-full [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: item.svg }}
          />
        </div>
        <p className="mt-1 text-center font-mono text-[0.6rem] font-medium tracking-[0.12em] text-slate-700 sm:text-[0.65rem] sm:tracking-[0.15em]">
          {item.barcodeId}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="animate-fade-in-up rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-card sm:p-10 md:p-16">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-maroon-50 text-maroon-300 ring-1 ring-maroon-100">
        <Barcode size={30} />
      </div>
      <h2 className="font-serif text-lg text-maroon-800 sm:text-xl">No Barcode Yet</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
        Fill in the product details on the left and tap{' '}
        <span className="font-medium text-maroon-700">Generate Barcode</span> to see the label
        preview here.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Tag size={13} />
        <span>Saree &amp; Other categories supported</span>
      </div>
    </section>
  );
}

function downloadPrintable(product: ProductEntry, items: BarcodeItem[]) {
  const price = formatINR(product.sellingPrice);
  const labelsHtml = items
    .map((item) => {
      const sizeTag =
        product.category === 'Other' && item.size
          ? `<span class="size">${item.size}</span>`
          : '';
      return `
      <div class="label">
        <div class="brand">
          <span>Bhagya Lakshmi Textiles</span>
          <span class="cat">${product.category}</span>
        </div>
        <div class="body">
          <p class="name">${escapeHtml(product.productName)}</p>
          <div class="meta">
            <div><span class="lbl">Price</span><span class="price">₹${price}</span></div>
            ${sizeTag}
            <span class="code">${item.barcodeId}</span>
          </div>
          <div class="bars">${item.svg}</div>
          <p class="code-str">${item.barcodeId}</p>
        </div>
      </div>`;
    })
    .join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    product.productName,
  )} — Barcode Labels</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; margin:0; color:#1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .grid { display:flex; flex-wrap:wrap; gap:6px; justify-content:flex-start; }
    /* Physical print label: 50mm × 30mm */
    .label { width: 50mm; height: 30mm; border:1px solid #800020; border-radius:4px; overflow:hidden; page-break-inside:avoid; break-inside:avoid; margin:0; display:flex; flex-direction:column; }
    .brand { background:#800020; color:#fff; padding:2px 6px; display:flex; justify-content:space-between; align-items:center; font-family: Georgia, serif; font-size:9px; line-height:1.2; }
    .brand .cat { background:rgba(255,255,255,0.15); padding:0 4px; border-radius:3px; font-size:7px; text-transform:uppercase; letter-spacing:0.5px; color:#f4e3a8; }
    .body { padding:3px 6px; flex:1; display:flex; flex-direction:column; justify-content:space-between; }
    .name { font-size:10px; font-weight:600; margin:0; line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .meta { display:flex; justify-content:space-between; align-items:flex-end; gap:4px; }
    .lbl { display:block; font-size:6px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; line-height:1; }
    .price { font-family: Georgia, serif; font-size:13px; color:#800020; font-weight:600; line-height:1; }
    .size { font-size:8px; font-weight:700; color:#800020; background:#faf2f4; padding:1px 4px; border-radius:3px; }
    .code { font-family: monospace; font-size:7px; color:#94a3b8; }
    .bars { display:flex; align-items:center; height:11mm; overflow:hidden; }
    .bars svg { width:100%; height:100%; display:block; }
    .code-str { font-family: monospace; font-size:8px; text-align:center; letter-spacing:1px; color:#475569; margin:1px 0 0; }
  </style></head>
  <body><div class="grid">${labelsHtml}</div></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (w) {
    w.onload = () => {
      setTimeout(() => {
        w.focus();
        w.print();
      }, 500);
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
