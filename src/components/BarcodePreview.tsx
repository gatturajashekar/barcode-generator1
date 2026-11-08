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

export default function BarcodePreview({
  product,
  items,
  totalCount,
}: BarcodePreviewProps) {
  if (!product) {
    return <EmptyState />;
  }

  return (
    <section className="animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:px-7">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-black ring-1 ring-slate-200">
          <Barcode size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-base text-slate-900 sm:text-lg md:text-xl">
            Barcode Preview
          </h2>

          <p className="truncate text-xs text-slate-500 sm:text-sm">
            Showing {items.length} of {totalCount} generated label
            {totalCount !== 1 ? 's' : ''} — Code 128.
          </p>
        </div>

        <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-black ring-1 ring-slate-200 sm:inline">
          Scannable
        </span>
      </div>

      {/* Preview canvas */}
      <div className="bg-grid overflow-x-auto px-4 py-6 sm:px-7 sm:py-7">
        <div className="print-area mx-auto w-full">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
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
          className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] sm:px-6"
        >
          <Printer size={18} className="transition-transform group-hover:scale-110" />
          Print Labels
        </button>

        <button
          onClick={() => downloadPrintable(product, items)}
          className="group flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-slate-100 active:scale-[0.98] sm:px-6"
        >
          <Download size={18} className="transition-transform group-hover:translate-y-0.5" />
          Download PDF
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   50mm × 30mm MINIMAL LABEL
--------------------------------------------------------- */

function LabelCard({
  product,
  item,
}: {
  product: ProductEntry;
  item: BarcodeItem;
}) {
  const showSize = product.category === 'Other' && item.size;

  return (
    <div
      className="print-label flex shrink-0 flex-col overflow-hidden border border-black bg-white shadow-none"
      style={{
        width: '50mm',
        height: '30mm',
        borderRadius: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Product name and size */}
      <div className="flex min-h-0 flex-1 flex-col justify-between px-[2mm] py-[1mm]">
        <div className="flex items-center justify-between gap-1">
          <p className="min-w-0 truncate text-[11px] font-extrabold leading-tight text-black">
            {product.productName}
          </p>

          {showSize && (
            <span className="shrink-0 rounded-sm border border-black px-[1mm] text-[10px] font-extrabold leading-tight text-black">
              {item.size}
            </span>
          )}
        </div>

        {/* Large selling price */}
        <p className="text-center text-[15px] font-extrabold leading-none text-black">
          ₹{formatINR(item.sellingPrice ?? product.sellingPrice)}
        </p>

        {/* Barcode */}
        <div
          className="flex h-[10mm] w-full items-center justify-center overflow-hidden bg-white"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div
            className="barcode-svg block h-full w-full"
            style={{
              width: '100%',
              height: '10mm',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: item.svg }}
          />
        </div>

        {/* Barcode ID */}
        <p className="text-center font-mono text-[8px] font-bold leading-none tracking-[0.4px] text-black">
          {item.barcodeId}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   EMPTY STATE
--------------------------------------------------------- */

function EmptyState() {
  return (
    <section className="animate-fade-in-up rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center shadow-card sm:p-10 md:p-16">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-black ring-1 ring-slate-200">
        <Barcode size={30} />
      </div>

      <h2 className="font-serif text-lg text-slate-900 sm:text-xl">
        No Barcode Yet
      </h2>

      <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
        Fill in the product details on the left and tap{' '}
        <span className="font-medium text-black">Generate Barcode</span> to see
        the label preview here.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Tag size={13} />
        <span>Saree &amp; Other categories supported</span>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   PRINT / PDF EXPORT
   Each label is exactly 50mm × 30mm.
--------------------------------------------------------- */

function downloadPrintable(product: ProductEntry, items: BarcodeItem[]) {
  const labelsHtml = items
    .map((item) => {
      const price = formatINR(item.sellingPrice ?? product.sellingPrice);

      const sizeTag =
        product.category === 'Other' && item.size
          ? `<span class="size">${escapeHtml(item.size)}</span>`
          : '';

      return `
        <div class="label">
          <div class="body">
            <div class="product-row">
              <p class="name">${escapeHtml(product.productName)}</p>
              ${sizeTag}
            </div>

            <div class="price">₹${price}</div>

            <div class="bars">${item.svg}</div>

            <p class="code-str">${escapeHtml(item.barcodeId)}</p>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(product.productName)} — Barcode Labels</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <style>
    @page {
      size: 50mm 30mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .grid {
      display: block;
      width: 50mm;
      margin: 0;
      padding: 0;
    }

    .label {
      width: 50mm;
      height: 30mm;
      border: 0.3mm solid #000000;
      border-radius: 0;
      overflow: hidden;
      background: #ffffff;
      color: #000000;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .label:not(:last-child) {
      page-break-after: always;
      break-after: page;
    }

    .label:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Minimal, larger-print label details */
    .body {
      padding: 1mm 2mm;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .product-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1mm;
    }

    .name {
      font-size: 11px;
      font-weight: 800;
      color: #000000;
      margin: 0;
      line-height: 1.1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .size {
      font-size: 10px;
      font-weight: 800;
      color: #000000;
      border: 0.2mm solid #000000;
      padding: 0 1mm;
      white-space: nowrap;
    }

    .price {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 15px;
      color: #000000;
      font-weight: 800;
      line-height: 1;
      text-align: center;
    }

    .bars {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 10mm;
      overflow: hidden;
      background: #ffffff;
    }

    .bars svg {
      width: 100%;
      height: 100%;
      display: block;
      background: #ffffff;
    }

    .bars svg path {
      fill: #000000 !important;
    }

    .bars svg rect[fill="#000"],
    .bars svg rect[fill="#000000"] {
      fill: #000000 !important;
    }

    .code-str {
      font-family: monospace;
      font-size: 8px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 0.4px;
      color: #000000;
      margin: 0;
      line-height: 1;
    }

    @media screen {
      body {
        padding: 10mm;
      }
    }

    @media print {
      html,
      body {
        margin: 0;
        padding: 0;
        width: 50mm;
        height: auto;
      }
    }
  </style>
</head>

<body>
  <div class="grid">${labelsHtml}</div>
</body>
</html>`;

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

/* ---------------------------------------------------------
   HTML ESCAPING
--------------------------------------------------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}