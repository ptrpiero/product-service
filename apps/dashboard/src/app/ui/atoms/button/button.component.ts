import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [class]="classes()" [disabled]="disabled() || loading()" [type]="type()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<'primary' | 'danger' | 'ghost'>('primary');
  loading = input(false);
  disabled = input(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  classes = computed(() => {
    const base =
      'inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';
    const variants: Record<string, string> = {
      primary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500',
      danger:
        'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-400 border border-red-200',
      ghost:
        'bg-white text-gray-600 hover:bg-gray-100 focus:ring-gray-300 border border-gray-200',
    };
    return `${base} ${variants[this.variant()]}`;
  });
}
