export interface Wilaya {
  code: number;
  name_ar: string;
  home_price: number;
  desk_price: number;
  is_active: boolean;
}

export interface Commune {
  id: number;
  wilaya_code: number;
  name_ar: string;
}

export type ImageLayout = 'gallery' | 'stacked' | 'grid';

export type ProductCategory = 'fashion' | 'accessories' | 'home' | 'general';

export interface ProductColors {
  primary: string;
  secondary: string;
  accent: string;
  layout?: ImageLayout;
  category?: ProductCategory;
}

export interface Feature {
  title: string;
  desc: string;
}

export interface Testimonial {
  name: string;
  wilaya: string;
  rating: number;
  text: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface ColorMeta {
  value: string;
  code: string;
  image?: string;
}

export interface VariantOption {
  name: string;
  values: string[];
  colors?: ColorMeta[];
}

export interface VariantItem {
  label: string;
  options: Record<string, string>;
  price: number | null;
  stock: number;
  color_code?: string;
  image_url?: string;
}

export type LandingType = 'ai_generated' | 'manual_image' | 'manual_pdf';

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  description: string | null;
  subtitle: string | null;
  landing_type: LandingType;
  manual_media_url: string | null;
  ai_generated: boolean;
  generated_colors: ProductColors | null;
  features: Feature[];
  testimonials: Testimonial[];
  faqs: Faq[];
  has_variants: boolean;
  variant_options: VariantOption[];
  variants_data: VariantItem[];
  images: string[];
  image_layout?: ImageLayout;
  category?: ProductCategory;
  countdown_end: string | null;
  countdown_message: string | null;
  countdown_active: boolean;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface Order {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  wilaya_code: number;
  commune_name: string;
  address: string | null;
  shipping_type: 'home' | 'desk';
  selected_variant: Record<string, string> | null;
  quantity: number;
  product_price: number;
  shipping_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  products?: { title: string; slug?: string };
}

export interface Staff {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  avatar_url?: string | null;
}

export interface DeliveryCompany {
  id: number;
  company_name: string;
  api_url: string | null;
  api_key: string | null;
  api_token: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: unknown;
}
