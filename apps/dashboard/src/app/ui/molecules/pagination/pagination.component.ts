import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center justify-between px-1">
      <p class="text-xs text-zinc-400 tabular-nums">
        Page <span class="font-medium text-zinc-600">{{ currentPage() }}</span> of
        <span class="font-medium text-zinc-600">{{ totalPages() }}</span>
      </p>
      <div class="flex gap-2">
        <app-button
          variant="ghost"
          [disabled]="currentPage() <= 1"
          (click)="onPrev()"
        >
          ← Previous
        </app-button>
        <app-button
          variant="ghost"
          [disabled]="currentPage() >= totalPages()"
          (click)="onNext()"
        >
          Next →
        </app-button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  onPrev() {
    if (this.currentPage() > 1) this.pageChange.emit(this.currentPage() - 1);
  }

  onNext() {
    if (this.currentPage() < this.totalPages()) this.pageChange.emit(this.currentPage() + 1);
  }
}
