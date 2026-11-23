export type StampVariant = 'outline' | 'filled' | 'dashed' | 'round' | 'muted';

export const STAMPS: Record<string, { label: string; variant: StampVariant }> = {
  built: { label: 'BUILT', variant: 'outline' },
  made: { label: 'MADE', variant: 'filled' },
  wrote: { label: 'WROTE', variant: 'round' },
  note: { label: 'NOTE', variant: 'outline' },
  now: { label: 'NOW', variant: 'dashed' },
  idea: { label: 'IDEA', variant: 'dashed' },
  'in-progress': { label: 'IN PROGRESS', variant: 'filled' },
  'in-use': { label: 'IN USE', variant: 'outline' },
  done: { label: 'DONE', variant: 'outline' },
  parked: { label: 'PARKED', variant: 'muted' },
  code: { label: 'CODE', variant: 'outline' },
  making: { label: 'MAKING', variant: 'outline' },
  archiving: { label: 'ARCHIVING', variant: 'outline' },
  writing: { label: 'WRITING', variant: 'outline' },
};

/** "in-progress" → "in progress" */
export const words = (s: string) => s.replace(/-/g, ' ');
