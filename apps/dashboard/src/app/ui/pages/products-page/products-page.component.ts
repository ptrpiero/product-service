import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  ProductsService,
  Product,
  CreateProductDto,
  UpdateProductDto,
} from '../../../core/services/products.service';
import { ProductTableComponent } from '../../organisms/product-table/product-table.component';
import { AddProductModalComponent } from '../../organisms/add-product-modal/add-product-modal.component';
import { EditProductModalComponent } from '../../organisms/edit-product-modal/edit-product-modal.component';
import { PaginationComponent } from '../../molecules/pagination/pagination.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    ProductTableComponent,
    AddProductModalComponent,
    EditProductModalComponent,
    PaginationComponent,
    ButtonComponent,
  ],
  template: `
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <h2 class="text-sm font-semibold text-zinc-900 mr-1">Products</h2>
        <span class="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full tabular-nums">{{ total() }}</span>

        <div class="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search name or token…"
            class="w-full px-3 py-1.5 pl-8 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:bg-white focus:border-zinc-400 placeholder:text-zinc-400 transition-colors"
            (input)="onSearchInput($any($event.target).value)"
          />
          <svg
            class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>

        <div class="ml-auto">
          <app-button variant="primary" (click)="isAddModalOpen.set(true)">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New product
          </app-button>
        </div>
      </div>

      @if (error()) {
        <div class="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600">
          <span class="font-semibold">Error</span><span class="text-red-400">·</span>{{ error() }}
        </div>
      }

      <app-product-table
        [products]="products()"
        [isLoading]="isLoading()"
        [sortBy]="sortBy()"
        [sortOrder]="sortOrder()"
        (deleteRequested)="onDelete($event)"
        (editRequested)="onEditOpen($event)"
        (sortChange)="onSortChange($event)"
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
      [isOpen]="isAddModalOpen()"
      (submitted)="onAdd($event)"
      (cancelled)="isAddModalOpen.set(false)"
    />

    <app-edit-product-modal
      [isOpen]="isEditModalOpen()"
      [product]="editingProduct()"
      (submitted)="onEditSubmit($event)"
      (cancelled)="closeEditModal()"
    />
  `,
})
export class ProductsPageComponent {
  private service = inject(ProductsService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  products = signal<Product[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  isLoading = signal(false);
  isAddModalOpen = signal(false);
  editingProduct = signal<Product | null>(null);
  search = signal('');
  sortBy = signal<string | null>(null);
  sortOrder = signal<'ASC' | 'DESC'>('ASC');
  error = signal<string | null>(null);

  isEditModalOpen = computed(() => this.editingProduct() !== null);
  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  constructor() {
    effect(() => {
      const p = this.page();
      const l = this.limit();
      const s = this.search();
      const sb = this.sortBy();
      const so = this.sortOrder();
      untracked(() => this.fetchProducts(p, l, s ?? undefined, sb ?? undefined, so));
    });

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search.set(value);
        this.page.set(1);
      });
  }

  onSearchInput(value: string) {
    if (value.length >= 3 || value.length === 0) {
      this.searchSubject.next(value);
    }
  }

  onSortChange(event: { col: string; order: 'ASC' | 'DESC' }) {
    this.sortBy.set(event.col);
    this.sortOrder.set(event.order);
    this.page.set(1);
  }

  onEditOpen(product: Product) {
    this.editingProduct.set(product);
  }

  closeEditModal() {
    this.editingProduct.set(null);
  }

  onEditSubmit(dto: UpdateProductDto) {
    const product = this.editingProduct();
    if (!product) return;
    this.service.update(product.id, dto).subscribe(() => {
      this.closeEditModal();
      this.fetchProducts(this.page(), this.limit(), this.search() || undefined, this.sortBy() ?? undefined, this.sortOrder());
    });
  }

  onDelete(id: number) {
    this.service.remove(id).subscribe(() =>
      this.fetchProducts(this.page(), this.limit(), this.search() || undefined, this.sortBy() ?? undefined, this.sortOrder()),
    );
  }

  onAdd(dto: CreateProductDto) {
    this.service.create(dto).subscribe(() => {
      this.isAddModalOpen.set(false);
      this.fetchProducts(this.page(), this.limit(), this.search() || undefined, this.sortBy() ?? undefined, this.sortOrder());
    });
  }

  private fetchProducts(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ) {
    this.isLoading.set(true);
    this.error.set(null);
    this.service.list(page, limit, search, sortBy, sortOrder).subscribe({
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
}
