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

// Arqueos (Cash Reconciliation Reports)
export interface ArqueoSession {
  id: number;
  username: string;
  status: string;
  openingAmount: number;
  closingAmount: number;
  expectedAmount: number;
  difference: number;
  openedAt: string;
  closedAt: string;
  notes: string;
  completedSalesCount: number;
  cancelledSalesCount: number;
  completedSalesTotal: number;
  cancelledSalesTotal: number;
}

export interface ArqueoDetail {
  session: ArqueoSession;
  sales: {
    completed: any[];
    cancelled: any[];
    completedCount: number;
    cancelledCount: number;
    completedTotal: number;
    cancelledTotal: number;
  };
  profitability: {
    totalSales: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: string | number;
  };
  paymentSummary: Array<{
    id: number;
    paymentMethod: string;
    transactionCount: number;
    total: number;
  }>;
  totalPaymentAmount: number;
  difference: number;
}

export const getArqueosList = async (date?: string) => {
  const response = await api.get<any[]>(`/arqueos/list${date ? `?date=${date}` : ''}`);
  
  // Transform data from backend PascalCase to frontend camelCase
  const transformed = response.data.map((item: any) => ({
    id: item.Id,
    username: item.Username,
    status: item.Status,
    openingAmount: parseFloat(item.OpeningAmount),
    closingAmount: parseFloat(item.ClosingAmount),
    expectedAmount: parseFloat(item.ExpectedAmount),
    difference: parseFloat(item.Difference),
    openedAt: item.OpenedAt,
    closedAt: item.ClosedAt,
    notes: item.Notes,
    completedSalesCount: parseInt(item.CompletedSalesCount),
    cancelledSalesCount: parseInt(item.CancelledSalesCount),
    completedSalesTotal: parseFloat(item.CompletedSalesTotal),
    cancelledSalesTotal: parseFloat(item.CancelledSalesTotal),
  }));
  
  return { data: transformed };
};

export const getArqueoDetail = async (cashSessionId: number) => {
  const response = await api.get<any>(`/arqueos/detail/${cashSessionId}`);
  const data = response.data;
  
  // Transform session data
  const session = {
    id: parseInt(data.session.id),
    username: data.session.username,
    userId: parseInt(data.session.userId),
    status: data.session.status,
    openingAmount: parseFloat(data.session.openingAmount),
    closingAmount: parseFloat(data.session.closingAmount),
    expectedAmount: parseFloat(data.session.expectedAmount),
    difference: parseFloat(data.session.difference) || 0,
    openedAt: data.session.openedAt,
    closedAt: data.session.closedAt,
    notes: data.session.notes
  };
  
  // Transform sales completed
  const completedSales = (data.sales.completed || []).map((item: any) => ({
    id: parseInt(item.Id),
    saleNumber: item.SaleNumber,
    totalAmount: parseFloat(item.TotalAmount || 0),
    status: item.Status,
    createdAt: item.CreatedAt,
    paymentMethods: item.PaymentMethods,
    totalCost: parseFloat(item.TotalCost || 0)
  }));
  
  // Transform sales cancelled
  const cancelledSales = (data.sales.cancelled || []).map((item: any) => ({
    id: parseInt(item.Id),
    saleNumber: item.SaleNumber,
    totalAmount: parseFloat(item.TotalAmount || 0),
    status: item.Status,
    createdAt: item.CreatedAt,
    paymentMethods: item.PaymentMethods,
    totalCost: parseFloat(item.TotalCost || 0)
  }));
  
  // Transform profitability
  const profitability = {
    totalSales: parseFloat(data.profitability.totalSales || 0),
    totalCosts: parseFloat(data.profitability.totalCosts || 0),
    netProfit: parseFloat(data.profitability.netProfit || 0),
    profitMargin: parseFloat(data.profitability.profitMargin || 0)
  };
  
  // Transform payment summary
  const paymentSummary = (data.paymentSummary || []).map((item: any) => ({
    id: parseInt(item.Id),
    paymentMethod: item.PaymentMethod,
    transactionCount: parseInt(item.TransactionCount),
    total: parseFloat(item.Total || 0)
  }));
  
  const transformed = {
    session,
    sales: {
      completed: completedSales,
      cancelled: cancelledSales,
      completedCount: data.sales.completedCount,
      cancelledCount: data.sales.cancelledCount,
      completedTotal: parseFloat(data.sales.completedTotal || 0),
      cancelledTotal: parseFloat(data.sales.cancelledTotal || 0)
    },
    profitability,
    paymentSummary,
    totalPaymentAmount: parseFloat(data.totalPaymentAmount || 0),
    difference: parseFloat(data.difference || 0)
  };
  
  return { data: transformed };
};

export const getArqueoSaleDetail = async (saleId: number) => {
  const response = await api.get<any>(`/arqueos/sale-detail/${saleId}`);
  const data = response.data;
  
  // Transform sale data
  const transformed = {
    id: parseInt(data.id),
    saleNumber: data.saleNumber,
    totalAmount: parseFloat(data.totalAmount || 0),
    status: data.status,
    createdAt: data.createdAt,
    cashSessionStatus: data.cashSessionStatus,
    isClosed: data.isClosed,
    items: (data.items || []).map((item: any) => ({
      id: parseInt(item.Id),
      productId: parseInt(item.ProductId),
      productName: item.ProductName,
      quantity: parseInt(item.Quantity),
      unitPrice: parseFloat(item.UnitPrice || 0),
      subtotal: parseFloat(item.Subtotal || 0),
      notes: item.Notes
    })),
    payments: (data.payments || []).map((payment: any) => ({
      id: parseInt(payment.Id),
      paymentMethodId: parseInt(payment.PaymentMethodId),
      paymentMethodName: payment.PaymentMethodName,
      amount: parseFloat(payment.Amount || 0)
    }))
  };
  
  return { data: transformed };
};

export default api;
