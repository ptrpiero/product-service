import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ProductsService, Product, CreateProductDto } from '../../../core/services/products.service';
import { ProductTableComponent } from '../../organisms/product-table/product-table.component';
import { AddProductModalComponent } from '../../organisms/add-product-modal/add-product-modal.component';
import { PaginationComponent } from '../../molecules/pagination/pagination.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductTableComponent, AddProductModalComponent, PaginationComponent, ButtonComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Products</h2>
          <p class="text-sm text-gray-400 mt-0.5">{{ total() }} total items</p>
        </div>
        <app-button variant="primary" (click)="isModalOpen.set(true)">
          + Add Product
        </app-button>
      </div>

      @if (error()) {
        <div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span class="font-medium">API error:</span> {{ error() }}
        </div>
      }

      <app-product-table
        [products]="products()"
        [isLoading]="isLoading()"
        (deleteRequested)="onDelete($event)"
      />

      @if (totalPages() > 1) {
        <app-pagination
          [currentPage]="page()"
          [totalPages]="totalPages()"
          (pageChange)="page.set($event)"
        />
      }
    </div>

    <app-add-product-modal
      [isOpen]="isModalOpen()"
      (submitted)="onAdd($event)"
      (cancelled)="isModalOpen.set(false)"
    />
  `,
})
export class ProductsPageComponent {
  private service = inject(ProductsService);

  products = signal<Product[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  isLoading = signal(false);
  isModalOpen = signal(false);
  error = signal<string | null>(null);

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  constructor() {
    effect(() => {
      const p = this.page();
      const l = this.limit();
      untracked(() => this.fetchProducts(p, l));
    });
  }

  private fetchProducts(page: number, limit: number) {
    this.isLoading.set(true);
    this.error.set(null);
    this.service.list(page, limit).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.message ?? 'Unknown error');
        this.isLoading.set(false);
      },
    });
  }

  onDelete(id: number) {
    this.service.remove(id).subscribe(() => this.fetchProducts(this.page(), this.limit()));
  }

  onAdd(dto: CreateProductDto) {
    this.service.create(dto).subscribe(() => {
      this.isModalOpen.set(false);
      this.fetchProducts(this.page(), this.limit());
    });
  }
}
