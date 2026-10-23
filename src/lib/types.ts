export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'shipping' | 'settings' | 'seo' | 'admins';

export const ALL_ADMIN_PERMISSIONS: AdminTab[] = [
  'dashboard',
  'products',
  'categories',
  'orders',
  'shipping',
  'settings',
  'seo',
  'admins'
];

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  role: 'all' | 'custom' | 'orders_only';
  permissions: AdminTab[];
  createdAt: string;
}

export interface Product {
  id: number;
  nameAr: string;
  nameEn?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  priceAfterDiscount: number;
  categoryId: number;
  available: boolean;
  inStock: boolean;
  images: string[];
  updatedAt: string;
  createdAt?: string;
}

export interface Category {
  id: number;
  nameAr: string;
  nameEn?: string | null;
  icon?: string | null;
}

export interface Governorate {
  id: number;
  nameAr: string;
  nameEn?: string | null;
  shippingFee: number;
  active: boolean;
}

export interface OrderItem {
  productId: number;
  nameAr: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  governorateId: number;
  governorateName: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'vodafone_cash' | 'instapay';
  paymentSenderInfo?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HeroSlide {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  phone: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  bannerEnabled: boolean;
  bannerText: string;
  adminPasswordHash?: string;
  instapayAccount: string;
  instapayInstructions: string;
  vodafoneCashNumber: string;
  vodafoneCashInstructions: string;
  footerAboutText?: string;
  footerAddress?: string;
  footerGuarantees?: string[];
  footerCopyrightText?: string;
  footerDeveloperName?: string;
  footerDeveloperUrl?: string;

  // Hero Media Banner
  heroBannerEnabled?: boolean;
  heroBannerType?: 'slideshow' | 'video';
  heroSlides?: HeroSlide[];
  heroVideoUrl?: string;

  // SEO Settings
  siteTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  twitterHandle?: string;
  googleSiteVerification?: string;
  robotsIndexing?: boolean;
}
