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
          (key === 'CostPerUnit' || key === 'Quantity' || key === 'totalCost' || key === 'ingredientCount' || key === 'TotalAmount' || key === 'TotalRevenue' || key === 'Subtotal' || key === 'UnitPrice' || key === 'CurrentStock' || key === 'MinimumStock' || key === 'Price' || key === 'OpeningAmount' || key === 'ClosingAmount' || key === 'ExpectedAmount' || key === 'Difference' || key === 'totalSales' || key === 'Amount' || key === 'CashAmount' || key === 'TransferAmount' || key === 'CardAmount') &&
          typeof value === 'string' &&
          !isNaN(Number(value))
        ) {
          converted[key] = parseFloat(value as string);
        } else if (
          (key === 'Id' || key === 'IngredientId' || key === 'ProductId' || key === 'id' || key === 'UserId' || key === 'CashSessionId' || key === 'PaymentMethodId' || key === 'SaleId') &&
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
  notes?: string;
}

export interface SaleRequest {
  items: SaleItem[];
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

// Cash Sessions
export interface CashSession {
  Id: number;
  UserId: number;
  Status: string;
  OpeningAmount: number;
  ClosingAmount?: number;
  ExpectedAmount?: number;
  Difference?: number;
  CashAmount?: number;
  TransferAmount?: number;
  CardAmount?: number;
  OpenedAt: string;
  ClosedAt?: string;
  Notes?: string;
}

export interface PaymentMethod {
  Id: number;
  Code: string;
  Name: string;
  Description?: string;
}

export interface SalePayment {
  Id: number;
  Amount: number;
  PaymentMethodId: number;
  Code: string;
  Name: string;
}

export interface SaleAudit {
  Id: number;
  Action: string;
  Reason?: string;
  ChangedAt: string;
  ChangedByUser?: string;
  OldValues?: string;
  NewValues?: string;
}

export const getCurrentCashSession = () =>
  api.get<CashSession | null>('/cash/current');

export const openCashSession = (openingAmount: number) =>
  api.post<CashSession>('/cash/open', { openingAmount });

export const closeCashSession = (cashSessionId: number, closingAmount: number, notes?: string) =>
  api.post<any>('/cash/close', { cashSessionId, closingAmount, notes });

export const getCashSessionHistory = (userId: number) =>
  api.get<CashSession[]>(`/cash/history/${userId}`);

export const getCashSessionDetails = (sessionId: number) =>
  api.get<any>(`/cash/${sessionId}`);

// Payment methods
export const getPaymentMethods = () =>
  api.get<PaymentMethod[]>('/payments/methods');

export const getSalePayments = (saleId: number) =>
  api.get<SalePayment[]>(`/payments/sale/${saleId}`);

export const addSalePayment = (saleId: number, paymentMethodId: number, amount: number) =>
  api.post<SalePayment>('/payments/add', { saleId, paymentMethodId, amount });

export const deletePayment = (paymentId: number) =>
  api.delete(`/payments/${paymentId}`);

// Sales management
export const editSale = (saleId: number, items: any[], payments: any[], reason: string) =>
  api.put<any>(`/audit/${saleId}`, { items, payments, reason });

export const cancelSale = (saleId: number, reason: string) =>
  api.post<any>(`/audit/${saleId}/cancel`, { reason });

export const getSaleAudit = (saleId: number) =>
  api.get<SaleAudit[]>(`/audit/sale/${saleId}`);

export default api;
