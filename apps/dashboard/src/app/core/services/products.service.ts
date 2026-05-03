import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  productToken: string;
  name: string;
  price: number;
  stock: number;
}

export interface ProductsPage {
  data: Product[];
  total: number;
}

export interface CreateProductDto {
  name: string;
  productToken: string;
  price: number;
  stock: number;
}

export interface UpdateProductDto {
  name: string;
  price: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:3000/products';

  list(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Observable<ProductsPage> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortOrder) params = params.set('sortOrder', sortOrder);
    return this.http.get<ProductsPage>(this.base, { params });
  }

  create(dto: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.base, dto);
  }

  update(id: number, dto: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
