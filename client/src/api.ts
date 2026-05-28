const BASE = 'http://192.168.1.178';

export const API = BASE;

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  sizes: string[];
  stock: number;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  name: string;
  image_url: string;
  quantity: number;
  price: number;
  size: string;
}