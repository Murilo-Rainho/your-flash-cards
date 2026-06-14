import { type Href, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';

import { useTour } from '@/features/tour/providers/TourProvider';
import { TourActions } from '@/features/tour/components/TourActions';
import { TourInvitation } from '@/features/tour/components/TourInvitation';
import { TourModal } from '@/features/tour/components/TourModal';
import { TourProgress } from '@/features/tour/components/TourProgress';
import { TourResume } from '@/features/tour/components/TourResume';
import { TourStepCard } from '@/features/tour/components/TourStepCard';

/**
 * Orquestrador do tour montado UMA vez na raiz (irmão do `Stack`). Decide, de forma
 * desacoplada das telas, qual overlay exibir. Quando o tour está inativo não renderiza
 * nada — não bloqueia toque nem altera o layout do app.
 *
 * Auto-exibição (convite/retomada) ocorre apenas na Home (`/`); a execução do tour
 * (iniciada pelo convite, retomada ou menu) pode aparecer sobre qualquer tela.
 */
export function TourHost() {
  const strings = useStrings();
  const router = useRouter();
  const pathname = usePathname();
  const {
    state,
    steps,
    currentStep,
    isReady,
    isActive,
    beginTour,
    skipInvite,
    continueTour,
    restartTour,
    next,
    previous,
    skip,
    pause,
  } = useTour();

  const [inviteDismissed, setInviteDismissed] = useState(false);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  const isHome = pathname === ROUTES.HOME;

  const openGuide = () => {
    pause();
    router.push(ROUTES.WHY_FLASHCARDS as Href);
  };

  // Execução do tour: step atual em um modal centralizado.
  if (isActive && currentStep) {
    const isLastStep = currentStep.order >= steps.length;

    return (
      <TourModal visible onScrimPress={pause} closeAccessibilityLabel={strings.tour.closeA11y}>
        <TourProgress current={currentStep.order} total={steps.length} />
        <TourStepCard step={currentStep} onOpenGuide={openGuide} />
        <TourActions
          canGoBack={currentStep.order > 1}
          isLastStep={isLastStep}
          onBack={previous}
          onNext={next}
          onSkip={skip}
        />
      </TourModal>
    );
  }

  if (!isReady || !isHome) {
    return null;
  }

  // Convite inicial (primeira execução).
  if (state.status === 'not_started' && !inviteDismissed) {
    return (
      <TourInvitation
        visible
        onStart={beginTour}
        onSkip={skipInvite}
        onScrimPress={() => setInviteDismissed(true)}
      />
    );
  }

  // Retomada de um tour em andamento.
  if (state.status === 'in_progress' && !resumeDismissed) {
    return (
      <TourResume
        visible
        onContinue={continueTour}
        onRestart={restartTour}
        onSkip={skip}
        onScrimPress={() => setResumeDismissed(true)}
      />
    );
  }

  return null;
}
