/**
 * QuickAction — quick action shown on the Home FAB.
 *
 * Pure TS: `icon` is an identifier/emoji and `route` is just a string, filled when navigation
 * exists (out of scope in this version). No UI imports.
 */
export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  route?: string;
  disabled?: boolean;
};
