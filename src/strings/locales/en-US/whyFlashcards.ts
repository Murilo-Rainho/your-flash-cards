export const whyFlashcards = {
  menuLabel: 'Why flashcards work',
  screenTitle: 'Why learn languages with Flashcards?',
  intro:
    'Learning a new language requires frequent contact with words, expressions and structures. But simply reading or reviewing repeatedly does not guarantee you will remember later. Flashcards are one of the most effective tools for learning vocabulary because they use two techniques studied by cognitive science: Active Recall and Spaced Repetition.',
  sections: [
    {
      heading: 'What are Flashcards?',
      paragraphs: [
        'Flashcards are study cards that show a piece of information on one side and the answer on the other.',
      ],
      example: { front: 'run errands', back: 'handle day-to-day tasks' },
    },
    {
      paragraphs: [
        'When you see the front of the card, you try to recall the answer before revealing it. This simple act of trying to remember strengthens memory and increases retention.',
      ],
    },
    {
      heading: 'What is Active Recall?',
      paragraphs: [
        'Active recall means trying to remember information without looking at the answer. Instead of just reading "run errands = handle tasks", you try to answer "run errands = ?".',
        'This mental effort makes the brain strengthen the connections behind memory. Research shows that trying to recall produces far better results than passive rereading.',
      ],
    },
    {
      heading: 'What is Spaced Repetition?',
      paragraphs: [
        'Spaced repetition spreads reviews out over time. Instead of reviewing a word many times in the same day, you review it at growing intervals:',
      ],
      bullets: ['Today', 'Tomorrow', 'In 3 days', 'In 1 week', 'In 1 month'],
    },
    {
      paragraphs: [
        'This method fights the natural forgetting curve and helps move information from short-term to long-term memory.',
      ],
    },
    {
      heading: 'Why does Spaced Repetition work?',
      paragraphs: [
        'When we review something just before forgetting it, the brain understands it is important and strengthens its retention. Each successful review increases how long we can remember it.',
        'That is why words you have mastered show up less and less, while difficult ones appear more often — making study more efficient.',
      ],
    },
    {
      heading: 'Benefits for learning languages',
      bullets: [
        'Faster vocabulary learning, in an organized and efficient way.',
        'Better long-term retention by combining active recall and spaced repetition.',
        'Personalized study: review frequency adjusts to your performance.',
        'Short, efficient sessions: a few minutes a day already deliver results.',
        'Learning grounded in scientific evidence.',
      ],
    },
    {
      heading: 'How to get the most out of Flashcards?',
      bullets: [
        'Study every day, even if only for a few minutes.',
        'Try to answer before revealing the answer.',
        'Be honest when judging whether you got it right or wrong.',
        'Prefer real examples and complete sentences when possible.',
        'Don’t try to memorize hundreds of words at once.',
        'Trust the spaced repetition system.',
      ],
    },
    {
      heading: 'Example of a good Flashcard',
      example: {
        front: 'I need to run some errands before work.',
        back: 'Preciso resolver algumas tarefas antes do trabalho.',
      },
      paragraphs: [
        'Learning words inside sentences helps you understand context, grammar and real usage of the language.',
      ],
    },
    {
      heading: 'Conclusion',
      paragraphs: [
        'Flashcards don’t work just because they show words and translations. They work because they use learning principles proven by science.',
        'Combined with active recall and spaced repetition, they become one of the most efficient ways to acquire and keep vocabulary. A few minutes of daily practice add up over time.',
      ],
    },
  ],
  summary: {
    heading: 'Summary of the Evidence',
    bullets: [
      'Flashcards are effective for vocabulary acquisition.',
      'Active recall produces better results than passive rereading.',
      'Spaced repetition significantly increases long-term retention.',
      'Digital systems can be as effective as, or more than, traditional methods.',
    ],
  },
  references: {
    heading: 'Scientific References',
    intro:
      'The content on this page is based on academic research about language learning, memory, active recall and spaced repetition.',
    groups: [
      {
        heading: 'Spaced Repetition',
        items: [
          {
            title: 'The Effects of Spaced Practice on Second Language Learning: A Meta-Analysis',
            description:
              'Meta-analysis on the impact of spaced practice on second language learning.',
            url: 'https://www.researchgate.net/publication/358406370_The_Effects_of_Spaced_Practice_on_Second_Language_Learning_A_Meta-Analysis',
          },
          {
            title:
              'Does Spaced Practice Have the Same Effects on Different L2 Vocabulary Activities?',
            description:
              'Study comparing vocabulary activities using spaced repetition, including flashcards.',
            url: 'https://www.researchgate.net/publication/376584142_Does_spaced_practice_have_the_same_effects_on_different_second_language_vocabulary_learning_activities_Fill-in-the-blanks_versus_flashcards',
          },
        ],
      },
      {
        heading: 'Active Recall',
        items: [
          {
            title: 'The Use of Retrieval Practice in the Health Professions',
            description: 'Review of the effects of active recall on learning and retention.',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12292765/',
          },
          {
            title: 'The Moderating Role of Learning Rounds: Effects on Retrieval Practice',
            description: 'Shows that retrieving information is more effective than just rereading.',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12649105/',
          },
        ],
      },
      {
        heading: 'Flashcards and Vocabulary',
        items: [
          {
            title: 'Learning English Vocabulary from Word Cards',
            description: 'Synthesis of research on using flashcards for vocabulary acquisition.',
            url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9485613/',
          },
          {
            title: 'Deliberate Vocabulary Learning from Word Cards',
            description:
              'Cambridge University Press chapter on deliberate vocabulary learning with flashcards.',
            url: 'https://www.cambridge.org/core/books/learning-vocabulary-in-another-language/deliberate-vocabulary-learning-from-word-cards/74EB1B4830C8A6C6A9E1490BCA444AD3',
          },
        ],
      },
      {
        heading: 'Digital Flashcards and Apps',
        items: [
          {
            title: 'Digital Flashcard L2 Vocabulary Learning Out-Performs Traditional Flashcards',
            description:
              'Research comparing digital and physical flashcards for language learning.',
            url: 'https://polipapers.upv.es/index.php/eurocall/article/view/7881',
          },
          {
            title: 'Enhancing L2 Learning Through a Mobile Assisted Spaced-Repetition Application',
            description: 'Study on language learning with mobile spaced-repetition apps.',
            url: 'https://andymatuschak.org/files/papers/Seibert%20Hanson%20and%20Brown%20-%202020%20-%20Enhancing%20L2%20learning%20through%20a%20mobile%20assisted%20sp.pdf',
          },
        ],
      },
    ],
  },
  openLinkA11y: 'Open reference in browser',
} as const;
