import { clsx, type ClassValue } from 'clsx';

// Small class-name joiner. EzyLone ships clsx (no tailwind-merge), which is all
// the admin Lead Management UI needs — it never relies on conflicting-class
// resolution, only conditional joining.
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
