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
 * Tour orchestrator mounted ONCE at the root (sibling of `Stack`). Decides, in a
 * screen-decoupled way, which overlay to show. When the tour is inactive it renders
 * nothing — does not block touch or change app layout.
 *
 * Auto-display (invitation/resume) happens only on Home (`/`); tour execution
 * (started from invitation, resume, or menu) may appear over any screen.
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

  // Tour execution: current step in a centered modal.
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

  // Initial invitation (first run).
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

  // Resume an in-progress tour.
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
