import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../molecules/modal/modal.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CreateProductDto } from '../../../core/services/products.service';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ReactiveFormsModule],
  template: `
    <app-modal [isOpen]="isOpen()" title="Add Product" (closed)="cancelled.emit()">
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Name</label>
          <input
            formControlName="name"
            type="text"
            placeholder="Product name"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-xs text-red-500 mt-1">Name is required.</p>
          }
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Token</label>
          <input
            formControlName="productToken"
            type="text"
            placeholder="Unique identifier"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
          />
          @if (form.get('productToken')?.invalid && form.get('productToken')?.touched) {
            <p class="text-xs text-red-500 mt-1">Token is required.</p>
          }
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Price</label>
            <input
              formControlName="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
            />
            @if (form.get('price')?.invalid && form.get('price')?.touched) {
              <p class="text-xs text-red-500 mt-1">Valid price required.</p>
            }
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Stock</label>
            <input
              formControlName="stock"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
            />
            @if (form.get('stock')?.invalid && form.get('stock')?.touched) {
              <p class="text-xs text-red-500 mt-1">Stock ≥ 0 required.</p>
            }
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <app-button variant="ghost" type="button" (click)="cancelled.emit()">
            Cancel
          </app-button>
          <app-button variant="primary" type="submit" [disabled]="form.invalid">
            Add Product
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AddProductModalComponent {
  isOpen = input(false);
  submitted = output<CreateProductDto>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    productToken: ['', [Validators.required, Validators.minLength(1)]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) this.form.reset({ stock: 0 });
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.submitted.emit(this.form.value as CreateProductDto);
  }
}
