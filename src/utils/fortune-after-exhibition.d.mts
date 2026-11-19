export const EXHIBITION_START: string;
export const EXHIBITION_END: string;
export const CATEGORIES: string[];
export function todayInKorea(now?: Date): string;
export interface DailyFortune {
  date: string;
  sourceDate: string;
  starId: number;
  starName: string;
  policy: 'original' | 'frozen' | 'rotated';
  reused: boolean;
  categories: Record<string, { flow: string; brief: string; detail: string }>;
  compact: string;
  advice: string;
}
export function resolveDailyFortune(
  fortunes: object,
  starId: number,
  options?: { date?: string; mode?: 'freeze' | 'rotate' },
): DailyFortune | null;
