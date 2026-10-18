import { createContext } from 'react';
export interface RouteModalProviderState {
  handleSuccess: (path?: string) => void;
  requestClose: () => Promise<boolean>;
  registerCloseGuard: (guard: () => boolean | Promise<boolean>) => () => void;
  setCloseOnEscape: (value: boolean) => void;
  __internal: { closeOnEscape: boolean };
}
export const RouteModalProviderContext = createContext<RouteModalProviderState | null>(null);
