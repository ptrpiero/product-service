import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="classes()">{{ value() }}</span>`,
})
export class BadgeComponent {
  value = input.required<number>();

  classes = computed(() => {
    const base = 'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium tabular-nums';
    const v = this.value();
    if (v === 0) return `${base} bg-red-50 text-red-500`;
    if (v <= 5) return `${base} bg-amber-50 text-amber-600`;
    return `${base} bg-emerald-50 text-emerald-600`;
  });
}
