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
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-gray-900">{{ title() }}</h2>
            <button
              (click)="closed.emit()"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              type="button"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
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
