
export type Category = 'Saree' | 'Other';

export type ProductType = 'Kids Wear' | 'Women Wear' | 'Gents Wear';

export type OfferType = 'No Offer' | '1+1' | '2+1';

export const OFFER_OPTIONS: OfferType[] = [
  'No Offer',
  '1+1',
  '2+1',
];

export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export const PRODUCT_TYPES: ProductType[] = [
  'Kids Wear',
  'Women Wear',
  'Gents Wear',
];

export const SIZE_OPTIONS: Record<ProductType, ClothingSize[]> = {
  'Kids Wear': ['S', 'M', 'L', 'XL', 'XXL'],
  'Women Wear': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'Gents Wear': ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
};

export type SizeQuantity = {
  size: ClothingSize;
  quantity: number;
  sellingPrice: string;
};

export type BarcodeItem = {
  id: string;
  barcodeId: string;
  sequenceNumber: number;
  svg: string;
  size: ClothingSize | null;
  sellingPrice: number;
};

export type ProductEntry = {
  id: string;
  category: Category;
  productName: string;
  distributorName: string;
  productType: ProductType | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  createdAt: number;
  startingSequence: number;
  items: BarcodeItem[];

  // Offer applied to this product
  offer?: OfferType;
};

export type ProductForm = {
  category: Category;
  productName: string;
  distributorName: string;
  productType: ProductType | null;
  purchasePrice: string;
  sellingPrice: string;
  sizeQuantities: SizeQuantity[];

  // Offer selected while adding a product
  offer: OfferType;
};
