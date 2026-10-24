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

  // Hero Media Banner Defaults
  heroBannerEnabled: true,
  heroBannerType: 'slideshow',
  heroSlides: [
    {
      image: 'https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg',
      title: 'عطور أحد | فخامة وثبات استثنائي',
      subtitle: 'أرقى العطور الفرنسية والشرقية الأصلية بدون كحول',
      link: '/?category=7'
    }
  ],
  heroVideoUrl: '',

  // Payments Defaults
  instapayAccount: '01112724099',
  instapayInstructions: 'يرجى تحويل إجمالي المبلغ عبر تطبيق انستاباي إلى رقم الهاتف أعلاه ثم إدخال رقم هاتفك المحول منه لتأكيد الطلب.',
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
  canonicalUrl: 'https://ohodperfumes.com',
  ogImage: 'https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg',
  twitterHandle: '@ohodperfumes',
  googleSiteVerification: '',
  robotsIndexing: true
};

import { supabase } from './supabase';

// Global in-memory cache to maintain state across requests in serverless functions
let memoryDb: DatabaseData | null = null;

// Supabase sync helpers
async function fetchFromSupabase(): Promise<DatabaseData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('store_data')
      .select('value')
      .eq('key', 'main')
      .single();

    if (error || !data) return null;
    return data.value as DatabaseData;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

async function writeToSupabase(data: DatabaseData): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from('store_data')
      .upsert({
        key: 'main',
        value: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (err) {
    console.error('Supabase save error:', err);
  }
}

// Helpers to read/write from Vercel KV / Upstash Redis if configured
function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function fetchFromRedis(key: string): Promise<any | null> {
  const conf = getRedisConfig();
  if (!conf) return null;
  try {
    const res = await fetch(`${conf.url}/get/${key}`, {
      headers: { Authorization: `Bearer ${conf.token}` },
      cache: 'no-store'
    });
    const json = await res.json();
    if (json.result) {
      return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    }
  } catch (e) {
    console.error('Redis read error:', e);
  }
  return null;
}

async function writeToRedis(key: string, value: any): Promise<boolean> {
  const conf = getRedisConfig();
  if (!conf) return false;
  try {
    await fetch(`${conf.url}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${conf.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(typeof value === 'string' ? value : JSON.stringify(value)),
      cache: 'no-store'
    });
    return true;
  } catch (e) {
    console.error('Redis write error:', e);
    return false;
  }
}

function ensureInitialized(): DatabaseData {
  if (memoryDb) {
    return memoryDb;
  }

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // In readonly serverless environments, ignore mkdir errors
    }
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(content);
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
      }
      memoryDb = parsed;
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
    orders: [],
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

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  } catch {
    // Readonly fallback
  }

  memoryDb = defaultData;
  return defaultData;
}

export function getDb(): DatabaseData {
  return ensureInitialized();
}

export function saveDb(data: DatabaseData): void {
  memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempPath = DB_PATH + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_PATH);
  } catch {
    // In serverless readonly environments, writing to disk fails silently;
    // in-memory persists for execution duration and Redis syncs below
  }

  // If Vercel Storage / Upstash Redis is connected, sync asynchronously
  if (getRedisConfig()) {
    writeToRedis('ohod_store_data', data).catch(console.error);
  }

  // If Supabase is connected, sync asynchronously
  if (supabase) {
    writeToSupabase(data).catch(console.error);
  }
}

export async function saveDbAsync(data: DatabaseData): Promise<void> {
  memoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempPath = DB_PATH + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_PATH);
  } catch {
    // serverless disk fallback
  }

  const tasks: Promise<any>[] = [];
  if (getRedisConfig()) {
    tasks.push(writeToRedis('ohod_store_data', data));
  }
  if (supabase) {
    tasks.push(writeToSupabase(data));
  }

  if (tasks.length > 0) {
    await Promise.allSettled(tasks);
  }
}

// Async hydration from Supabase or Vercel Redis (if active)
export async function getDbAsync(): Promise<DatabaseData> {
  const current = getDb();

  // Try Supabase first
  if (supabase) {
    const supaData = await fetchFromSupabase();
    if (supaData && supaData.admins) {
      memoryDb = supaData;
      return supaData;
    }
  }

  // Try Redis
  if (getRedisConfig()) {
    const remoteData = await fetchFromRedis('ohod_store_data');
    if (remoteData && remoteData.admins) {
      memoryDb = remoteData;
      return remoteData;
    }
  }

  return current;
}
