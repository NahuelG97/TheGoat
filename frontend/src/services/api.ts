import axios, { AxiosInstance } from 'axios';

const API_URL = 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Convert string numbers to actual numbers in responses
api.interceptors.response.use((response) => {
  const convertStringNumbers = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(convertStringNumbers);
    }
    if (obj !== null && typeof obj === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (
          (key === 'CostPerUnit' || key === 'Quantity' || key === 'totalCost' || key === 'ingredientCount' || key === 'TotalAmount' || key === 'TotalRevenue' || key === 'Subtotal' || key === 'UnitPrice' || key === 'CurrentStock' || key === 'MinimumStock' || key === 'Price') &&
          typeof value === 'string' &&
          !isNaN(Number(value))
        ) {
          converted[key] = parseFloat(value as string);
        } else if (
          (key === 'Id' || key === 'IngredientId' || key === 'ProductId' || key === 'id') &&
          typeof value === 'string' &&
          !isNaN(Number(value))
        ) {
          converted[key] = parseInt(value as string, 10);
        } else {
          converted[key] = typeof value === 'object' ? convertStringNumbers(value) : value;
        }
      }
      return converted;
    }
    return obj;
  };

  if (response.data) {
    response.data = convertStringNumbers(response.data);
  }
  return response;
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export interface Ingredient {
  Id: number;
  Name: string;
  Unit: string;
  CostPerUnit: number;
}

export interface Product {
  Id: number;
  Name: string;
  Price: number;
  ingredientCount?: number;
  ingredients?: ProductIngredient[];
}

export interface ProductIngredient {
  Id: number;
  IngredientId: number;
  Name: string;
  Unit: string;
  CostPerUnit: number;
  Quantity: number;
}

export interface ProductCost {
  id: number;
  name: string;
  totalCost: number;
  ingredientCount: number;
}

// Auth
export const login = (credentials: LoginRequest) =>
  api.post<LoginResponse>('/auth/login', credentials);

// Ingredients
export const getIngredients = () => api.get<Ingredient[]>('/ingredients');
export const createIngredient = (data: Omit<Ingredient, 'Id'>) =>
  api.post<Ingredient>('/ingredients', data);
export const updateIngredient = (id: number, data: Partial<Ingredient>) =>
  api.put<Ingredient>(`/ingredients/${id}`, data);

// Products
export const getProducts = () => api.get<Product[]>('/products');
export const createProduct = (data: { name: string; price?: number }) =>
  api.post<Product>('/products', data);
export const getProduct = (id: number) =>
  api.get<Product>(`/products/${id}`);
export const updateProductPrice = (id: number, price: number) =>
  api.put<Product>(`/products/${id}/price`, { price });
export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`);

// Recipes
export const addIngredientToRecipe = (
  productId: number,
  ingredientId: number,
  quantity: number
) =>
  api.post(`/recipes/${productId}/ingredients`, {
    ingredientId,
    quantity,
  });

export const removeIngredientFromRecipe = (productId: number, ingredientId: number) =>
  api.delete(`/recipes/${productId}/ingredients/${ingredientId}`);

export const getProductCost = (productId: number) =>
  api.get<ProductCost>(`/recipes/${productId}/cost`);

// Sales
export interface SaleItem {
  productId: number;
  quantity: number;
}

export interface SaleRequest {
  items: SaleItem[];
  notes?: string;
}

export interface Sale {
  Id: number;
  SaleNumber: string;
  TotalAmount: number;
  Status: string;
  CreatedAt: string;
}

export const getSales = () => api.get<Sale[]>('/sales');
export const getSaleDetails = (saleId: number) =>
  api.get<any>(`/sales/${saleId}`);
export const createSale = (data: SaleRequest) =>
  api.post<any>('/sales', data);
export const getSalesSummary = (startDate?: string, endDate?: string) =>
  api.get('/sales/summary/range', { params: { startDate, endDate } });

export default api;
