// Shared list of lead "Search Groups" and their badge colors (ported from
// EzyLoanCrm so the admin Lead Management tab shows identical group labels).
// A lead can belong to multiple groups (Lead.groups is a string[]).

export const GROUPS = [
  '0. Not Interested',
  '1. Interested',
  '2. Hot Lead, Need Fallowup',
  '4. Doc Collected',
  '5. Disburshed',
  'Cold',
  'IMPORTANT',
  'Lost',
  'No Response',
  'Out Of Odisha',
] as const;

export type Group = (typeof GROUPS)[number];

// Tailwind classes for each group's colored badge.
export const GROUP_STYLES: Record<string, string> = {
  '0. Not Interested': 'bg-gray-800 text-white',
  '1. Interested': 'bg-green-100 text-green-700',
  '2. Hot Lead, Need Fallowup': 'bg-orange-100 text-orange-700',
  '4. Doc Collected': 'bg-blue-100 text-blue-700',
  '5. Disburshed': 'bg-emerald-100 text-emerald-700',
  'Cold': 'bg-sky-100 text-sky-700',
  'IMPORTANT': 'bg-red-100 text-red-700',
  'Lost': 'bg-rose-500 text-white',
  'No Response': 'bg-pink-100 text-pink-700',
  'Out Of Odisha': 'bg-purple-100 text-purple-700',
};

export function groupStyle(group: string): string {
  return GROUP_STYLES[group] || 'bg-gray-100 text-gray-600';
}
