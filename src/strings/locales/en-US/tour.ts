export const tour = {
  invitation: {
    question: 'Want to learn how to use the app?',
    start: 'Start tour',
    notNow: 'Not now',
    closeA11y: 'Dismiss tour invitation',
  },
  resume: {
    title: 'You have a tour in progress',
    continueLabel: 'Continue where I left off',
    restart: 'Start over',
    skip: 'Skip tour',
    closeA11y: 'Dismiss tour resume',
  },
  skip: 'Skip',
  finish: 'Finish',
  stepCounterPrefix: 'Step',
  stepCounterConnector: 'of',
  progressA11y: 'Tour progress',
  openGuide: 'Open full guide',
  closeA11y: 'Close tour',
  menu: {
    startTour: 'App tour',
  },
  steps: {
    welcome: {
      title: 'Welcome!',
      description: 'Let’s take a quick tour so you get the most out of the app.',
    },
    'why-flashcards': {
      title: 'Why flashcards work',
      description: 'They use active recall and spaced repetition — techniques proven by science.',
    },
    'home-daily-review': {
      title: 'Home and daily review',
      description: 'On Home you track your progress and the cards due for review today.',
    },
    'collections-decks-cards': {
      title: 'Collections, decks and cards',
      description: 'Organize your study: collections hold decks, and decks hold cards.',
    },
    'creating-good-cards': {
      title: 'How to create good cards',
      description: 'Prefer real, short sentences with one idea per card.',
    },
    'cloze-cards': {
      title: 'Fill-in-the-blank (cloze) cards',
      description: 'Hide part of a sentence to train your memory actively.',
    },
    'spaced-repetition': {
      title: 'Spaced repetition',
      description: 'The app brings each card back at the right time to lock it into memory.',
    },
    finish: {
      title: 'All set!',
      description: 'You’re ready to start. Open the full guide whenever you want.',
    },
  },
} as const;
