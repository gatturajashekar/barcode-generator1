import { useCallback, useMemo, useState } from 'react';

import { Hash, Layers, Store, Loader2, AlertCircle } from 'lucide-react';

import Header from './components/Header';

import ProductFormCard from './components/ProductFormCard';

import BarcodePreview from './components/BarcodePreview';

import type { BarcodeItem, ProductEntry, ProductForm, SizeQuantity } from './types';

import { encodeCode128 } from './utils/barcode';

export default function App() {

  const [product, setProduct] = useState<ProductEntry | null>(null);

  const [labelCount, setLabelCount] = useState(6);

  const [isGenerating, setIsGenerating] = useState(false);

  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleAdd = useCallback(async (form: ProductForm) => {

    setIsGenerating(true);

    setGenerateError(null);

    try {

      const sizeRuns: SizeQuantity[] =

        form.category === 'Saree'

          ? [{

              size: null as unknown as SizeQuantity['size'],

              quantity: Number(form.sizeQuantities[0]?.quantity ?? 1),

              sellingPrice: form.sizeQuantities[0]?.sellingPrice ?? form.sellingPrice,

            }]

          : form.sizeQuantities.filter((sq) => Number(sq.quantity) > 0);

      const totalQuantity = sizeRuns.reduce(

        (sum, sq) => sum + Number(sq.quantity),

        0,

      );

      if (totalQuantity < 1) {

        throw new Error('Quantity must be at least 1');

      }

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {

        throw new Error('VITE_API_URL is missing from your .env file');

      }

const requestBody = {
  category: form.category,
  productName: form.productName.trim(),

  distributorName: form.distributorName.trim(), // NEW

  productType: form.category === 'Other' ? form.productType : null,
  purchasePrice: Number(form.purchasePrice),
  sellingPrice: Number(form.sellingPrice),

  sizeQuantities: sizeRuns.map((sq) => ({
    size: sq.size,
    quantity: Number(sq.quantity),
    sellingPrice: Number(sq.sellingPrice) || 0,
  })),
};

      const response = await fetch(

        `${apiUrl.replace(/\/+$/, '')}/products`,

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

          },

          body: JSON.stringify(requestBody),

        },

      );

      const gatewayResult = await response.json();

      const payload =

        typeof gatewayResult.body === 'string'

          ? JSON.parse(gatewayResult.body)

          : gatewayResult;

      if (!response.ok || payload.success === false) {

        throw new Error(

          payload.message ||

            payload.error ||

            'AWS barcode generation failed',

        );

      }

      const awsProduct = payload.product;

      if (!awsProduct || !Array.isArray(awsProduct.items)) {

        throw new Error('Invalid response received from AWS');

      }

      // Generate barcode SVG locally using the barcode ID returned by AWS.
      const items: BarcodeItem[] = awsProduct.items.map((item: any) => {

        const barcodeId = String(item.barcodeId);

        const sequenceNumber = Number(item.sequenceNumber);

        return {

          id: `${barcodeId}-${sequenceNumber}`,

          barcodeId,

          sequenceNumber,

          svg: encodeCode128(barcodeId),

          size: item.size ?? null,

          sellingPrice: Number(item.sellingPrice),

        };

      });

      const entry: ProductEntry = {

        id: awsProduct.id,

        category: awsProduct.category,

        productName: awsProduct.productName,

        productType: awsProduct.productType ?? null,

        purchasePrice: Number(awsProduct.purchasePrice),

        sellingPrice:

          form.category === 'Saree'

            ? Number(form.sellingPrice)

            : (items[0]?.sellingPrice ?? 0),

        quantity: Number(awsProduct.quantity),

        createdAt: Number(awsProduct.createdAt),

        startingSequence: Number(awsProduct.startingSequence),

        items,

      };

      setProduct(entry);

      setLabelCount(Math.max(1, Math.min(24, totalQuantity)));

    } catch (err) {

      setGenerateError(

        err instanceof Error

          ? err.message

          : 'Could not generate barcodes. Please try again.',

      );

    } finally {

      setIsGenerating(false);

    }

  }, []);

  const handleReset = useCallback(() => {

    setProduct(null);

    setGenerateError(null);

    setLabelCount(6);

  }, []);

  const summary = useMemo(() => {

    if (!product) return null;

    const prices = product.items.map((it) => it.sellingPrice);

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    const retailValue = prices.reduce((sum, p) => sum + p, 0);

    const avgPrice = prices.length > 0 ? retailValue / prices.length : 0;

    const margin = avgPrice - product.purchasePrice;

    const marginPct =

      product.purchasePrice > 0

        ? ((margin / product.purchasePrice) * 100).toFixed(1)

        : '—';

    return {

      margin,

      marginPct,

      minPrice,

      maxPrice,

      retailValue,

      avgPrice,

    };

  }, [product]);

  const previewItems = useMemo(() => {

    if (!product) return [];

    return product.items.slice(0, labelCount);

  }, [product, labelCount]);

  return (

    <div className="min-h-screen bg-slate-50">

      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">

        <div className="no-print mb-6 flex flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">

            <h2 className="font-serif text-xl text-maroon-800 sm:text-2xl md:text-3xl">

              Generate Product Barcode Labels

            </h2>

            <p className="mt-1 max-w-xl text-sm text-slate-500">

              Enter product details, preview the label, and print or download — built for the

              Bhagya Lakshmi Textiles counter.

            </p>

          </div>

          <div className="flex w-full shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-slate-600 shadow-card ring-1 ring-slate-100 sm:w-auto">

            <Store size={15} className="shrink-0 text-maroon-600" />

            <span>Counter Ready</span>

          </div>

        </div>

        {generateError && (

          <div className="no-print mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">

            <AlertCircle size={16} className="shrink-0" />

            <span>{generateError}</span>

          </div>

        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-8">

          <div className="space-y-5 lg:space-y-6">

            <div className="relative">

              <ProductFormCard

                onAdd={handleAdd}

                onReset={handleReset}

              />

              {isGenerating && (

                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">

                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-maroon-700 shadow-card">

                    <Loader2 size={16} className="animate-spin" />

                    Allocating unique barcodes…

                  </div>

                </div>

              )}

            </div>

            {product && summary && (

              <SummaryCard

                product={product}

                summary={summary}

              />

            )}

            {product && (

              <LabelCountSelector

                count={labelCount}

                onChange={setLabelCount}

                max={Math.min(24, product.items.length)}

              />

            )}

          </div>

          <BarcodePreview

            product={product}

            items={previewItems}

            totalCount={product?.quantity ?? 0}

          />

        </div>

        <Footer />

      </main>

    </div>

  );

}

function SummaryCard({

  product,

  summary,

}: {

  product: ProductEntry;

  summary: {

    margin: number;

    marginPct: string;

    minPrice: number;

    maxPrice: number;

    retailValue: number;

    avgPrice: number;

  };

}) {

  const formatINR = (v: number) =>

    new Intl.NumberFormat('en-IN', {

      maximumFractionDigits: 2,

      minimumFractionDigits: 2,

    }).format(v);

  const lastId =

    product.items.length > 0

      ? product.items[product.items.length - 1].barcodeId

      : '—';

  const isOther = product.category === 'Other';

  const priceLabel = isOther

    ? summary.minPrice === summary.maxPrice

      ? `₹${formatINR(summary.minPrice)}`

      : `₹${formatINR(summary.minPrice)} – ₹${formatINR(summary.maxPrice)}`

    : `₹${formatINR(product.sellingPrice)}`;

  return (

    <section className="no-print animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5 md:p-6">

      <div className="mb-3 flex items-center gap-2.5 sm:mb-4">

        <Layers size={16} className="shrink-0 text-maroon-600" />

        <h3 className="font-serif text-base text-maroon-800">

          Summary

        </h3>

      </div>

      <dl className="grid grid-cols-2 gap-2 sm:gap-x-4 sm:gap-y-3 sm:text-sm">

        <Stat label="Product" value={product.productName} />

        <Stat label="Category" value={product.category} />

        {product.productType && (

          <Stat label="Type" value={product.productType} />

        )}

        <Stat

          label="Purchase Price"

          value={`₹${formatINR(product.purchasePrice)}`}

        />

        <Stat

          label={isOther ? 'Price Range' : 'Selling Price'}

          value={priceLabel}

          accent

        />

        <Stat

          label="Quantity"

          value={String(product.quantity)}

        />

        <Stat

          label="Barcodes"

          value={String(product.items.length)}

        />

        <Stat

          label="First ID"

          value={product.items[0]?.barcodeId ?? '—'}

        />

        <Stat

          label="Last ID"

          value={lastId}

        />

        <Stat

          label="Margin / unit"

          value={`${summary.margin >= 0 ? '₹' : '-₹'}${formatINR(Math.abs(summary.margin))}`}

        />

        <Stat

          label="Margin %"

          value={`${summary.marginPct}%`}

        />

        <Stat

          label="Stock Value"

          value={`₹${formatINR(product.purchasePrice * product.quantity)}`}

        />

        <Stat

          label="Retail Value"

          value={`₹${formatINR(summary.retailValue)}`}

          accent

        />

      </dl>

    </section>

  );

}

function Stat({

  label,

  value,

  accent,

}: {

  label: string;

  value: string;

  accent?: boolean;

}) {

  return (

    <div className="min-w-0 rounded-lg bg-slate-50 px-2.5 py-2 sm:px-3">

      <dt className="text-[0.6rem] uppercase tracking-wider text-slate-400 sm:text-[0.65rem]">

        {label}

      </dt>

      <dd

        className={`mt-0.5 truncate text-xs font-semibold sm:text-sm ${

          accent ? 'text-maroon-700' : 'text-slate-800'

        }`}

        title={value}

      >

        {value}

      </dd>

    </div>

  );

}

function LabelCountSelector({

  count,

  onChange,

  max,

}: {

  count: number;

  onChange: (n: number) => void;

  max: number;

}) {

  const presets = [1, 6, 12, 24].filter((p) => p <= max);

  return (

    <section className="no-print animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5 md:p-6">

      <div className="mb-3 flex items-center gap-2.5">

        <Hash size={16} className="shrink-0 text-maroon-600" />

        <h3 className="font-serif text-base text-maroon-800">

          Labels to Preview

        </h3>

      </div>

      <div className="flex flex-wrap items-center gap-2">

        {presets.map((p) => (

          <button

            key={p}

            onClick={() => onChange(p)}

            className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-all ${

              count === p

                ? 'bg-maroon-700 text-white shadow-maroon'

                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'

            }`}

            aria-pressed={count === p}

          >

            {p}

          </button>

        ))}

        <div className="ml-1 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">

          <span className="text-xs text-slate-500">Custom</span>

          <input

            type="number"

            inputMode="numeric"

            min={1}

            max={max}

            value={count}

            onChange={(e) =>

              onChange(

                Math.max(

                  1,

                  Math.min(max, Number(e.target.value) || 1),

                ),

              )

            }

            className="w-14 rounded-md border border-slate-200 px-2 py-1 text-center text-base sm:text-sm focus:border-maroon-400 focus:outline-none focus:ring-2 focus:ring-maroon-100"

            aria-label="Custom label count"

          />

        </div>

      </div>

      <p className="mt-3 text-xs text-slate-400">

        Printing and PDF export include all {max} generated barcode

        {max !== 1 ? 's' : ''}.

      </p>

    </section>

  );

}

function Footer() {

  return (

    <footer className="no-print mt-10 border-t border-slate-200 pt-6 text-center sm:mt-12">

      <p className="font-serif text-sm text-maroon-800">

        Bhagya Lakshmi Textiles

      </p>

      <p className="mt-1 text-xs text-slate-400">

        Barcode Generator · Premium Textile Label Printing

      </p>

    </footer>

  );

}