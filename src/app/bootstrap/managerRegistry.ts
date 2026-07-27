import { APP_MANAGERS } from '../../../app.managers';

export interface Manager {
  init(): Promise<void>;
  teardown?(): Promise<void>;
  isEnabled(): boolean;
  getStatus():
    | 'uninitialized'
    | 'initializing'
    | 'active'
    | 'failed'
    | 'disabled';
}

export const getActiveManagers = () => {
  return APP_MANAGERS.filter((m) => m.enabled).sort(
    (a, b) => a.priority - b.priority,
  );
};
