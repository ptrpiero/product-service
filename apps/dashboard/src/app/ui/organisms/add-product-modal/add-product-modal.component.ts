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
          <label class="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Name</label>
          <input
            formControlName="name"
            type="text"
            placeholder="Product name"
            class="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:bg-white focus:border-zinc-400 placeholder:text-zinc-400 transition-colors"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-[11px] text-red-400 mt-1">Name is required.</p>
          }
        </div>

        <div>
          <label class="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Token</label>
          <input
            formControlName="productToken"
            type="text"
            placeholder="Unique identifier"
            class="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:bg-white focus:border-zinc-400 placeholder:text-zinc-400 transition-colors"
          />
          @if (form.get('productToken')?.invalid && form.get('productToken')?.touched) {
            <p class="text-[11px] text-red-400 mt-1">Token is required.</p>
          }
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Price</label>
            <input
              formControlName="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              class="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:bg-white focus:border-zinc-400 placeholder:text-zinc-400 transition-colors"
            />
            @if (form.get('price')?.invalid && form.get('price')?.touched) {
              <p class="text-[11px] text-red-400 mt-1">Valid price required.</p>
            }
          </div>
          <div>
            <label class="block text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5">Stock</label>
            <input
              formControlName="stock"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:bg-white focus:border-zinc-400 placeholder:text-zinc-400 transition-colors"
            />
            @if (form.get('stock')?.invalid && form.get('stock')?.touched) {
              <p class="text-[11px] text-red-400 mt-1">Stock ≥ 0 required.</p>
            }
          </div>
        </div>

        <div class="flex justify-end gap-1.5 pt-4 border-t border-zinc-100">
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
