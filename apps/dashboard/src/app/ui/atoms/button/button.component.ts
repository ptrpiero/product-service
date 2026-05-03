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
      'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer';
    const variants: Record<string, string> = {
      primary: 'bg-zinc-900 text-white hover:bg-zinc-700 focus:ring-zinc-900',
      danger: 'text-red-500 hover:text-red-700 hover:bg-red-50 focus:ring-red-300',
      ghost: 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-300',
    };
    return `${base} ${variants[this.variant()]}`;
  });
}
