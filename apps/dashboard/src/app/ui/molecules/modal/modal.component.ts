import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          class="absolute inset-0 bg-black/30 backdrop-blur-sm"
          (click)="closed.emit()"
        ></div>
        <div class="relative bg-white rounded-xl shadow-lg shadow-zinc-200/60 border border-zinc-100 w-full max-w-md mx-4 p-6 z-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-sm font-semibold text-zinc-900">{{ title() }}</h2>
            <button
              (click)="closed.emit()"
              class="text-zinc-300 hover:text-zinc-600 transition-colors p-1 rounded-md hover:bg-zinc-50"
              type="button"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  isOpen = input(false);
  title = input('');
  closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen()) this.closed.emit();
  }
}
