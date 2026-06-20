import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { APP_SETTINGS_KEYS } from '@/constants/appSettingsKeys';
import type { AppSettingsRepository } from '@/domain/repositories/AppSettingsRepository';
import { INITIAL_TOUR_STATE, type TourState } from '@/domain/tour/TourState';
import {
  getTourProgress,
  goToNextStep,
  goToPreviousStep,
  restartTour as restartTourState,
  skipTour,
  startTour,
} from '@/domain/tour/tourStateMachine';
import { parseTourState, serializeTourState } from '@/domain/tour/tourStateSerialization';
import { BASE_TOUR_STEPS, findTourStepById, type TourStep } from '@/domain/tour/tourSteps';
import { getSQLiteAppSettingsRepository } from '@/infrastructure/database/sqlite/repositories';

type TourContextValue = {
  /** Persisted tour state. */
  state: TourState;
  /** Declarative base tour steps. */
  steps: readonly TourStep[];
  /** Resolved current step (or `null`). */
  currentStep: TourStep | null;
  /** Progress 0–100. */
  progress: number;
  /** Loaded from local storage. */
  isReady: boolean;
  /** Tour modal open (ephemeral, not persisted). */
  isActive: boolean;
  /** Invite accepted ("Start"): starts and opens the tour. */
  beginTour: () => void;
  /** Invite declined ("Not now"): marks as skipped, does not reopen automatically. */
  skipInvite: () => void;
  /** Resume: continues from the saved step. */
  continueTour: () => void;
  /** Restarts from the first step and opens the tour. */
  restartTour: () => void;
  /** Opens from menu: continues if in progress, otherwise restarts. */
  openFromMenu: () => void;
  /** Advances one step (last step → completes). */
  next: () => void;
  /** Goes back one step. */
  previous: () => void;
  /** Skips the tour while it is running. */
  skip: () => void;
  /** Closes the modal while keeping progress (scrim tap). */
  pause: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

type TourProviderProps = {
  children: ReactNode;
  repository?: AppSettingsRepository;
};

export function TourProvider({
  children,
  repository = getSQLiteAppSettingsRepository(),
}: TourProviderProps) {
  const [state, setState] = useState<TourState>(INITIAL_TOUR_STATE);
  const [isReady, setIsReady] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void repository
      .get(APP_SETTINGS_KEYS.TOUR_BASE_STATE)
      .then((raw) => {
        if (cancelled) {
          return;
        }

        setState(parseTourState(raw));
      })
      .catch(() => {
        // Keep INITIAL_TOUR_STATE if read fails.
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  const persist = useCallback(
    (next: TourState) => {
      setState(next);
      void repository.set(APP_SETTINGS_KEYS.TOUR_BASE_STATE, serializeTourState(next));
    },
    [repository],
  );

  const beginTour = useCallback(() => {
    persist(startTour());
    setIsActive(true);
  }, [persist]);

  const skipInvite = useCallback(() => {
    setIsActive(false);
    setState((current) => {
      const next = skipTour(current);
      void repository.set(APP_SETTINGS_KEYS.TOUR_BASE_STATE, serializeTourState(next));
      return next;
    });
  }, [repository]);

  const continueTour = useCallback(() => {
    setIsActive(true);
  }, []);

  const restartTour = useCallback(() => {
    persist(restartTourState());
    setIsActive(true);
  }, [persist]);

  const openFromMenu = useCallback(() => {
    setIsActive(true);
    setState((current) => {
      if (current.status === 'in_progress') {
        return current;
      }

      const next = restartTourState();
      void repository.set(APP_SETTINGS_KEYS.TOUR_BASE_STATE, serializeTourState(next));
      return next;
    });
  }, [repository]);

  const next = useCallback(() => {
    setState((current) => {
      const updated = goToNextStep(current);
      void repository.set(APP_SETTINGS_KEYS.TOUR_BASE_STATE, serializeTourState(updated));
      if (updated.status === 'completed') {
        setIsActive(false);
      }
      return updated;
    });
  }, [repository]);

  const previous = useCallback(() => {
    setState((current) => {
      const updated = goToPreviousStep(current);
      void repository.set(APP_SETTINGS_KEYS.TOUR_BASE_STATE, serializeTourState(updated));
      return updated;
    });
  }, [repository]);

  const skip = useCallback(() => {
    setIsActive(false);
    setState((current) => {
      const updated = skipTour(current);
      void repository.set(APP_SETTINGS_KEYS.TOUR_BASE_STATE, serializeTourState(updated));
      return updated;
    });
  }, [repository]);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({
      state,
      steps: BASE_TOUR_STEPS,
      currentStep: findTourStepById(state.currentStepId),
      progress: getTourProgress(state),
      isReady,
      isActive,
      beginTour,
      skipInvite,
      continueTour,
      restartTour,
      openFromMenu,
      next,
      previous,
      skip,
      pause,
    }),
    [
      state,
      isReady,
      isActive,
      beginTour,
      skipInvite,
      continueTour,
      restartTour,
      openFromMenu,
      next,
      previous,
      skip,
      pause,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const context = useContext(TourContext);

  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }

  return context;
}
