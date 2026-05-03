import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { Product } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, SpinnerComponent, CurrencyPipe],
  template: `
    <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table class="w-full min-w-[720px] text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
            >
              ID
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none group"
              (click)="onHeaderClick('name')"
            >
              <span class="flex items-center gap-1">
                Name
                <span class="text-gray-400 text-xs">
                  @if (sortBy() === 'name') {
                    {{ sortOrder() === 'ASC' ? '↑' : '↓' }}
                  } @else {
                    <span class="opacity-0 group-hover:opacity-60">↕</span>
                  }
                </span>
              </span>
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none group"
              (click)="onHeaderClick('productToken')"
            >
              <span class="flex items-center gap-1">
                Token
                <span class="text-gray-400 text-xs">
                  @if (sortBy() === 'productToken') {
                    {{ sortOrder() === 'ASC' ? '↑' : '↓' }}
                  } @else {
                    <span class="opacity-0 group-hover:opacity-60">↕</span>
                  }
                </span>
              </span>
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
            >
              Price
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
            >
              Stock
            </th>
            <th class="px-4 py-3 w-32"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          @if (isLoading()) {
            <tr>
              <td colspan="6" class="px-4 py-14 text-center">
                <div class="flex justify-center">
                  <app-spinner />
                </div>
              </td>
            </tr>
          } @else if (products().length === 0) {
            <tr>
              <td colspan="6" class="px-4 py-14 text-center text-gray-400 text-sm">
                No products found.
              </td>
            </tr>
          } @else {
            @for (product of products(); track product.id) {
              <tr class="hover:bg-gray-50/60 transition-colors">
                <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ product.id }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ product.name }}</td>
                <td class="px-4 py-3 font-mono text-xs text-gray-500">
                  {{ product.productToken }}
                </td>
                <td class="px-4 py-3 text-gray-700 tabular-nums">
                  {{ product.price | currency }}
                </td>
                <td class="px-4 py-3">
                  <app-badge [value]="product.stock" />
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <app-button variant="ghost" (click)="editRequested.emit(product)">
                      Edit
                    </app-button>
                    <app-button variant="danger" (click)="deleteRequested.emit(product.id)">
                      Delete
                    </app-button>
                  </div>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ProductTableComponent {
  products = input.required<Product[]>();
  isLoading = input(false);
  sortBy = input<string | null>(null);
  sortOrder = input<'ASC' | 'DESC'>('ASC');

  deleteRequested = output<number>();
  editRequested = output<Product>();
  sortChange = output<{ col: string; order: 'ASC' | 'DESC' }>();

  onHeaderClick(col: string) {
    const nextOrder =
      this.sortBy() === col && this.sortOrder() === 'ASC' ? 'DESC' : 'ASC';
    this.sortChange.emit({ col, order: nextOrder });
  }
}
