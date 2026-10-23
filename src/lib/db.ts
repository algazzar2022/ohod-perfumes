import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth';
export * from './types';
import { Product, Category, Governorate, Order, StoreSettings, AdminUser, AdminTab, ALL_ADMIN_PERMISSIONS } from './types';

export interface DatabaseData {
  products: Product[];
  categories: Category[];
  governorates: Governorate[];
  orders: Order[];
  settings: StoreSettings;
  admins: AdminUser[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'store.json');
const INITIAL_PATH = path.join(DATA_DIR, 'initial-catalog.json');

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'عطور أحد | Ohod Perfumes',
  storeTagline: 'عطور فاخرة وأصلية بأسعار منافسة في مصر',
  phone: '01015192223',
  whatsapp: '201015192223',
  facebookUrl: 'https://www.facebook.com/groups/448204199913696',
  instagramUrl: 'https://www.instagram.com/nehalmahmoud2022/',
  tiktokUrl: 'https://www.tiktok.com/@nehalmahmoud7',
  bannerEnabled: false,
  bannerText: '🚚 شحن سريع لجميع محافظات مصر | دفع آمن عبر انستاباي وفودافون كاش',

  // Payments Defaults
  instapayAccount: 'ohodperfumes@instapay',
  instapayInstructions: 'يرجى تحويل إجمالي المبلغ عبر تطبيق انستاباي إلى العنوان أعلاه ثم إدخال رقم الحساب/الهاتف المحول منه لتأكيد الطلب.',
  vodafoneCashNumber: '01015192223',
  vodafoneCashInstructions: 'يرجى تحويل إجمالي المبلغ لمحفظة فودافون كاش على الرقم أعلاه ثم إدخال رقم المحفظة المحول منها.',

  // Footer Defaults
  footerAboutText: 'عطور أحد (Ohod Perfumes) - وجهتك الأولى لأرقى العطور الفرنسية والشرقية الأصلية المركزة بدون كحول في مصر. ثبات يدوم طويلاً بأسعار منافسة وتوصيل فوري لجميع المحافظات.',
  footerAddress: 'جمهورية مصر العربية - توصيل لكافة المحافظات',
  footerGuarantees: [
    'ضمان أصالة المنتجات ١٠٠٪',
    'توصيل سريع وآمن لجميع المحافظات',
    'دفع إلكتروني فوري وموثوق عبر انستاباي وفودافون كاش',
    'خدمة عملاء ومتابعة مستمرة بعد الطلب'
  ],
  footerCopyrightText: '© 2026 عطور أحد - Ohod Perfumes. جميع الحقوق محفوظة.',
  footerDeveloperName: 'MOHAMED ALGAZZAR',
  footerDeveloperUrl: 'https://www.facebook.com/algazzar2015',

  // SEO Defaults
  siteTitle: 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر',
  metaDescription: 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد (Ohod Perfumes). عطور فرنسية وشرقية رجالي وحريمي، ثبات عالي وتوصيل سريع لكافة المحافظات مع دفع سهل عبر انستاباي وفودافون كاش.',
  metaKeywords: 'عطور أحد, Ohod Perfumes, عطور فرنسية, عطور شرقية, دون الأصلي, دون الأبيض, دون البينك, زيوت عطرية, عطور بدون كحول, عطور مصر, شراء عطور أونلاين',
  canonicalUrl: 'https://ohod-perfumes.com',
  ogImage: '/images/logo/don-logo-160.png',
  twitterHandle: '@ohodperfumes',
  googleSiteVerification: '',
  robotsIndexing: true
};

function ensureInitialized(): DatabaseData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(content);
      // Merge new settings keys if missing
      parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
      if (!Array.isArray(parsed.admins) || parsed.admins.length === 0) {
        parsed.admins = [
          {
            id: 'admin-1',
            username: 'algazzar',
            name: 'محمد الجزار',
            passwordHash: hashPassword('algazzar'),
            role: 'all',
            permissions: ALL_ADMIN_PERMISSIONS,
            createdAt: new Date().toISOString()
          }
        ];
        saveDb(parsed);
      }
      return parsed;
    } catch {
      // Fallback
    }
  }

  let initialCatalog: { products?: Product[]; categories?: Category[]; governorates?: Governorate[] } = {};
  if (fs.existsSync(INITIAL_PATH)) {
    try {
      initialCatalog = JSON.parse(fs.readFileSync(INITIAL_PATH, 'utf8'));
    } catch {
      // Continue
    }
  }

  const defaultData: DatabaseData = {
    products: initialCatalog.products || [],
    categories: initialCatalog.categories || [],
    governorates: initialCatalog.governorates || [],
    orders: [
      {
        id: 'ord-1001',
        orderNumber: 'OHOD-1001',
        customerName: 'أحمد محمود',
        phone: '01012345678',
        governorateId: 9,
        governorateName: 'القاهره',
        address: 'شارع الهرم - محطة نصر الدين - عمارة 15 الدور الرابع',
        notes: 'يرجى الاتصال قبل الوصول بنصف ساعة',
        items: [
          {
            productId: 1,
            nameAr: 'أحد الأبيض 6مل',
            price: 140,
            quantity: 2,
            image: '/images/products/1.jpeg'
          }
        ],
        subtotal: 280,
        shippingFee: 90,
        total: 370,
        status: 'pending',
        paymentMethod: 'instapay',
        paymentSenderInfo: 'ahmed@instapay',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    settings: DEFAULT_SETTINGS,
    admins: [
      {
        id: 'admin-1',
        username: 'algazzar',
        name: 'محمد الجزار',
        passwordHash: hashPassword('algazzar'),
        role: 'all',
        permissions: ALL_ADMIN_PERMISSIONS,
        createdAt: new Date().toISOString()
      }
    ]
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  return defaultData;
}

export function getDb(): DatabaseData {
  return ensureInitialized();
}

export function saveDb(data: DatabaseData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = DB_PATH + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, DB_PATH);
}
