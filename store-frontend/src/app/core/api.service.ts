import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './config';
import { Lang } from './translations';
import { CartLine, Category, Customer, Item, LocalizedText, Order, OrderNote, OrderStatus, PaymentMethod, PaymentMethods, PaymentState, PlacedOrder } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  imageUrl(path: string): string {
    return path ? `${API_URL}/${path}` : '';
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/api/categories`);
  }

  getItems(categoryId?: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${API_URL}/api/items`, { params: this.categoryParams(categoryId) });
  }

  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${API_URL}/api/items/${id}`);
  }

  getItemsByIds(ids: string[]): Observable<Item[]> {
    return this.http.post<Item[]>(`${API_URL}/api/items/cart`, { ids });
  }

  createOrder(customer: Customer, items: CartLine[], lang: Lang, paymentMethod: PaymentMethod): Observable<PlacedOrder> {
    return this.http.post<PlacedOrder>(`${API_URL}/api/orders`, { customer, items, lang, paymentMethod });
  }

  getPaymentMethods(): Observable<PaymentMethods> {
    return this.http.get<PaymentMethods>(`${API_URL}/api/payment-methods`);
  }

  getPaymentStatus(orderId: string, token: string): Observable<PaymentState> {
    return this.http.get<PaymentState>(`${API_URL}/api/orders/${orderId}/status`, { params: { token } });
  }

  cancelPayment(orderId: string, token: string): Observable<PaymentState> {
    return this.http.post<PaymentState>(`${API_URL}/api/orders/${orderId}/cancel-payment`, { token });
  }

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API_URL}/api/admin/login`, { username, password });
  }

  createCategory(name: LocalizedText): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/api/admin/categories`, { name });
  }

  updateCategory(id: string, name: LocalizedText): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_URL}/api/admin/categories/${id}`, { name });
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/api/admin/categories/${id}`);
  }

  getAdminItems(categoryId?: string): Observable<Item[]> {
    return this.http.get<Item[]>(`${API_URL}/api/admin/items`, { params: this.categoryParams(categoryId) });
  }

  createItem(form: FormData): Observable<Item> {
    return this.http.post<Item>(`${API_URL}/api/admin/items`, form);
  }

  updateItem(id: string, form: FormData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_URL}/api/admin/items/${id}`, form);
  }

  deleteItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/api/admin/items/${id}`);
  }

  getOrders(status?: OrderStatus): Observable<Order[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Order[]>(`${API_URL}/api/admin/orders`, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_URL}/api/admin/orders/${id}`);
  }

  setOrderStatus(id: string, status: OrderStatus): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${API_URL}/api/admin/orders/${id}/status`, { status });
  }

  addOrderNote(id: string, text: string): Observable<OrderNote> {
    return this.http.post<OrderNote>(`${API_URL}/api/admin/orders/${id}/notes`, { text });
  }

  private categoryParams(categoryId?: string): HttpParams {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('category', categoryId);
    }
    return params;
  }
}
