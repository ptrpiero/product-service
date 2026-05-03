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
    <div class="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-x-auto">
      <table class="w-full min-w-[720px] text-sm">
        <thead>
          <tr class="border-b border-zinc-100">
            <th class="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-widest w-12">
              ID
            </th>
            <th
              class="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-widest cursor-pointer select-none group"
              (click)="onHeaderClick('name')"
            >
              <span class="flex items-center gap-1">
                Name
                <span class="text-[10px] transition-opacity" [class.opacity-100]="sortBy() === 'name'" [class.opacity-0]="sortBy() !== 'name'" [class.group-hover:opacity-40]="sortBy() !== 'name'">
                  {{ sortBy() === 'name' ? (sortOrder() === 'ASC' ? '↑' : '↓') : '↕' }}
                </span>
              </span>
            </th>
            <th
              class="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-widest cursor-pointer select-none group"
              (click)="onHeaderClick('productToken')"
            >
              <span class="flex items-center gap-1">
                Token
                <span class="text-[10px] transition-opacity" [class.opacity-100]="sortBy() === 'productToken'" [class.opacity-0]="sortBy() !== 'productToken'" [class.group-hover:opacity-40]="sortBy() !== 'productToken'">
                  {{ sortBy() === 'productToken' ? (sortOrder() === 'ASC' ? '↑' : '↓') : '↕' }}
                </span>
              </span>
            </th>
            <th class="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-widest w-28">
              Price
            </th>
            <th class="px-5 py-3 text-left text-[11px] font-medium text-zinc-400 uppercase tracking-widest w-20">
              Stock
            </th>
            <th class="px-5 py-3 w-24"></th>
          </tr>
        </thead>
        <tbody>
          @if (isLoading()) {
            <tr>
              <td colspan="6" class="px-5 py-16 text-center">
                <div class="flex justify-center">
                  <app-spinner />
                </div>
              </td>
            </tr>
          } @else if (products().length === 0) {
            <tr>
              <td colspan="6" class="px-5 py-16 text-center text-zinc-300 text-sm">
                No products found.
              </td>
            </tr>
          } @else {
            @for (product of products(); track product.id) {
              <tr class="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors duration-100 group/row">
                <td class="px-5 py-3.5 text-zinc-300 font-mono text-[11px]">{{ product.id }}</td>
                <td class="px-5 py-3.5 font-medium text-zinc-900 text-sm">{{ product.name }}</td>
                <td class="px-5 py-3.5 font-mono text-[11px] text-zinc-400">{{ product.productToken }}</td>
                <td class="px-5 py-3.5 text-zinc-600 text-sm tabular-nums">{{ product.price | currency }}</td>
                <td class="px-5 py-3.5"><app-badge [value]="product.stock" /></td>
                <td class="px-5 py-3.5">
                  <div class="flex justify-end gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <app-button variant="ghost" (click)="editRequested.emit(product)">
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </app-button>
                    <app-button variant="danger" (click)="deleteRequested.emit(product.id)">
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
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
