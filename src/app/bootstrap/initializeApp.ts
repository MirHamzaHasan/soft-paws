import { getActiveManagers } from './managerRegistry';
import { registerManagers } from './registerManagers';

export const initializeApp = async () => {
  console.log('[Bootstrap] Starting App Initialization...');

  const activeConfigs = getActiveManagers();
  const managers = await registerManagers(activeConfigs);

  const initPromises = managers.map(async (manager) => {
    try {
      if (typeof manager.init === 'function') {
        await manager.init();
      } else if (typeof (manager as any).initialize === 'function') {
        // Fallback for existing initialize calls
        await (manager as any).initialize();
      }
      console.log(
        `[Bootstrap] Manager initialized: ${manager.constructor.name}`,
      );
    } catch (error) {
      console.error(
        `[Bootstrap] Failed to initialize manager: ${manager.constructor.name}`,
        error,
      );
    }
  });

  await Promise.all(initPromises);

  console.log('[Bootstrap] App Initialization Complete.');
};
