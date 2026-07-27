import {
  deriveOnboardingStatus,
  getPrimaryDog,
  getSelectedDog,
  useAuthSessionStore,
} from '@/stores/useAuthSessionStore';

import {
  makeDogRow,
  makeSession,
  makeUserRow,
} from '../../test/utils/builders';

describe('auth session store selectors', () => {
  beforeEach(() => {
    useAuthSessionStore.setState(useAuthSessionStore.getInitialState(), true);
  });

  it('derives onboarding status from dog ownership', () => {
    expect(deriveOnboardingStatus([])).toBe('required');
    expect(deriveOnboardingStatus([makeDogRow()])).toBe('complete');
  });

  it('selects the primary dog, then falls back to the first dog', () => {
    const secondaryDog = makeDogRow({
      id: 'dog-2',
      is_primary: false,
      name: 'Poppy',
    });
    const primaryDog = makeDogRow({
      id: 'dog-1',
      is_primary: true,
      name: 'Milo',
    });

    const fallbackDog = getPrimaryDog([
      makeDogRow({
        id: 'dog-3',
        is_primary: false,
      }),
    ]);

    expect(getPrimaryDog([secondaryDog, primaryDog])).toBe(primaryDog);
    expect(fallbackDog?.id).toBe('dog-3');
  });

  it('falls back to the primary dog when selected dog id is missing', () => {
    const primaryDog = makeDogRow({
      id: 'dog-1',
      is_primary: true,
    });
    const secondaryDog = makeDogRow({
      id: 'dog-2',
      is_primary: false,
    });

    expect(getSelectedDog([primaryDog, secondaryDog], 'dog-2')).toBe(
      secondaryDog,
    );
    expect(getSelectedDog([primaryDog, secondaryDog], 'missing')).toBe(
      primaryDog,
    );
  });

  it('sets signed-in snapshots with deterministic selected dog state', () => {
    const primaryDog = makeDogRow({
      id: 'dog-1',
      is_primary: true,
    });
    const secondaryDog = makeDogRow({
      id: 'dog-2',
      is_primary: false,
    });

    useAuthSessionStore.getState().setSignedIn({
      barklogUser: makeUserRow(),
      dogs: [secondaryDog, primaryDog],
      session: makeSession(),
    });

    expect(useAuthSessionStore.getState()).toMatchObject({
      authError: null,
      bootstrapStatus: 'ready',
      onboardingStatus: 'complete',
      selectedDogId: 'dog-1',
      sessionStatus: 'signed_in',
    });

    useAuthSessionStore.getState().setSelectedDogId('dog-2');
    useAuthSessionStore.getState().setSignedIn({
      barklogUser: makeUserRow(),
      dogs: [secondaryDog, primaryDog],
      session: makeSession(),
    });

    expect(useAuthSessionStore.getState().selectedDogId).toBe('dog-2');
  });

  it('updates dog ownership state after onboarding or add-dog flows', () => {
    const primaryDog = makeDogRow({
      id: 'dog-1',
      is_primary: true,
    });
    const newDog = makeDogRow({
      id: 'dog-2',
      is_primary: false,
      name: 'Poppy',
    });

    useAuthSessionStore.getState().setBootstrapping();

    expect(useAuthSessionStore.getState()).toMatchObject({
      authError: null,
      bootstrapStatus: 'loading',
    });

    useAuthSessionStore.getState().setBarklogUser(makeUserRow());
    useAuthSessionStore.getState().setDogs([primaryDog]);

    expect(useAuthSessionStore.getState()).toMatchObject({
      onboardingStatus: 'complete',
      selectedDogId: 'dog-1',
    });

    useAuthSessionStore.getState().addDog(newDog);

    expect(useAuthSessionStore.getState()).toMatchObject({
      dogs: [primaryDog, newDog],
      onboardingStatus: 'complete',
      selectedDogId: 'dog-2',
    });
  });

  it('clears session and dog ownership state on sign out', () => {
    useAuthSessionStore.getState().setSignedIn({
      barklogUser: makeUserRow(),
      dogs: [makeDogRow()],
      session: makeSession(),
    });

    useAuthSessionStore.getState().setSignedOut('Session expired');

    expect(useAuthSessionStore.getState()).toMatchObject({
      authError: 'Session expired',
      barklogUser: null,
      bootstrapStatus: 'ready',
      dogs: [],
      onboardingStatus: 'required',
      selectedDogId: null,
      session: null,
      sessionStatus: 'signed_out',
    });
  });
});
