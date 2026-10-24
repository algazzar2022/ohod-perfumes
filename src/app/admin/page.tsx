'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Truck,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Search,
  ExternalLink,
  MessageCircle,
  Phone,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Lock,
  ChevronDown,
  CreditCard,
  Smartphone,
  Copy,
  FileText,
  ShieldCheck,
  LogOut,
  Key,
  Users,
  UserPlus,
  Globe,
  Share2,
  Sparkles,
  Upload,
  ImageIcon,
  Film,
  ArrowRight
} from 'lucide-react';
import { Product, Category, Governorate, Order, StoreSettings, AdminUser, AdminTab, ALL_ADMIN_PERMISSIONS } from '@/lib/types';

const SECTION_CONFIG: { id: AdminTab; label: string; desc: string; icon: any }[] = [
  { id: 'dashboard', label: 'الإحصائيات العامة', desc: 'نظرة عامة على المبيعات والمؤشرات', icon: LayoutDashboard },
  { id: 'products', label: 'إدارة المنتجات', desc: 'إضافة وتعديل وحذف وأسعار المنتجات', icon: Package },
  { id: 'categories', label: 'الأقسام والتصنيفات', desc: 'إدارة وتعديل أقسام المتجر', icon: FolderTree },
  { id: 'orders', label: 'إدارة الطلبات والشحن', desc: 'متابعة الطلبات وتحديث حالاتها وتفاصيل العملاء', icon: ShoppingBag },
  { id: 'shipping', label: 'المحافظات وأسعار الشحن', desc: 'تحديد تكاليف الشحن لكل محافظة', icon: Truck },
  { id: 'settings', label: 'إعدادات المتجر العامة', desc: 'بيانات التواصل، طرق الدفع والفوتر والشريط', icon: Settings },
  { id: 'seo', label: 'تهيئة محركات البحث (SEO)', desc: 'ظهور المتجر على جوجل ومواقع التواصل الاجتماعي', icon: Globe },
  { id: 'admins', label: 'إدارة المشرفين والمسؤولين', desc: 'إضافة المشرفين والتحكم بصلاحياتهم وحذفهم', icon: Users },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    name: string;
    role?: 'all' | 'custom' | 'orders_only';
    permissions?: AdminTab[];
  } | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [admins, setAdmins] = useState<Omit<AdminUser, 'passwordHash'>[]>([]);

  // Modals for Admins
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState<{
    username: string;
    name: string;
    password: string;
    permissions: AdminTab[];
  }>({
    username: '',
    name: '',
    password: '',
    permissions: ['orders']
  });
  const [changePassModalOpen, setChangePassModalOpen] = useState(false);
  const [selectedAdminForPass, setSelectedAdminForPass] = useState<Omit<AdminUser, 'passwordHash'> | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [editPermModalOpen, setEditPermModalOpen] = useState(false);
  const [selectedAdminForPerm, setSelectedAdminForPerm] = useState<Omit<AdminUser, 'passwordHash'> | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<AdminTab[]>([]);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<number | 'all'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Product Form State
  const [prodForm, setProdForm] = useState({
    nameAr: '',
    nameEn: '',
    categoryId: 1,
    price: 100,
    priceAfterDiscount: 0,
    descriptionAr: '',
    inStock: true,
    stockQuantity: 50,
    image: '/images/logo/don-logo-160.png'
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [heroUploadingIndex, setHeroUploadingIndex] = useState<number | null>(null);
  const [heroVideoUploading, setHeroVideoUploading] = useState(false);

  // Category Form State
  const [catForm, setCatForm] = useState({
    nameAr: '',
    nameEn: '',
    icon: 'Sparkles'
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    storeName: '',
    storeTagline: '',
    phone: '',
    whatsapp: '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    bannerEnabled: true,
    bannerText: '',
    heroBannerEnabled: true,
    heroBannerType: 'slideshow',
    heroSlides: [
      {
        image: 'https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg',
        title: 'عطور أحد | فخامة وثبات استثنائي',
        subtitle: 'أرقى العطور الفرنسية والشرقية الأصلية بدون كحول',
        link: '/categories/7'
      }
    ],
    heroVideoUrl: '',
    instapayAccount: '',
    instapayInstructions: '',
    vodafoneCashNumber: '',
    vodafoneCashInstructions: '',
    footerAboutText: '',
    footerAddress: '',
    footerGuarantees: [],
    footerCopyrightText: '',
    footerDeveloperName: '',
    footerDeveloperUrl: ''
  });

  // Notification Toast
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3000);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catalogRes, ordersRes, settingsRes, adminsRes] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/orders'),
        fetch('/api/settings'),
        fetch('/api/admins')
      ]);

      const [catalogData, ordersData, settingsData, adminsData] = await Promise.all([
        catalogRes.json(),
        ordersRes.json(),
        settingsRes.json(),
        adminsRes.json()
      ]);

      if (catalogData.success) {
        setProducts(catalogData.products || []);
        setCategories(catalogData.categories || []);
        setGovernorates(catalogData.governorates || []);
      }
      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
      if (adminsData.success) {
        setAdmins(adminsData.admins || []);
      }
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
        setSettingsForm({
          storeName: '',
          storeTagline: '',
          phone: '',
          whatsapp: '',
          facebookUrl: '',
          instagramUrl: '',
          tiktokUrl: '',
          bannerEnabled: true,
          bannerText: '',
          heroBannerEnabled: true,
          heroBannerType: 'slideshow',
          heroSlides: [
            {
              image: 'https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg',
              title: 'عطور أحد | فخامة وثبات استثنائي',
              subtitle: 'أرقى العطور الفرنسية والشرقية الأصلية بدون كحول',
              link: '/categories/7'
            }
          ],
          heroVideoUrl: '',
          instapayAccount: '',
          instapayInstructions: '',
          vodafoneCashNumber: '',
          vodafoneCashInstructions: '',
          footerAboutText: '',
          footerAddress: '',
          footerGuarantees: [],
          footerCopyrightText: '',
          footerDeveloperName: '',
          footerDeveloperUrl: '',
          ...settingsData.settings
        });
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (tab: AdminTab) => {
    if (!currentUser) return false;
    if (currentUser.role === 'all') return true;
    if (Array.isArray(currentUser.permissions)) {
      return currentUser.permissions.includes(tab);
    }
    if (currentUser.role === 'orders_only') {
      return tab === 'orders';
    }
    return false;
  };

  const getFirstAllowedTab = (user: typeof currentUser): AdminTab => {
    if (!user) return 'orders';
    if (user.role === 'all') return 'dashboard';
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      return user.permissions[0];
    }
    if (user.role === 'orders_only') return 'orders';
    return 'orders';
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('ohod_admin_auth');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        setActiveTab(getFirstAllowedTab(parsed));
        fetchData();
        return;
      } catch {
        localStorage.removeItem('ohod_admin_auth');
      }
    }
    setIsAuthenticated(false);
    setLoading(false);
  }, []);

  // Handlers for Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('ohod_admin_auth', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setActiveTab(getFirstAllowedTab(data.user));
        fetchData();
        showToast(`مرحباً بك يا ${data.user.name}`);
      } else {
        setLoginError(data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setLoginError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue
    }
    localStorage.removeItem('ohod_admin_auth');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    showToast('تم تسجيل الخروج بنجاح');
  };

  // Handlers for Admins
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.username.trim() || !newAdminForm.password) {
      showToast('اسم المستخدم وكلمة المرور مطلوبان');
      return;
    }
    if (newAdminForm.permissions.length === 0) {
      showToast('يجب اختيار قسم واحد على الأقل للمشرف');
      return;
    }
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminForm)
      });
      const data = await res.json();
      if (data.success && data.admin) {
        setAdmins(prev => [...prev, data.admin]);
        setAdminModalOpen(false);
        setNewAdminForm({ username: '', name: '', password: '', permissions: ['orders'] });
        showToast('تمت إضافة المشرف الجديد بنجاح');
      } else {
        showToast(data.error || 'فشلت إضافة المشرف');
      }
    } catch {
      showToast('حدث خطأ أثناء إضافة المشرف');
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المشرف (${name})؟`)) return;
    try {
      const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAdmins(prev => prev.filter(a => a.id !== id));
        showToast('تم حذف المشرف بنجاح');
      } else {
        showToast(data.error || 'فشل حذف المشرف');
      }
    } catch {
      showToast('حدث خطأ أثناء حذف المشرف');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminForPass || !newPasswordValue || newPasswordValue.length < 4) {
      showToast('كلمة المرور يجب أن تكون ٤ خانات على الأقل');
      return;
    }
    try {
      const res = await fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAdminForPass.id,
          password: newPasswordValue
        })
      });
      const data = await res.json();
      if (data.success) {
        setChangePassModalOpen(false);
        setSelectedAdminForPass(null);
        setNewPasswordValue('');
        showToast('تم تغيير كلمة المرور بنجاح');
      } else {
        showToast(data.error || 'فشل تغيير كلمة المرور');
      }
    } catch {
      showToast('حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const handleOpenEditPermissions = (adm: Omit<AdminUser, 'passwordHash'>) => {
    setSelectedAdminForPerm(adm);
    const perms: AdminTab[] = Array.isArray(adm.permissions) && adm.permissions.length > 0
      ? (adm.permissions as AdminTab[])
      : (adm.role === 'orders_only' ? (['orders'] as AdminTab[]) : ALL_ADMIN_PERMISSIONS);
    setEditingPermissions(perms);
    setEditPermModalOpen(true);
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminForPerm) return;
    if (editingPermissions.length === 0) {
      showToast('يجب اختيار قسم واحد على الأقل للمشرف');
      return;
    }
    try {
      const res = await fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAdminForPerm.id,
          permissions: editingPermissions
        })
      });
      const data = await res.json();
      if (data.success && data.admin) {
        setAdmins(prev => prev.map(a => a.id === data.admin.id ? data.admin : a));
        // If current user modified own permissions, update currentUser in local storage
        if (currentUser?.id === data.admin.id) {
          const updatedUser = { ...currentUser, ...data.admin };
          setCurrentUser(updatedUser);
          localStorage.setItem('ohod_admin_auth', JSON.stringify(updatedUser));
        }
        setEditPermModalOpen(false);
        setSelectedAdminForPerm(null);
        showToast('تم تحديث صلاحيات المشرف بنجاح');
      } else {
        showToast(data.error || 'فشل تحديث الصلاحيات');
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ الصلاحيات');
    }
  };

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      nameAr: '',
      nameEn: '',
      categoryId: categories[0]?.id || 1,
      price: 100,
      priceAfterDiscount: 0,
      descriptionAr: '',
      inStock: true,
      stockQuantity: 50,
      image: '/images/logo/don-logo-160.png'
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      nameAr: prod.nameAr,
      nameEn: prod.nameEn || '',
      categoryId: prod.categoryId,
      price: prod.price,
      priceAfterDiscount: prod.priceAfterDiscount || 0,
      descriptionAr: prod.descriptionAr || '',
      inStock: prod.inStock,
      stockQuantity: prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock ? 50 : 0),
      image: prod.images?.[0] || '/images/logo/don-logo-160.png'
    });
    setProductModalOpen(true);
  };

  const uploadFileToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.success && data.url) {
        showToast('تم رفع الملف بنجاح عبر Cloudinary ✨');
        return data.url;
      } else {
        alert(data.error || 'فشل رفع الملف إلى Cloudinary');
        return null;
      }
    } catch {
      alert('حدث خطأ أثناء رفع الملف');
      return null;
    }
  };

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProdForm(prev => ({ ...prev, image: data.url }));
        showToast('تم رفع الصورة وضغطها بنجاح عبر Cloudinary ✨');
      } else {
        alert(data.error || 'فشل رفع الصورة إلى Cloudinary');
      }
    } catch {
      alert('حدث خطأ في الاتصال أثناء رفع الصورة');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...prodForm,
            images: [prodForm.image]
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('تم تحديث المنتج بنجاح');
          setProductModalOpen(false);
          fetchData();
        } else {
          alert(data.error);
        }
      } else {
        // Create
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...prodForm,
            images: [prodForm.image]
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('تمت إضافة المنتج بنجاح');
          setProductModalOpen(false);
          fetchData();
        } else {
          alert(data.error);
        }
      }
    } catch {
      showToast('تعذر حفظ التغييرات');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف المنتج بنجاح');
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert(data.error);
      }
    } catch {
      showToast('حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleStock = async (prod: Product) => {
    try {
      const newStock = !prod.inStock;
      const newQty = newStock ? (prod.stockQuantity && prod.stockQuantity > 0 ? prod.stockQuantity : 50) : 0;
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStock, stockQuantity: newQty })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev =>
          prev.map(p => (p.id === prod.id ? { ...p, inStock: newStock, stockQuantity: newQty } : p))
        );
        showToast(newStock ? 'تم التعيين كـ متوفر' : 'تم التعيين كـ نفذت الكمية');
      }
    } catch {
      showToast('فشل تعديل حالة التوفر');
    }
  };

  // Handlers for Categories
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({ nameAr: '', nameEn: '', icon: 'Sparkles' });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({ nameAr: cat.nameAr, nameEn: cat.nameEn || '', icon: cat.icon || 'Sparkles' });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catForm)
        });
        const data = await res.json();
        if (data.success) {
          showToast('تم تعديل الفئة بنجاح');
          setCategoryModalOpen(false);
          fetchData();
        }
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catForm)
        });
        const data = await res.json();
        if (data.success) {
          showToast('تمت إضافة الفئة بنجاح');
          setCategoryModalOpen(false);
          fetchData();
        }
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ الفئة');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const prodCount = products.filter(p => p.categoryId === id).length;
    if (prodCount > 0) {
      alert(`لا يمكن حذف هذه الفئة لأنها تحتوي على ${prodCount} منتج. قم بتغيير فئة المنتجات أولاً.`);
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('تم حذف الفئة بنجاح');
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch {
      showToast('فشل حذف الفئة');
    }
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
        showToast('تم تحديث حالة الطلب بنجاح');
      }
    } catch {
      showToast('فشل تحديث حالة الطلب');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('هل تريد حذف هذا الطلب نهائياً؟')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        if (selectedOrderDetails?.id === orderId) setSelectedOrderDetails(null);
        showToast('تم حذف الطلب بنجاح');
      }
    } catch {
      showToast('فشل حذف الطلب');
    }
  };

  // Handlers for Shipping
  const handleUpdateShippingFee = async (govId: number, fee: number) => {
    try {
      const res = await fetch('/api/governorates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: govId, shippingFee: fee })
      });
      const data = await res.json();
      if (data.success) {
        setGovernorates(prev =>
          prev.map(g => (g.id === govId ? { ...g, shippingFee: fee } : g))
        );
        showToast('تم تحديث سعر الشحن');
      }
    } catch {
      showToast('فشل تحديث سعر الشحن');
    }
  };

  // Handlers for Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast('تم حفظ إعدادات المتجر بنجاح');
      }
    } catch {
      showToast('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  // Calculations for Dashboard
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const outOfStockCount = products.filter(p => !p.inStock).length;
  const isOrdersOnly = currentUser?.role === 'orders_only';

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-white" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs text-stone-400 font-bold">جاري فحص صلاحيات الدخول...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 relative overflow-hidden" dir="rtl">
        {/* Glow Effects */}
        <div className="absolute w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-96 h-96 bg-amber-900/10 rounded-full blur-3xl -bottom-20 -left-20 pointer-events-none" />

        <div className="bg-stone-900 border border-stone-800 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <Image
                src="/images/logo/don-logo-160.png"
                alt="عطور أحد"
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
            <h1 className="text-2xl font-black text-white">لوحة تحكم عطور أحد</h1>
            <p className="text-stone-400 text-xs">يرجى إدخال اسم المستخدم وكلمة المرور للمتابعة</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="algazzar"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                كلمة المرور (Password)
              </label>
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 text-sm transition transform active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-amber-600 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-stone-900 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/images/logo/don-logo-160.png"
                alt="عطور أحد - Ohod Perfumes"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-white leading-none">
                عطور أحد
              </span>
              <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">
                Ohod Perfumes
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-300 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold">{currentUser.name}</span>
              <span className="text-[10px] bg-stone-700 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                {currentUser.role === 'all' || (currentUser.permissions && currentUser.permissions.length === ALL_ADMIN_PERMISSIONS.length)
                  ? 'صلاحيات كاملة'
                  : `صلاحيات محددة (${currentUser.permissions?.length || 1})`}
              </span>
            </div>
          )}
          <button
            onClick={fetchData}
            className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-700 transition"
          >
            <span>زيارة المتجر</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-800 transition cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      {/* Main Admin Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-l border-stone-200 p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
          {hasPermission('dashboard') && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'dashboard'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>الإحصائيات العامة</span>
            </button>
          )}

          {hasPermission('products') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'products'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>إدارة المنتجات ({products.length})</span>
              </div>
              {outOfStockCount > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === 'products' ? 'bg-amber-800 text-white' : 'bg-red-100 text-red-700 font-bold'
                }`}>
                  {outOfStockCount} نفذ
                </span>
              )}
            </button>
          )}

          {hasPermission('categories') && (
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'categories'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>الأقسام والتصنيفات ({categories.length})</span>
            </button>
          )}

          {hasPermission('orders') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>الطلبات ({orders.length})</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800 font-bold'
                }`}>
                  {pendingOrdersCount} جديد
                </span>
              )}
            </button>
          )}

          {hasPermission('shipping') && (
            <button
              onClick={() => setActiveTab('shipping')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'shipping'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>المحافظات والشحن</span>
            </button>
          )}

          {hasPermission('settings') && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'settings'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>إعدادات المتجر</span>
            </button>
          )}

          {hasPermission('seo') && (
            <button
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'seo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>تهيئة محركات البحث (SEO)</span>
            </button>
          )}

          {hasPermission('admins') && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition flex-shrink-0 md:w-full ${
                activeTab === 'admins'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>إدارة المشرفين</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'admins' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-750 font-bold'
              }`}>
                {admins.length}
              </span>
            </button>
          )}

          <div className="hidden md:block mt-auto pt-4 border-t border-stone-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition w-full cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج من اللوحة</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-black text-stone-900 mb-1">لوحة القيادة والمؤشرات</h1>
                <p className="text-stone-500 text-xs sm:text-sm">نظرة عامة على مبيعات وأداء متجر عطور أحد (Ohod Perfumes)</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-xs font-bold text-stone-600">إجمالي الطلبات</span>
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">{orders.length}</div>
                  <span className="text-xs text-amber-700 font-bold mt-1 block">
                    {pendingOrdersCount} بانتظار المراجعة
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-xs font-bold text-stone-600">إجمالي المبيعات</span>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {totalRevenue} <span className="text-xs font-bold text-stone-500">ج.م</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold mt-1 block">
                    للطلبات غير الملغاة
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-xs font-bold text-stone-600">إجمالي المنتجات</span>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">{products.length}</div>
                  <span className="text-xs text-stone-500 font-bold mt-1 block">
                    موزعة على {categories.length} أقسام
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between text-stone-400 mb-2">
                    <span className="text-xs font-bold text-stone-600">تنبيهات المخزون</span>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">{outOfStockCount}</div>
                  <span className="text-xs text-red-600 font-bold mt-1 block">منتجات نفذت كميتها</span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-900 text-base">أحدث الطلبات المستلمة</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-amber-700 hover:text-amber-800 text-xs font-bold underline"
                  >
                    عرض كل الطلبات
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-stone-400 text-xs py-4 text-center">لا توجد طلبات حتى الآن</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                        <tr>
                          <th className="py-2.5 px-3">رقم الطلب</th>
                          <th className="py-2.5 px-3">العميل</th>
                          <th className="py-2.5 px-3">المحافظة</th>
                          <th className="py-2.5 px-3">الإجمالي</th>
                          <th className="py-2.5 px-3">الحالة</th>
                          <th className="py-2.5 px-3">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-50">
                            <td className="py-3 px-3 font-bold text-amber-800">{ord.orderNumber}</td>
                            <td className="py-3 px-3 font-medium text-stone-800">{ord.customerName}</td>
                            <td className="py-3 px-3 text-stone-600">{ord.governorateName}</td>
                            <td className="py-3 px-3 font-black text-stone-900">{ord.total} ج.م</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                ord.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {ord.status === 'pending'
                                  ? 'قيد المراجعة'
                                  : ord.status === 'processing'
                                  ? 'جاري التجهيز'
                                  : ord.status === 'shipped'
                                  ? 'جاري الشحن'
                                  : ord.status === 'delivered'
                                  ? 'تم التوصيل'
                                  : 'ملغي'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-stone-400" dir="ltr">
                              {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            productModalOpen ? (
              <div className="space-y-6">
                {/* Back button & Breadcrumb */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setProductModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="inline-flex items-center gap-2 text-stone-700 hover:text-amber-800 font-bold text-sm bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer w-fit"
                  >
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                    <span>العودة إلى قائمة المنتجات</span>
                  </button>
                  <span className="text-xs text-stone-400 font-medium">
                    لوحة التحكم / إدارة المنتجات / {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
                  <div className="pb-4 border-b border-stone-100">
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                      {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للمتجر'}
                    </h2>
                    <p className="text-stone-500 text-xs sm:text-sm mt-1">
                      قم بملء تفاصيل المنتج والأسعار والمخزون، ثم اضغط حفظ للتحديث المباشر.
                    </p>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        اسم المنتج بالعربي <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: دون الأبيض 6مل"
                        value={prodForm.nameAr}
                        onChange={(e) => setProdForm({ ...prodForm, nameAr: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        القسم / الفئة <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={prodForm.categoryId}
                        onChange={(e) => setProdForm({ ...prodForm, categoryId: Number(e.target.value) })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm outline-none font-medium focus:border-amber-600 focus:bg-white transition"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.nameAr}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          السعر الأساسي (ج.م) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={prodForm.price}
                          onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          السعر بعد الخصم (ج.م)
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0 إذا لا يوجد خصم"
                          value={prodForm.priceAfterDiscount}
                          onChange={(e) => setProdForm({ ...prodForm, priceAfterDiscount: Number(e.target.value) })}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          العدد بالمخزون <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="العدد المتوفر"
                          value={prodForm.stockQuantity}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            setProdForm({
                              ...prodForm,
                              stockQuantity: qty,
                              inStock: qty > 0
                            });
                          }}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-600 focus:bg-white transition font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        صورة المنتج (رفع مباشر عبر Cloudinary مع ضغط الحجم)
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl py-3 px-4 bg-stone-50 cursor-pointer transition ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadImageFile}
                              className="hidden"
                            />
                            {imageUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                <span className="text-xs font-bold text-stone-600">جاري الرفع والضغط على Cloudinary...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-bold text-stone-700">اختر صورة من جهازك (رفع وضغط فوري)</span>
                              </>
                            )}
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="أو ضع رابط الصورة مباشرة هنا"
                            value={prodForm.image}
                            onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-amber-600 font-mono"
                          />
                          {prodForm.image && (
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-stone-300 flex-shrink-0 bg-stone-100">
                              <Image
                                src={prodForm.image}
                                alt="معاينة"
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 block">
                          ⚡ يتم تقليل وضغط حجم الصورة تلقائياً وتحويلها لصيغ الويب الحديثة (WebP / AVIF) دون فقدان الجودة.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        وصف ومواصفات المنتج
                      </label>
                      <textarea
                        rows={3}
                        placeholder="وصف تفصيلي للمنتج ومواصفاته ومميزاته..."
                        value={prodForm.descriptionAr}
                        onChange={(e) => setProdForm({ ...prodForm, descriptionAr: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="prodInStock"
                        checked={prodForm.inStock}
                        onChange={(e) => setProdForm({ ...prodForm, inStock: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <label htmlFor="prodInStock" className="text-xs font-bold text-stone-700 cursor-pointer">
                        المنتج متوفر في المخزن حالياً
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-100">
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md transition text-sm cursor-pointer"
                      >
                        {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج للمتجر'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProductModalOpen(false);
                          setEditingProduct(null);
                        }}
                        className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-sm cursor-pointer transition"
                      >
                        إلغاء والعودة
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-stone-900 mb-1">إدارة المنتجات</h1>
                  <p className="text-stone-500 text-xs sm:text-sm">إضافة منتجات جديدة، تعديل الأسعار، وتغيير التوفر في المخزن</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[240px]">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الوصف..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm outline-none focus:border-amber-600"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600">الفئة:</span>
                  <select
                    value={selectedProductCategory}
                    onChange={(e) => setSelectedProductCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm outline-none font-medium text-stone-800"
                  >
                    <option value="all">جميع الفئات ({products.length})</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">الصورة</th>
                        <th className="py-3 px-4">اسم المنتج</th>
                        <th className="py-3 px-4">القسم</th>
                        <th className="py-3 px-4">السعر</th>
                        <th className="py-3 px-4">بعد الخصم</th>
                        <th className="py-3 px-4">الكمية</th>
                        <th className="py-3 px-4">حالة المخزن</th>
                        <th className="py-3 px-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {products
                        .filter(p => {
                          if (selectedProductCategory !== 'all' && p.categoryId !== selectedProductCategory) return false;
                          if (productSearch.trim()) {
                            const q = productSearch.toLowerCase().trim();
                            return p.nameAr?.toLowerCase().includes(q) || p.descriptionAr?.toLowerCase().includes(q);
                          }
                          return true;
                        })
                        .map(prod => {
                          const cat = categories.find(c => c.id === prod.categoryId);
                          return (
                            <tr key={prod.id} className="hover:bg-stone-50/80 transition">
                              <td className="py-2.5 px-4">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                                  <Image
                                    src={prod.images?.[0] || '/images/logo/don-logo-160.png'}
                                    alt={prod.nameAr}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-4 font-bold text-stone-900 max-w-xs">
                                <div>{prod.nameAr}</div>
                                <div className="text-[11px] text-stone-400 font-normal">#{prod.id}</div>
                              </td>
                              <td className="py-2.5 px-4 text-stone-600">
                                <span className="bg-stone-100 text-stone-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                  {cat?.nameAr || 'غير محدد'}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-bold text-stone-900">
                                {prod.price} ج.م
                              </td>
                              <td className="py-2.5 px-4 font-bold text-emerald-700">
                                {prod.priceAfterDiscount && prod.priceAfterDiscount > 0
                                  ? `${prod.priceAfterDiscount} ج.م`
                                  : '-'}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  (prod.stockQuantity ?? (prod.inStock ? 50 : 0)) > 5
                                    ? 'bg-stone-100 text-stone-800'
                                    : (prod.stockQuantity ?? (prod.inStock ? 50 : 0)) > 0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {prod.stockQuantity ?? (prod.inStock ? 50 : 0)} قطعة
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <button
                                  onClick={() => handleToggleStock(prod)}
                                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                                    prod.inStock
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                  }`}
                                  title="انقر لتغيير التوفر"
                                >
                                  <span className={`w-2 h-2 rounded-full ${prod.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                  <span>{prod.inStock ? 'متوفر' : 'غير متوفر'}</span>
                                </button>
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Link
                                    href={`/products/${prod.id}`}
                                    target="_blank"
                                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                                    title="معاينة في المتجر"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                                    title="تعديل المنتج"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                    title="حذف المنتج"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-stone-900 mb-1">إدارة الأقسام والتصنيفات</h1>
                  <p className="text-stone-500 text-xs sm:text-sm">إضافة أقسام جديدة وتعديل الأقسام المعروضة في المتجر</p>
                </div>
                <button
                  onClick={handleOpenAddCategory}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قسم جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] text-amber-700 font-bold block mb-1">
                            معرّف القسم #{cat.id}
                          </span>
                          <h3 className="text-lg font-bold text-stone-900">{cat.nameAr}</h3>
                          {cat.nameEn && <p className="text-xs text-stone-400">{cat.nameEn}</p>}
                        </div>
                        <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2.5 py-1 rounded-full">
                          {count} عطر
                        </span>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <Link
                          href={`/categories/${cat.id}`}
                          target="_blank"
                          className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                        >
                          <span>عرض في المتجر</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-lg"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-stone-900 mb-1">إدارة طلبات العملاء</h1>
                  <p className="text-stone-500 text-xs sm:text-sm">متابعة الطلبات، التواصل مع العملاء عبر واتساب، وتحديث حالة الشحن</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600">تصفية الحالة:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none font-medium text-stone-800 shadow-xs"
                  >
                    <option value="all">كل الحالات ({orders.length})</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="processing">جاري التجهيز</option>
                    <option value="shipped">جاري الشحن</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                {orders.length === 0 ? (
                  <div className="py-16 text-center text-stone-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">لا توجد طلبات مسجلة حتى الآن</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs sm:text-sm">
                      <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                        <tr>
                          <th className="py-3 px-4">رقم الطلب</th>
                          <th className="py-3 px-4">اسم العميل</th>
                          <th className="py-3 px-4">رقم الهاتف</th>
                          <th className="py-3 px-4">المحافظة</th>
                          <th className="py-3 px-4">الإجمالي</th>
                          <th className="py-3 px-4">طريقة الدفع</th>
                          <th className="py-3 px-4">الحالة</th>
                          <th className="py-3 px-4 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders
                          .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                          .map(ord => (
                            <tr key={ord.id} className="hover:bg-stone-50/80 transition">
                              <td className="py-3 px-4 font-black text-amber-800">
                                {ord.orderNumber}
                              </td>
                              <td className="py-3 px-4 font-bold text-stone-900">
                                {ord.customerName}
                              </td>
                              <td className="py-3 px-4 font-medium text-stone-700" dir="ltr">
                                {ord.phone}
                              </td>
                              <td className="py-3 px-4 text-stone-600">
                                {ord.governorateName}
                              </td>
                              <td className="py-3 px-4 font-black text-stone-900">
                                {ord.total} ج.م
                              </td>
                              <td className="py-3 px-4">
                                {ord.paymentMethod === 'vodafone_cash' ? (
                                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                                    فودافون كاش
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                    انستاباي
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  className={`text-xs font-bold rounded-lg px-2.5 py-1 outline-none border cursor-pointer ${
                                    ord.status === 'pending'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : ord.status === 'processing'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : ord.status === 'shipped'
                                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                                      : ord.status === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-red-50 text-red-800 border-red-300'
                                  }`}
                                >
                                  <option value="pending">قيد المراجعة</option>
                                  <option value="processing">جاري التجهيز</option>
                                  <option value="shipped">جاري الشحن</option>
                                  <option value="delivered">تم التوصيل</option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setSelectedOrderDetails(ord)}
                                    className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-bold text-xs flex items-center gap-1"
                                    title="عرض كامل التفاصيل"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>تفاصيل</span>
                                  </button>
                                  <a
                                    href={`https://wa.me/2${ord.phone.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${ord.customerName}، نتواصل معك بخصوص طلبك من عطور أحد (Ohod Perfumes) رقم ${ord.orderNumber}...`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                    title="مراسلة عبر واتساب"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteOrder(ord.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                    title="حذف الطلب"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SHIPPING & GOVERNORATES */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-stone-900 mb-1">أسعار الشحن والمحافظات</h1>
                <p className="text-stone-500 text-xs sm:text-sm">تعديل مصاريف الشحن والتوصيل لكل محافظة من محافظات مصر الـ 27</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {governorates.map(gov => (
                  <div key={gov.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{gov.nameAr}</h4>
                      <span className="text-xs text-stone-400">{gov.nameEn}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        defaultValue={gov.shippingFee}
                        onBlur={(e) => handleUpdateShippingFee(gov.id, Number(e.target.value))}
                        className="w-20 bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-sm text-center font-bold outline-none focus:border-amber-600"
                      />
                      <span className="text-xs text-stone-500 font-bold">ج.م</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl font-black text-stone-900 mb-1">إعدادات المتجر العامة</h1>
                <p className="text-stone-500 text-xs sm:text-sm">
                  التحكم في بيانات المتجر، بوابات الدفع (انستاباي وفودافون كاش)، وتخصيص الفوتر بالكامل
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. General & Contact */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
                  <h3 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    <span>بيانات المتجر الأساسية والتواصل</span>
                  </h3>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      اسم المتجر
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      شعار المتجر (الوصف المختصر)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeTagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeTagline: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                        رقم الهاتف للتواصل
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                        رقم الواتساب (لتلقي رسائل الطلبات)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-600 text-right"
                      />
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="pt-3 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs sm:text-sm font-bold text-stone-700">
                        نص الشريط الترويجي العلوي
                      </label>
                      <label className={`inline-flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition select-none ${
                        settingsForm.bannerEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-100 text-stone-600 border border-stone-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={settingsForm.bannerEnabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bannerEnabled: e.target.checked })}
                          className="w-4 h-4 rounded cursor-pointer accent-amber-600"
                        />
                        <span>{settingsForm.bannerEnabled ? 'الشريط مفعّل (ظاهر بالموقع)' : 'الشريط معطّل (مخفي)'}</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={!settingsForm.bannerEnabled}
                      value={settingsForm.bannerText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerText: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${
                        settingsForm.bannerEnabled
                          ? 'bg-stone-50 border-stone-300 focus:border-amber-600 text-stone-900'
                          : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      عند تحديد علامة الصح وحفظ الإعدادات، يظهر الشريط فوراً في أعلى كافة صفحات المتجر. وعند إزالة العلامة يختفي تماماً.
                    </span>
                  </div>

                  {/* Socials */}
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <h4 className="font-bold text-stone-800 text-sm">روابط وسائل التواصل الاجتماعي:</h4>
                    <div>
                      <input
                        type="text"
                        placeholder="رابط صفحة أو جروب فيسبوك"
                        value={settingsForm.facebookUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2 text-xs sm:text-sm outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="رابط حساب انستغرام"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2 text-xs sm:text-sm outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="رابط حساب تيك توك"
                        value={settingsForm.tiktokUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2 text-xs sm:text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. HERO BANNER SECTION (SLIDESHOW / VIDEO) */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100 flex-wrap sm:flex-nowrap">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                        <span>البانر الإعلاني الرئيسي (بين الهيدر والأقسام)</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        تحكم كامل في البانر الكبير الذي يظهر في أعلى الصفحة الرئيسية، مع خيار التبديل بين سلايد شو متحرك لـ 4 صور أو فيديو متكرر تلقائي.
                      </p>
                    </div>

                    {/* Enable / Disable toggle */}
                    <label className={`inline-flex items-center gap-2 cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition select-none flex-shrink-0 ${
                      settingsForm.heroBannerEnabled !== false
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-600 border border-stone-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={settingsForm.heroBannerEnabled !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroBannerEnabled: e.target.checked })}
                        className="w-4 h-4 rounded cursor-pointer accent-amber-600"
                      />
                      <span>{settingsForm.heroBannerEnabled !== false ? 'البانر مفعّل (ظاهر بالموقع)' : 'البانر معطّل (مخفي)'}</span>
                    </label>
                  </div>

                  {settingsForm.heroBannerEnabled !== false && (
                    <div className="space-y-6">
                      {/* Mode Choice (Slideshow vs Video) */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-2">
                          اختر طريقة العرض في البانر:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, heroBannerType: 'slideshow' })}
                            className={`p-4 rounded-2xl border-2 text-right transition cursor-pointer flex items-center gap-3.5 ${
                              (settingsForm.heroBannerType ?? 'slideshow') === 'slideshow'
                                ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                                : 'border-stone-200 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              (settingsForm.heroBannerType ?? 'slideshow') === 'slideshow' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-600'
                            }`}>
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-black text-sm block text-stone-900">سلايد شو صور (Slideshow)</span>
                              <span className="text-xs text-stone-500 block mt-0.5">انتقال تلقائي بين 4 صور مع دعم السحب بالموبايل</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, heroBannerType: 'video' })}
                            className={`p-4 rounded-2xl border-2 text-right transition cursor-pointer flex items-center gap-3.5 ${
                              settingsForm.heroBannerType === 'video'
                                ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                                : 'border-stone-200 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              settingsForm.heroBannerType === 'video' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-600'
                            }`}>
                              <Film className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-black text-sm block text-stone-900">فيديو ترويجي (Video)</span>
                              <span className="text-xs text-stone-500 block mt-0.5">تشغيل تلقائي مكرر دائم بدون توقف (Autoplay Loop)</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Case 1: Slideshow Configuration (up to 10 slides) */}
                      {(settingsForm.heroBannerType ?? 'slideshow') === 'slideshow' && (
                        <div className="space-y-4 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-stone-800">
                              شرائح السلايد شو (حتى 10 صور):
                            </span>
                            {(settingsForm.heroSlides?.length || 0) < 10 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const current = settingsForm.heroSlides || [];
                                  if (current.length < 10) {
                                    setSettingsForm({
                                      ...settingsForm,
                                      heroSlides: [
                                        ...current,
                                        { image: '', title: '', subtitle: '', link: '' }
                                      ]
                                    });
                                  }
                                }}
                                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer transition flex items-center gap-1"
                              >
                                <span>+ إضافة شريحة جديدة ({10 - (settingsForm.heroSlides?.length || 0)} متبقي)</span>
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            {(settingsForm.heroSlides || []).map((slide, sIdx) => (
                              <div key={sIdx} className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative">
                                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                                  <span className="font-black text-xs sm:text-sm text-stone-800">
                                    الشريحة رقم {sIdx + 1}
                                  </span>
                                  {(settingsForm.heroSlides?.length || 0) > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = (settingsForm.heroSlides || []).filter((_, i) => i !== sIdx);
                                        setSettingsForm({ ...settingsForm, heroSlides: updated });
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                                    >
                                      حذف الشريحة
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {/* Image preview & upload */}
                                  <div className="space-y-2">
                                    <label className="block text-xs font-bold text-stone-700">
                                      صورة الشريحة *
                                    </label>
                                    <div className="relative aspect-[16/9] bg-stone-200 rounded-xl overflow-hidden border border-stone-300">
                                      {slide.image ? (
                                        <img src={slide.image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                                          <ImageIcon className="w-6 h-6 mb-1" />
                                          <span>لا توجد صورة</span>
                                        </div>
                                      )}
                                    </div>
                                    <label className="w-full flex items-center justify-center gap-1.5 border border-amber-600/40 hover:border-amber-600 bg-white hover:bg-amber-50 rounded-xl py-2 px-3 text-xs font-bold text-amber-800 cursor-pointer transition shadow-2xs">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setHeroUploadingIndex(sIdx);
                                          const url = await uploadFileToCloudinary(file);
                                          setHeroUploadingIndex(null);
                                          if (url) {
                                            const updated = [...(settingsForm.heroSlides || [])];
                                            updated[sIdx] = { ...updated[sIdx], image: url };
                                            setSettingsForm({ ...settingsForm, heroSlides: updated });
                                          }
                                        }}
                                      />
                                      {heroUploadingIndex === sIdx ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                          <span>جاري الرفع لـ Cloudinary...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                                          <span>رفع صورة عبر Cloudinary</span>
                                        </>
                                      )}
                                    </label>
                                    <input
                                      type="text"
                                      dir="ltr"
                                      placeholder="أو رابط مباشر للصورة"
                                      value={slide.image}
                                      onChange={(e) => {
                                        const updated = [...(settingsForm.heroSlides || [])];
                                        updated[sIdx] = { ...updated[sIdx], image: e.target.value };
                                        setSettingsForm({ ...settingsForm, heroSlides: updated });
                                      }}
                                      className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs outline-none font-mono"
                                    />
                                  </div>

                                  {/* Title & subtitle & link */}
                                  <div className="sm:col-span-2 space-y-2.5">
                                    <div>
                                      <label className="block text-xs font-bold text-stone-700 mb-1">
                                        عنوان الشريحة (اختياري)
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="مثال: خصم 30٪ على العطور الفرنسية"
                                        value={slide.title || ''}
                                        onChange={(e) => {
                                          const updated = [...(settingsForm.heroSlides || [])];
                                          updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                                        }}
                                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-amber-600"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-bold text-stone-700 mb-1">
                                        وصف أو سطر فرعي (اختياري)
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="مثال: ثبات عالي يدوم طويلاً بأسعار منافسة"
                                        value={slide.subtitle || ''}
                                        onChange={(e) => {
                                          const updated = [...(settingsForm.heroSlides || [])];
                                          updated[sIdx] = { ...updated[sIdx], subtitle: e.target.value };
                                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                                        }}
                                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-amber-600"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-xs font-bold text-stone-700 mb-1">
                                        رابط التوجيه عند النقر على الصورة (اختياري)
                                      </label>
                                      <input
                                        type="text"
                                        dir="ltr"
                                        placeholder="مثال: /categories/7 أو رابط واتساب"
                                        value={slide.link || ''}
                                        onChange={(e) => {
                                          const updated = [...(settingsForm.heroSlides || [])];
                                          updated[sIdx] = { ...updated[sIdx], link: e.target.value };
                                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                                        }}
                                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none font-mono focus:border-amber-600"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case 2: Video Configuration */}
                      {settingsForm.heroBannerType === 'video' && (
                        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1">
                              رابط ملف الفيديو المباشر (MP4 / WebM / Cloudinary) *
                            </label>
                            <input
                              type="url"
                              dir="ltr"
                              placeholder="https://res.cloudinary.com/.../video.mp4"
                              value={settingsForm.heroVideoUrl || ''}
                              onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                              className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none font-mono focus:border-amber-600 text-left"
                            />
                            <span className="text-[11px] text-stone-500 mt-1 block">
                              * يُفضل رفع الفيديو إلى Cloudinary أو وضع رابط مباشر لملف فيديو (.mp4).
                            </span>
                          </div>

                          {/* Video upload button */}
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 border border-stone-300 hover:border-amber-600 bg-white hover:bg-stone-50 rounded-xl py-2 px-4 text-xs font-bold text-stone-800 cursor-pointer transition shadow-2xs">
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setHeroVideoUploading(true);
                                  const url = await uploadFileToCloudinary(file);
                                  setHeroVideoUploading(false);
                                  if (url) {
                                    setSettingsForm({ ...settingsForm, heroVideoUrl: url });
                                  }
                                }}
                              />
                              {heroVideoUploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                  <span>جاري رفع الفيديو...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-amber-600" />
                                  <span>رفع فيديو من الجهاز</span>
                                </>
                              )}
                            </label>
                          </div>

                          {/* Video preview */}
                          {settingsForm.heroVideoUrl && (
                            <div className="space-y-1.5 pt-2">
                              <span className="text-xs font-bold text-stone-700 block">معاينة مباشرة للفيديو:</span>
                              <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[300px] rounded-xl overflow-hidden bg-stone-900 border border-stone-300">
                                <video
                                  src={settingsForm.heroVideoUrl}
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  controls
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] sm:text-xs text-amber-900 leading-relaxed font-medium">
                            💡 الفيديو يعمل تلقائياً (Autoplay Loop) في الموبايل والكمبيوتر بالوضع الصامت (Muted) ليتوافق مع جميع الهواتف والمتصفحات، ويعيد تشغيل نفسه فور انتهائه بدون توقف.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Payment Gateways (InstaPay & Vodafone Cash) */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
                  <h3 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    <span>بوابات الدفع الإلكتروني (انستاباي وفودافون كاش)</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    هذه البيانات تظهر للعميل في صفحة الدفع (Checkout) مع زر نسخ مباشر لنسخ الرقم أو العنوان.
                  </p>

                  {/* InstaPay */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-600"></span>
                      <h4 className="font-bold text-sm text-stone-900">١. بوابة انستاباي (InstaPay)</h4>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        رقم الهاتف المسجل في انستاباي (InstaPay) للتحويل عليه
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        placeholder="010XXXXXXXX"
                        value={settingsForm.instapayAccount || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instapayAccount: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono outline-none focus:border-amber-600 text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        تعليمات التحويل للعميل عبر انستاباي
                      </label>
                      <textarea
                        rows={2}
                        value={settingsForm.instapayInstructions || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instapayInstructions: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2 text-xs outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  {/* Vodafone Cash */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-red-50/60 border border-red-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600"></span>
                      <h4 className="font-bold text-sm text-stone-900">٢. محفظة فودافون كاش (Vodafone Cash)</h4>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        رقم محفظة فودافون كاش لتحويل الأموال
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        placeholder="010XXXXXXXX"
                        value={settingsForm.vodafoneCashNumber || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, vodafoneCashNumber: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono outline-none focus:border-red-600 text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        تعليمات التحويل للعميل عبر فودافون كاش
                      </label>
                      <textarea
                        rows={2}
                        value={settingsForm.vodafoneCashInstructions || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, vodafoneCashInstructions: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2 text-xs outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Footer Customization */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
                  <h3 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <span>تخصيص الفوتر بالكامل (Footer Settings)</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    يمكنك تعديل نبذة المتجر، العنوان، وقائمة الضمانات المعروضة في الفوتر.
                  </p>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      نبذة عن المتجر في الفوتر (About Text)
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.footerAboutText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerAboutText: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      العنوان المعروض في الفوتر (Address)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.footerAddress || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerAddress: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      قائمة الضمانات والخدمات (اكتب كل ضمان في سطر منفصل)
                    </label>
                    <textarea
                      rows={4}
                      value={(settingsForm.footerGuarantees || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n');
                        setSettingsForm({ ...settingsForm, footerGuarantees: lines });
                      }}
                      placeholder="ضمان أصالة المنتجات ١٠٠٪&#10;توصيل سريع وآمن لجميع المحافظات&#10;دفع إلكتروني فوري وموثوق عبر انستاباي وفودافون كاش"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600"
                    />
                    <span className="text-[11px] text-stone-400 mt-0.5 block">
                      كل سطر سيظهر بجانبه علامة التوثيق الذهبية في الفوتر تلقائياً.
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-amber-600/30 text-base transition transform active:scale-98 cursor-pointer"
                >
                  حفظ جميع الإعدادات والتعديلات
                </button>
              </form>
            </div>
          )}

          {/* TAB: SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-stone-900 mb-1 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-amber-600" />
                  <span>تهيئة محركات البحث (SEO) والظهور في جوجل</span>
                </h1>
                <p className="text-stone-500 text-xs sm:text-sm">
                  التحكم الكامل في عنوان ووصف وكلمات المتجر المفتاحية ليظهر في نتائج بحث Google وبطاقات المشاركة في فيسبوك وواتساب.
                </p>
              </div>

              {/* Live Google Search Preview */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-black text-stone-700 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span>معاينة شكل موقعك على بحث جوجل (Google Snippet Preview):</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    مباشر في محرك البحث
                  </span>
                </div>
                <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 max-w-2xl font-sans" dir="rtl">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="font-semibold text-stone-800">{settingsForm.storeName || 'عطور أحد | Ohod Perfumes'}</span>
                    <span>•</span>
                    <span className="text-stone-400 font-mono text-[11px]" dir="ltr">
                      {settingsForm.canonicalUrl || 'https://ohod-perfumes.com'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-blue-700 hover:underline cursor-pointer leading-snug mb-1">
                    {settingsForm.siteTitle || 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                    {settingsForm.metaDescription || 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد...'}
                  </p>
                </div>
              </div>

              {/* Automatic Product SEO Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-500/20 flex items-start gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-black text-amber-900 block mb-1">
                    ✨ السيو التلقائي الذكي للمنتجات مفعل ويعمل آلياً!
                  </span>
                  <p className="text-stone-600 leading-relaxed">
                    أي عطر جديد تضيفه للمتجر، يقوم النظام آلياً بتوليد:
                    <strong className="text-stone-900"> عنوان السيو (Title)</strong> متضمناً اسم العطر وتصنيفه،
                    و<strong className="text-stone-900">الوصف (Meta Description)</strong>،
                    و<strong className="text-stone-900">رابط صورة العطر (OG Image)</strong>،
                    بالإضافة إلى كود <strong className="text-stone-900">Google Schema (Product Rich Snippet JSON-LD)</strong> مع السعر وحالة التوفر في المخزن ليظهر فوراً بشكل احترافي على جوجل، مع خريطة الموقع التلقائية (<code className="font-mono text-amber-800 bg-amber-100 px-1 rounded">/sitemap.xml</code>).
                  </p>
                </div>
              </div>

              {/* SEO Settings Form */}
              <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-black text-stone-900 pb-2 border-b border-stone-100">
                    البيانات العامة للظهور في محركات البحث
                  </h3>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      عنوان الموقع الرئيسي في جوجل (Meta Title) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                      placeholder="مثال: عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600"
                    />
                    <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                      <span>يُفضل أن يكون بين 50 إلى 65 حرفاً لأفضل نتيجة على جوجل.</span>
                      <span className="font-bold text-stone-600 font-mono">{(settingsForm.siteTitle || '').length} حرف</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      الوصف التعريفي للمتجر (Meta Description) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={settingsForm.metaDescription || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, metaDescription: e.target.value })}
                      placeholder="اكتب نبذة جذابة ومقنعة تظهر أسفل الرابط في جوجل لتحفيز العملاء على الضغط والدخول للمتجر..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600"
                    />
                    <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                      <span>يُفضل أن يكون بين 120 إلى 160 حرفاً.</span>
                      <span className="font-bold text-stone-600 font-mono">{(settingsForm.metaDescription || '').length} حرف</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                      الكلمات المفتاحية والبحثية (Meta Keywords) - افصل بينها بفاصلة (,)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.metaKeywords || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, metaKeywords: e.target.value })}
                      placeholder="عطور أحد, عطور فرنسية, عطور رجالي, دون الأبيض, دون البينك, زيوت عطرية أصلية, عطور مصر"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600"
                    />
                    <span className="text-[11px] text-stone-400 mt-0.5 block">
                      الكلمات والعبارات التي يبحث بها عملاؤك على جوجل للوصول إلى متجرك.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                        رابط الموقع الرسمي (Canonical URL)
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={settingsForm.canonicalUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, canonicalUrl: e.target.value })}
                        placeholder="https://ohod-perfumes.com"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 font-mono"
                      />
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        الرابط الأساسي لمنع تكرار المحتوى في جوجل
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                        صورة المشاركة على السوشيال ميديا (OG Image)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={settingsForm.ogImage || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ogImage: e.target.value })}
                        placeholder="/images/logo/don-logo-160.png"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 font-mono"
                      />
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        الصورة التي تظهر عند مشاركة رابط المتجر في فيسبوك وواتساب
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                        رمز التحقق من ملكية موقعك في Google Search Console
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={settingsForm.googleSiteVerification || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, googleSiteVerification: e.target.value })}
                        placeholder="مثال: google-site-verification=xxxx..."
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 font-mono"
                      />
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        كود التحقق الخاص بأدوات مشرفي المواقع من جوجل (اختياري)
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">
                        سماح محركات البحث بالأرشفة (Robots Indexing)
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-stone-50 border border-stone-300 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.robotsIndexing !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, robotsIndexing: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                            السماح لمحركات البحث (Google / Bing) بفهرسة المتجر
                          </span>
                          <span className="text-[11px] text-stone-500 block">
                            عند التعطيل سيتم منع عناكب البحث من أرشفة الموقع
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Direct Sitemap Links */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-600" />
                    <span className="text-stone-700 font-bold">ملفات خريطة الموقع والتعليمات البرمجية جاهزة تلقائياً:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      className="bg-white hover:bg-stone-100 text-amber-800 font-bold px-3 py-1.5 rounded-lg border border-stone-300 transition"
                    >
                      عرض sitemap.xml
                    </a>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      className="bg-white hover:bg-stone-100 text-stone-800 font-bold px-3 py-1.5 rounded-lg border border-stone-300 transition"
                    >
                      عرض robots.txt
                    </a>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-amber-600/30 text-base transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Globe className="w-5 h-5" />
                  <span>حفظ إعدادات السيو والظهور في جوجل</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: ADMINS MANAGEMENT */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-stone-900 mb-1">إدارة المشرفين والمسؤولين</h1>
                  <p className="text-stone-500 text-xs sm:text-sm">
                    إضافة مشرفين جدد، تغيير كلمات المرور، وإدارة صلاحيات الدخول للوحة التحكم بكلمات مرور مشفرة
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNewAdminForm({ username: '', name: '', password: '', permissions: ['orders'] });
                    setAdminModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إضافة مشرف جديد</span>
                </button>
              </div>

              {/* Admins Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <tr>
                        <th className="py-3.5 px-4">الاسم</th>
                        <th className="py-3.5 px-4">اسم المستخدم (Username)</th>
                        <th className="py-3.5 px-4">الصلاحية</th>
                        <th className="py-3.5 px-4">تاريخ الإضافة</th>
                        <th className="py-3.5 px-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {admins.map(adm => {
                        const isFullAccess = adm.role === 'all' || (Array.isArray(adm.permissions) && adm.permissions.length === ALL_ADMIN_PERMISSIONS.length);
                        const userPerms = Array.isArray(adm.permissions) && adm.permissions.length > 0
                          ? adm.permissions
                          : (adm.role === 'orders_only' ? (['orders'] as AdminTab[]) : ALL_ADMIN_PERMISSIONS);

                        return (
                          <tr key={adm.id} className="hover:bg-stone-50/80 transition">
                            <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                                {adm.name.charAt(0) || 'A'}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>{adm.name}</span>
                                {currentUser?.username === adm.username && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    حسابك الحالي
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-700" dir="ltr">
                              @{adm.username}
                            </td>
                            <td className="py-3.5 px-4">
                              {isFullAccess ? (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 shadow-xs">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>صلاحيات كاملة</span>
                                </span>
                              ) : (
                                <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                                  {userPerms.map((permId) => {
                                    const sec = SECTION_CONFIG.find(s => s.id === permId);
                                    return (
                                      <span
                                        key={permId}
                                        className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200"
                                      >
                                        <span>{sec?.label || permId}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-stone-500 text-xs">
                              {new Date(adm.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditPermissions(adm)}
                                  className="px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-lg border border-stone-200 transition flex items-center gap-1 cursor-pointer"
                                  title="تعديل صلاحيات المشرف"
                                >
                                  <Edit className="w-3.5 h-3.5 text-stone-500" />
                                  <span>تعديل الصلاحيات</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedAdminForPass(adm);
                                    setNewPasswordValue('');
                                    setChangePassModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                                  title="تغيير كلمة المرور"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                  <span>كلمة المرور</span>
                                </button>

                                {admins.length > 1 && (
                                  <button
                                    onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                                    title="حذف المشرف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT CATEGORY */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم القسم بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطور فرنسية"
                  value={catForm.nameAr}
                  onChange={(e) => setCatForm({ ...catForm, nameAr: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم القسم بالإنجليزي (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="French Perfumes"
                  value={catForm.nameEn}
                  onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition text-sm"
                >
                  حفظ القسم
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs text-amber-700 font-bold block">تفاصيل الطلب الكاملة</span>
                <h3 className="text-xl font-black text-stone-900">{selectedOrderDetails.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-stone-400 block">اسم العميل:</span>
                <span className="font-bold text-stone-900">{selectedOrderDetails.customerName}</span>
              </div>
              <div>
                <span className="text-stone-400 block">رقم الهاتف:</span>
                <span className="font-bold text-stone-900" dir="ltr">{selectedOrderDetails.phone}</span>
              </div>
              <div>
                <span className="text-stone-400 block">المحافظة:</span>
                <span className="font-bold text-stone-900">{selectedOrderDetails.governorateName}</span>
              </div>
              <div>
                <span className="text-stone-400 block">حالة الطلب:</span>
                <span className="font-bold text-amber-700">{selectedOrderDetails.status}</span>
              </div>
              <div>
                <span className="text-stone-400 block">طريقة الدفع:</span>
                <span className="font-bold text-stone-900">
                  {selectedOrderDetails.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' : '💳 انستاباي'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">المحول منه (المرسل):</span>
                <span className="font-bold text-amber-800 font-mono" dir="ltr">
                  {selectedOrderDetails.paymentSenderInfo || 'غير مسجل'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-stone-400 block">العنوان بالتفصيل:</span>
                <span className="font-medium text-stone-800">{selectedOrderDetails.address}</span>
              </div>
              {selectedOrderDetails.notes && (
                <div className="sm:col-span-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-xs mb-0.5">ملاحظات العميل:</span>
                  <span>{selectedOrderDetails.notes}</span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-3">العطور المطلوبة:</h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={it.image || '/images/logo/don-logo-160.png'}
                          alt={it.nameAr}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-stone-900">{it.nameAr}</h5>
                        <span className="text-xs text-stone-400">الكمية: {it.quantity} × {it.price} ج.م</span>
                      </div>
                    </div>
                    <span className="font-black text-xs sm:text-sm text-stone-900">
                      {it.price * it.quantity} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-sm font-bold">
              <span>المجموع النهائي (شامل الشحن):</span>
              <span className="text-xl font-black text-amber-800">{selectedOrderDetails.total} ج.م</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`https://wa.me/2${selectedOrderDetails.phone.replace(/^0/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${selectedOrderDetails.customerName}، نتواصل معك بخصوص طلبك من عطور أحد (Ohod Perfumes) رقم ${selectedOrderDetails.orderNumber}...`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مراسلة واتساب</span>
              </a>
              <a
                href={`tel:${selectedOrderDetails.phone}`}
                className="bg-stone-800 hover:bg-stone-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition"
              >
                <Phone className="w-4 h-4" />
                <span>اتصال هاتفي</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADMIN */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-600" />
                <span>إضافة مشرف جديد</span>
              </h3>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المشرف الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد مصطفى"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المستخدم للدخول (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="username (إنجليزي بدون مسافات)"
                  value={newAdminForm.username}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  كلمة المرور (Password) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="٤ خانات على الأقل (ستشفر فورياً)"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  🔒 كلمة المرور تشفر فورياً بأعلى معايير الأمان (PBKDF2 / SHA-512) ولا تظهر لأحد.
                </span>
              </div>

              {/* Sections / Permissions Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700">
                    الأقسام المسموح له برؤيتها والتحكم بها <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAdminForm({ ...newAdminForm, permissions: ALL_ADMIN_PERMISSIONS })}
                      className="text-[11px] text-amber-700 hover:underline font-bold cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={() => setNewAdminForm({ ...newAdminForm, permissions: ['orders'] })}
                      className="text-[11px] text-stone-500 hover:underline font-bold cursor-pointer"
                    >
                      الطلبات فقط
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border border-stone-200 rounded-2xl p-3 bg-stone-50/50 max-h-60 overflow-y-auto">
                  {SECTION_CONFIG.map((sec) => {
                    const isChecked = newAdminForm.permissions.includes(sec.id);
                    const IconComponent = sec.icon;
                    return (
                      <label
                        key={sec.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAdminForm({
                                ...newAdminForm,
                                permissions: [...newAdminForm.permissions, sec.id]
                              });
                            } else {
                              setNewAdminForm({
                                ...newAdminForm,
                                permissions: newAdminForm.permissions.filter(p => p !== sec.id)
                              });
                            }
                          }}
                          className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                        <div className="flex items-start gap-2.5 flex-1">
                          <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block leading-tight">
                              {sec.label}
                            </span>
                            <span className="text-[11px] text-stone-500 leading-tight">
                              {sec.desc}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[11px] text-stone-400 mt-1.5 block">
                  💡 سيظهر للمشرف فقط الأقسام المحددة بعلامة صح في القائمة الجانبية.
                </span>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition text-sm cursor-pointer"
                >
                  حفظ المشرف
                </button>
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ADMIN PERMISSIONS */}
      {editPermModalOpen && selectedAdminForPerm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>تعديل صلاحيات المشرف: {selectedAdminForPerm.name}</span>
              </h3>
              <button
                onClick={() => {
                  setEditPermModalOpen(false);
                  setSelectedAdminForPerm(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="space-y-4">
              <div>
                <span className="text-xs text-stone-500 block mb-1">اسم المستخدم:</span>
                <span className="font-mono text-sm font-bold text-stone-800 bg-stone-100 px-3 py-1.5 rounded-lg inline-block" dir="ltr">
                  @{selectedAdminForPerm.username}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700">
                    الأقسام المسموح له برؤيتها والتحكم بها <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPermissions(ALL_ADMIN_PERMISSIONS)}
                      className="text-[11px] text-amber-700 hover:underline font-bold cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={() => setEditingPermissions(['orders'])}
                      className="text-[11px] text-stone-500 hover:underline font-bold cursor-pointer"
                    >
                      الطلبات فقط
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border border-stone-200 rounded-2xl p-3 bg-stone-50/50 max-h-60 overflow-y-auto">
                  {SECTION_CONFIG.map((sec) => {
                    const isChecked = editingPermissions.includes(sec.id);
                    const IconComponent = sec.icon;
                    return (
                      <label
                        key={sec.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingPermissions([...editingPermissions, sec.id]);
                            } else {
                              setEditingPermissions(editingPermissions.filter(p => p !== sec.id));
                            }
                          }}
                          className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                        <div className="flex items-start gap-2.5 flex-1">
                          <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block leading-tight">
                              {sec.label}
                            </span>
                            <span className="text-[11px] text-stone-500 leading-tight">
                              {sec.desc}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition text-sm cursor-pointer"
                >
                  حفظ الصلاحيات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditPermModalOpen(false);
                    setSelectedAdminForPerm(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE ADMIN PASSWORD */}
      {changePassModalOpen && selectedAdminForPass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <span>تغيير كلمة المرور: {selectedAdminForPass.name}</span>
              </h3>
              <button
                onClick={() => {
                  setChangePassModalOpen(false);
                  setSelectedAdminForPass(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المستخدم:
                </label>
                <input
                  type="text"
                  disabled
                  value={'@' + selectedAdminForPass.username}
                  className="w-full bg-stone-100 border border-stone-200 text-stone-500 rounded-xl px-3.5 py-2 text-sm font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  كلمة المرور الجديدة <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md transition text-sm cursor-pointer"
                >
                  تحديث كلمة المرور
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangePassModalOpen(false);
                    setSelectedAdminForPass(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-sm cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Admin Toast */}
      {adminToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-bottom-5">
          {adminToast}
        </div>
      )}
    </div>
  );
}
