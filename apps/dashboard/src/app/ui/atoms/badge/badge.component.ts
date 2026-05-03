import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="classes()">{{ value() }}</span>`,
})
export class BadgeComponent {
  value = input.required<number>();

  classes = computed(() => {
    const base =
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tabular-nums';
    const v = this.value();
    if (v === 0) return `${base} bg-red-100 text-red-700`;
    if (v <= 5) return `${base} bg-amber-100 text-amber-700`;
    return `${base} bg-emerald-100 text-emerald-700`;
  });
}
