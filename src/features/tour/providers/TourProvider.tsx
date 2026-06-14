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
  /** Estado persistido do tour. */
  state: TourState;
  /** Steps declarativos do tour base. */
  steps: readonly TourStep[];
  /** Step atual resolvido (ou `null`). */
  currentStep: TourStep | null;
  /** Progresso 0–100. */
  progress: number;
  /** Estado carregado do storage local. */
  isReady: boolean;
  /** Modal do tour aberto (efêmero, não persistido). */
  isActive: boolean;
  /** Convite aceito ("Começar"): inicia e abre o tour. */
  beginTour: () => void;
  /** Convite recusado ("Agora não"): marca como pulado, sem reabrir automaticamente. */
  skipInvite: () => void;
  /** Retomada: continua do step salvo. */
  continueTour: () => void;
  /** Reinicia do primeiro step e abre o tour. */
  restartTour: () => void;
  /** Abre pelo menu: continua se em andamento, senão reinicia. */
  openFromMenu: () => void;
  /** Avança um step (último → conclui). */
  next: () => void;
  /** Volta um step. */
  previous: () => void;
  /** Pula o tour durante a execução. */
  skip: () => void;
  /** Fecha o modal mantendo o progresso (toque no scrim). */
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
        // Mantém INITIAL_TOUR_STATE se a leitura falhar.
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
