import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';

import type { SelectOption } from '@/components/forms/SelectField';
import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { toSpeechLanguage } from '@/constants/languages';
import { ROUTES } from '@/constants/routes';
import { composeClozeBack, composeClozeFront } from '@/domain/cloze/cloze';
import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';
import { useActiveCollections } from '@/features/collections/hooks/useActiveCollections';
import { useActiveDecks } from '@/features/decks/hooks/useActiveDecks';
import { useCreateDeck } from '@/features/decks/hooks/useCreateDeck';
import { isCreateDeckInputError } from '@/features/decks/services/createDeck';
import { useGoBack } from '@/hooks/useGoBack';
import { applyFieldErrors } from '@/utils/forms';

import { useStrings } from '@/features/settings/providers/PreferencesProvider';

import { buildCardTypeFormConfigs, getCardTypeFormConfig } from '../config/cardTypeForm';
import { LISTENING_INPUT_MODES, type ListeningInputMode } from '../config/listeningInputMode';
import {
  TYPING_FRONT_MODES,
  type TypingFrontMode,
  typingFrontModeToListeningMode,
} from '../config/typingFrontMode';
import { VOCABULARY_FRONT_MODES, type VocabularyFrontMode } from '../config/vocabularyFrontMode';
import { sanitizeMediaForType } from '../services/cardMedia';
import {
  isCreateCardInputError,
  type CreateCardFileMediaInput,
  type CreateCardInput,
  type CreateCardMediaInput,
} from '../services/createCard';
import { useAudioRecording } from './useAudioRecording';
import { useCardMedia } from './useCardMedia';
import { useCardTestReview } from './useCardTestReview';
import { useCardTts } from './useCardTts';
import { useCreateCard } from './useCreateCard';

const MAX_RECORDING_MS = 30_000;

export type CardFormStep = 'setup' | 'content';

export type CardFormValues = {
  collectionId: string;
  deckId: string;
  type: CardType;
  frontText: string;
  backText: string;
  clozeBefore: string;
  clozeGap: string;
  clozeAfter: string;
  clozeBackBefore: string;
  clozeBackGap: string;
  clozeBackAfter: string;
  frontMedia: string;
  backMedia: string;
  notes: string;
  tags: string[];
};

const defaultValues: CardFormValues = {
  collectionId: '',
  deckId: '',
  type: CARD_TYPES.CLOZE,
  frontText: '',
  backText: '',
  clozeBefore: '',
  clozeGap: '',
  clozeAfter: '',
  clozeBackBefore: '',
  clozeBackGap: '',
  clozeBackAfter: '',
  frontMedia: '',
  backMedia: '',
  notes: '',
  tags: [],
};

const emptyCollections: Collection[] = [];
const emptyDecks: Deck[] = [];

const defaultListeningModes: Record<MediaSide, ListeningInputMode> = {
  front: LISTENING_INPUT_MODES.AUDIO_FILE,
  back: LISTENING_INPUT_MODES.AUDIO_FILE,
};

/** Orquestra todo o estado do formulário de "Novo Card", entregando um view-model à tela. */
export function useNewCardForm() {
  const router = useRouter();
  const goBack = useGoBack();
  const createCardMutation = useCreateCard();
  const createDeckMutation = useCreateDeck();
  const activeCollectionsQuery = useActiveCollections();
  const tts = useCardTts();

  const [step, setStep] = useState<CardFormStep>('setup');
  const [formError, setFormError] = useState<string | null>(null);
  const [deckCreateErrors, setDeckCreateErrors] = useState<{
    name?: string;
    description?: string;
    form?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [ttsLanguages, setTtsLanguages] = useState<Record<MediaSide, string>>({
    front: 'en-US',
    back: 'pt-BR',
  });
  const [listeningModes, setListeningModes] =
    useState<Record<MediaSide, ListeningInputMode>>(defaultListeningModes);
  const [vocabularyFrontMode, setVocabularyFrontMode] = useState<VocabularyFrontMode>(
    VOCABULARY_FRONT_MODES.TEXT,
  );
  const [typingFrontMode, setTypingFrontMode] = useState<TypingFrontMode>(
    TYPING_FRONT_MODES.AUDIO_FILE,
  );

  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  const {
    clearErrors,
    getValues,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormValues>({ defaultValues });

  const collections = activeCollectionsQuery.data ?? emptyCollections;
  const selectedCollectionId = watch('collectionId');
  const selectedDeckId = watch('deckId');
  const selectedType = watch('type');
  const frontText = watch('frontText');
  const clozeBefore = watch('clozeBefore');
  const clozeGap = watch('clozeGap');
  const clozeAfter = watch('clozeAfter');
  const clozeBackBefore = watch('clozeBackBefore');
  const clozeBackGap = watch('clozeBackGap');
  const clozeBackAfter = watch('clozeBackAfter');
  const backText = watch('backText');
  const tags = watch('tags');
  const notes = watch('notes');

  const media = useCardMedia({ selectedType, onError: setFormError, onChange: clearSuccess });
  const recording = useAudioRecording({
    maxDurationMs: MAX_RECORDING_MS,
    onError: setFormError,
    onComplete: ({ side, uri }) => {
      media.setSideMedia({
        side,
        type: MEDIA_TYPES.RECORDING,
        uri,
        mimeType: 'audio/m4a',
        fileName: `gravacao-${side}.m4a`,
      });
    },
  });

  const activeDecksQuery = useActiveDecks(selectedCollectionId || undefined);
  const decks = activeDecksQuery.data ?? emptyDecks;
  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId,
  );
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);
  const strings = useStrings();
  const cardTypeStrings = strings.cards.cardTypes;
  const selectedTypeConfig = getCardTypeFormConfig(selectedType, cardTypeStrings);
  const isSaving = createCardMutation.isPending;
  const isCreatingDeck = createDeckMutation.isPending;
  const isRecording = recording.isRecording;
  const isSetupLoading = activeCollectionsQuery.isLoading || activeDecksQuery.isLoading;
  const canGoNext =
    Boolean(selectedCollectionId) &&
    Boolean(selectedDeckId) &&
    Boolean(selectedType) &&
    !isSetupLoading &&
    collections.length > 0 &&
    decks.length > 0;
  const isSaveDisabled = isSaving || isRecording || !canGoNext;
  const frontMedia = media.media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  const backMedia = media.media.filter((item) => item.side === MEDIA_SIDES.BACK);

  const collectionOptions = collections.map<SelectOption>((collection) => ({
    value: collection.id,
    label: collection.name,
    description: `${collection.baseLanguage.toUpperCase()} -> ${collection.targetLanguage.toUpperCase()}`,
  }));
  const deckOptions = decks.map<SelectOption>((deck) => ({
    value: deck.id,
    label: deck.name,
    description: deck.autoGenerateReverseCards
      ? strings.cards.reverseModeAuto
      : strings.cards.reverseModeOriginalOnly,
  }));
  const typeOptions = buildCardTypeFormConfigs(cardTypeStrings).map<SelectOption>((config) => ({
    value: config.type,
    label: config.label,
    description: config.description,
    badge: config.recommended ? strings.common.recommended : undefined,
  }));

  const clearCardContent = useCallback(() => {
    media.clearMedia();
    setListeningModes(defaultListeningModes);
    setVocabularyFrontMode(VOCABULARY_FRONT_MODES.TEXT);
    setTypingFrontMode(TYPING_FRONT_MODES.AUDIO_FILE);
    setShowOptionalFields(false);
    clearErrors(['frontText', 'backText', 'frontMedia', 'backMedia', 'tags', 'notes']);
    setValue('frontText', '', { shouldDirty: false, shouldValidate: false });
    setValue('clozeBefore', '', { shouldDirty: false, shouldValidate: false });
    setValue('clozeGap', '', { shouldDirty: false, shouldValidate: false });
    setValue('clozeAfter', '', { shouldDirty: false, shouldValidate: false });
    setValue('clozeBackBefore', '', { shouldDirty: false, shouldValidate: false });
    setValue('clozeBackGap', '', { shouldDirty: false, shouldValidate: false });
    setValue('clozeBackAfter', '', { shouldDirty: false, shouldValidate: false });
    setValue('backText', '', { shouldDirty: false, shouldValidate: false });
    setValue('tags', [], { shouldDirty: false, shouldValidate: false });
    setValue('notes', '', { shouldDirty: false, shouldValidate: false });
  }, [clearErrors, media, setValue]);

  useEffect(() => {
    if (!selectedCollectionId && collections[0]) {
      setValue('collectionId', collections[0].id, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [collections, selectedCollectionId, setValue]);

  useEffect(() => {
    if (!selectedCollection) {
      return;
    }

    setTtsLanguages({
      front: toSpeechLanguage(selectedCollection.targetLanguage),
      back:
        selectedType === CARD_TYPES.PRONUNCIATION
          ? toSpeechLanguage(selectedCollection.targetLanguage)
          : toSpeechLanguage(selectedCollection.baseLanguage),
    });
  }, [selectedCollection, selectedType]);

  useEffect(() => {
    if (!selectedCollectionId) {
      return;
    }

    if (!decks.some((deck) => deck.id === selectedDeckId)) {
      setValue('deckId', decks[0]?.id ?? '', {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [decks, selectedCollectionId, selectedDeckId, setValue]);

  const handleBack = useCallback(() => {
    if (step === 'content') {
      setStep('setup');
      return;
    }

    goBack();
  }, [goBack, step]);

  // Intercepta o back nativo (botão/gesto de hardware do Android) na etapa de conteúdo,
  // para voltar à etapa de setup em vez de fechar a tela inteira.
  useEffect(() => {
    if (step !== 'content') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setStep('setup');
      return true;
    });

    return () => subscription.remove();
  }, [step]);

  const handleCollectionChange = useCallback(
    (collectionId: string) => {
      setValue('collectionId', collectionId, { shouldDirty: true, shouldValidate: false });
      setValue('deckId', '', { shouldDirty: true, shouldValidate: false });
      clearCardContent();
      setSuccessMessage(null);
      setFormError(null);
    },
    [clearCardContent, setValue],
  );

  const handleDeckChange = useCallback(
    (deckId: string) => {
      setValue('deckId', deckId, { shouldDirty: true, shouldValidate: false });
      clearCardContent();
      setSuccessMessage(null);
      setFormError(null);
    },
    [clearCardContent, setValue],
  );

  const handleCreateDeck = useCallback(
    async ({ name, description }: { name: string; description: string }) => {
      if (!selectedCollectionId) {
        return false;
      }

      setDeckCreateErrors({});

      try {
        const deck = await createDeckMutation.mutateAsync({
          collectionId: selectedCollectionId,
          name,
          description: description || undefined,
          autoGenerateReverseCards: false,
        });
        setValue('deckId', deck.id, { shouldDirty: true, shouldValidate: true });
        clearErrors('deckId');
        setFormError(null);
        return true;
      } catch (error) {
        if (isCreateDeckInputError(error)) {
          setDeckCreateErrors({
            name: error.fieldErrors.name,
            description: error.fieldErrors.description,
            form: error.fieldErrors.collectionId,
          });
          return false;
        }

        setDeckCreateErrors({ form: strings.decks.createError });
        return false;
      }
    },
    [clearErrors, createDeckMutation, selectedCollectionId, setValue, strings.decks.createError],
  );

  const clearDeckCreateErrors = useCallback(() => setDeckCreateErrors({}), []);

  const handleTypeChange = useCallback(
    (type: string) => {
      if (!Object.values(CARD_TYPES).includes(type as CardType)) {
        return;
      }

      const nextType = type as CardType;
      setValue('type', nextType, { shouldDirty: true, shouldValidate: false });
      media.sanitizeForType(nextType);
      setListeningModes(defaultListeningModes);
      setVocabularyFrontMode(VOCABULARY_FRONT_MODES.TEXT);
      setTypingFrontMode(TYPING_FRONT_MODES.AUDIO_FILE);
      setSuccessMessage(null);
      setFormError(null);
    },
    [media, setValue],
  );

  const handleVocabularyFrontModeChange = useCallback(
    (mode: VocabularyFrontMode) => {
      setVocabularyFrontMode(mode);
      setFormError(null);
      clearErrors(['frontText', 'frontMedia']);
      media.removeSideMedia(MEDIA_SIDES.FRONT, MEDIA_TYPES.IMAGE);
      media.removeSideMedia(MEDIA_SIDES.FRONT, MEDIA_TYPES.AUDIO);
      setValue('frontText', '', { shouldDirty: true });

      if (mode === VOCABULARY_FRONT_MODES.AUDIO) {
        setListeningModes((current) => ({
          ...current,
          front: LISTENING_INPUT_MODES.AUDIO_FILE,
        }));
      }
    },
    [clearErrors, media, setValue],
  );

  const handleTypingFrontModeChange = useCallback(
    (mode: TypingFrontMode) => {
      setTypingFrontMode(mode);
      setFormError(null);
      clearErrors(['frontText', 'frontMedia', 'backText']);
      media.removeSideMedia(MEDIA_SIDES.FRONT, MEDIA_TYPES.IMAGE);
      media.removeSideMedia(MEDIA_SIDES.FRONT, MEDIA_TYPES.AUDIO);
      setValue('frontText', '', { shouldDirty: true });
      // O verso é redefinido: no modo TTS ele passa a espelhar o texto da frente (sem campo
      // próprio); nos demais modos volta a ser a resposta digitada manualmente.
      setValue('backText', '', { shouldDirty: true });
      // Reaproveita a plumbing de áudio/TTS (teste de áudio e materialização do TTS no envio).
      setListeningModes((current) => ({ ...current, front: typingFrontModeToListeningMode(mode) }));
    },
    [clearErrors, media, setValue],
  );

  const handleChangeText = useCallback(
    (side: MediaSide, value: string) => {
      setValue(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', value, {
        shouldDirty: true,
      });

      // Escuta em modo TTS: a frase falada (frente) também é a transcrição esperada (verso).
      // Escrita em modo TTS: a resposta esperada (verso) é o próprio texto falado da frente.
      // Em ambos `listeningModes.front` está sincronizado em TTS.
      if (
        side === MEDIA_SIDES.FRONT &&
        listeningModes.front === LISTENING_INPUT_MODES.TTS &&
        (selectedType === CARD_TYPES.LISTENING || selectedType === CARD_TYPES.TYPING)
      ) {
        setValue('backText', value, { shouldDirty: true });
      }

      // Pronúncia em modo TTS: o áudio modelo (verso) reutiliza o texto da frente.
      if (
        side === MEDIA_SIDES.FRONT &&
        selectedType === CARD_TYPES.PRONUNCIATION &&
        listeningModes.back === LISTENING_INPUT_MODES.TTS
      ) {
        setValue('backText', value, { shouldDirty: true });
      }
    },
    [listeningModes.back, listeningModes.front, selectedType, setValue],
  );

  const syncClozeFrontText = useCallback(
    (before: string, gap: string, after: string) => {
      setValue('frontText', composeClozeFront(before, gap, after) ?? '', { shouldDirty: true });
    },
    [setValue],
  );

  const syncClozeBackText = useCallback(
    (before: string, gap: string, after: string) => {
      setValue('backText', composeClozeBack(before, gap, after) ?? '', { shouldDirty: true });
    },
    [setValue],
  );

  const handleChangeCloze = useCallback(
    (side: 'front' | 'back', part: 'before' | 'gap' | 'after', value: string) => {
      if (side === 'front') {
        if (part === 'before') {
          setValue('clozeBefore', value, { shouldDirty: true });
          setValue('clozeBackBefore', value, { shouldDirty: true });
          syncClozeFrontText(value, getValues('clozeGap'), getValues('clozeAfter'));
          syncClozeBackText(value, getValues('clozeBackGap'), getValues('clozeBackAfter'));
          return;
        }

        if (part === 'gap') {
          setValue('clozeGap', value, { shouldDirty: true });
          syncClozeFrontText(getValues('clozeBefore'), value, getValues('clozeAfter'));
          return;
        }

        setValue('clozeAfter', value, { shouldDirty: true });
        setValue('clozeBackAfter', value, { shouldDirty: true });
        syncClozeFrontText(getValues('clozeBefore'), getValues('clozeGap'), value);
        syncClozeBackText(getValues('clozeBackBefore'), getValues('clozeBackGap'), value);
        return;
      }

      if (part === 'before') {
        setValue('clozeBackBefore', value, { shouldDirty: true });
        syncClozeBackText(value, getValues('clozeBackGap'), getValues('clozeBackAfter'));
        return;
      }

      if (part === 'gap') {
        setValue('clozeBackGap', value, { shouldDirty: true });
        syncClozeBackText(getValues('clozeBackBefore'), value, getValues('clozeBackAfter'));
        return;
      }

      setValue('clozeBackAfter', value, { shouldDirty: true });
      syncClozeBackText(getValues('clozeBackBefore'), getValues('clozeBackGap'), value);
    },
    [getValues, setValue, syncClozeBackText, syncClozeFrontText],
  );

  const toggleTts = useCallback(
    async (side: MediaSide) => {
      setFormError(null);
      const currentText = side === MEDIA_SIDES.FRONT ? frontText : backText;
      const language = ttsLanguages[side];

      if (!currentText.trim()) {
        setError(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', {
          message: strings.cards.ttsTextRequired,
        });
        return;
      }

      if (!(await tts.isAvailable(language))) {
        setFormError(strings.cards.ttsUnavailable);
        return;
      }

      media.setSideMedia({ side, type: MEDIA_TYPES.TTS, language });
    },
    [
      backText,
      frontText,
      media,
      setError,
      strings.cards.ttsTextRequired,
      strings.cards.ttsUnavailable,
      tts,
      ttsLanguages,
    ],
  );

  const speakTts = useCallback(
    async (side: MediaSide) => {
      setFormError(null);
      const text = side === MEDIA_SIDES.FRONT ? frontText : backText;

      try {
        await tts.speak(text, ttsLanguages[side]);
      } catch {
        setFormError(strings.cards.ttsPlaybackError);
      }
    },
    [backText, frontText, strings.cards.ttsPlaybackError, tts, ttsLanguages],
  );

  const handleTtsLanguageChange = useCallback((side: MediaSide, language: string) => {
    setTtsLanguages((current) => ({ ...current, [side]: language }));
  }, []);

  const handleListeningModeChange = useCallback(
    (side: MediaSide, mode: ListeningInputMode) => {
      setListeningModes((current) => ({ ...current, [side]: mode }));
      media.removeSideMedia(side, MEDIA_TYPES.AUDIO);

      const isListeningFront = selectedType === CARD_TYPES.LISTENING && side === MEDIA_SIDES.FRONT;
      // Pronúncia: o modo de áudio mora no verso e o texto falado vem da frente.
      const isPronunciationBack =
        selectedType === CARD_TYPES.PRONUNCIATION && side === MEDIA_SIDES.BACK;

      if (mode !== LISTENING_INPUT_MODES.TTS) {
        setValue(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', '', {
          shouldDirty: true,
        });
        // Escuta saindo do TTS: o revisor digitará a transcrição manualmente.
        if (isListeningFront) {
          setValue('backText', '', { shouldDirty: true });
        }
      } else if (isListeningFront || isPronunciationBack) {
        // Entrando no TTS, o lado do áudio espelha o texto da frente (transcrição/frase falada).
        setValue('backText', getValues('frontText'), { shouldDirty: true });
      }
    },
    [getValues, media, selectedType, setValue],
  );

  const testListeningAudio = useCallback(
    async (side: MediaSide) => {
      setFormError(null);

      if (listeningModes[side] === LISTENING_INPUT_MODES.TTS) {
        await speakTts(side);
        return;
      }

      const sideMedia = media.media.find(
        (item): item is CreateCardFileMediaInput =>
          item.side === side &&
          (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING),
      );

      if (!sideMedia) {
        setError(side === MEDIA_SIDES.FRONT ? 'frontMedia' : 'backMedia', {
          message: strings.cards.audioRequiredToTest,
        });
        return;
      }

      try {
        await recording.playAudio(sideMedia.uri);
      } catch {
        setFormError(strings.cards.audioPlaybackError);
      }
    },
    [
      listeningModes,
      media.media,
      recording,
      setError,
      speakTts,
      strings.cards.audioPlaybackError,
      strings.cards.audioRequiredToTest,
    ],
  );

  const buildMediaForSubmit = useCallback(
    async (values: CardFormValues): Promise<CreateCardMediaInput[]> => {
      let nextMedia = sanitizeMediaForType(values.type, media.media);

      // Escuta e Vocabulário (modo áudio) constroem o TTS da frente no envio, a partir do
      // texto digitado e do idioma da frente.
      const usesFrontTts =
        (values.type === CARD_TYPES.LISTENING &&
          listeningModes.front === LISTENING_INPUT_MODES.TTS) ||
        (values.type === CARD_TYPES.VOCABULARY &&
          vocabularyFrontMode === VOCABULARY_FRONT_MODES.AUDIO &&
          listeningModes.front === LISTENING_INPUT_MODES.TTS) ||
        // Escrita em modo TTS: a frente lê o texto-fonte digitado, com o idioma da frente.
        (values.type === CARD_TYPES.TYPING && typingFrontMode === TYPING_FRONT_MODES.TTS);

      // Pronúncia em modo TTS: o áudio modelo (verso) lê o texto da frente, com idioma do verso.
      const usesBackTts =
        values.type === CARD_TYPES.PRONUNCIATION &&
        listeningModes.back === LISTENING_INPUT_MODES.TTS;

      if (usesFrontTts && values.frontText.trim()) {
        const language = ttsLanguages.front;

        if (!(await tts.isAvailable(language))) {
          throw new Error('TTS_UNAVAILABLE');
        }

        nextMedia = [
          ...nextMedia.filter(
            (item) => !(item.side === MEDIA_SIDES.FRONT && item.type === MEDIA_TYPES.TTS),
          ),
          { side: MEDIA_SIDES.FRONT, type: MEDIA_TYPES.TTS, language },
        ];
      }

      if (usesBackTts && values.frontText.trim()) {
        const language = ttsLanguages.back;

        if (!(await tts.isAvailable(language))) {
          throw new Error('TTS_UNAVAILABLE');
        }

        nextMedia = [
          ...nextMedia.filter(
            (item) => !(item.side === MEDIA_SIDES.BACK && item.type === MEDIA_TYPES.TTS),
          ),
          { side: MEDIA_SIDES.BACK, type: MEDIA_TYPES.TTS, language },
        ];
      }

      return nextMedia;
    },
    [listeningModes, media.media, tts, ttsLanguages, typingFrontMode, vocabularyFrontMode],
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);

    let submitMedia: CreateCardMediaInput[];

    try {
      submitMedia = await buildMediaForSubmit(values);
    } catch {
      setFormError(strings.cards.ttsUnavailable);
      return;
    }

    const clozeFrontText =
      values.type === CARD_TYPES.CLOZE
        ? (composeClozeFront(values.clozeBefore, values.clozeGap, values.clozeAfter) ?? '')
        : values.frontText;
    const clozeBackText =
      values.type === CARD_TYPES.CLOZE
        ? (composeClozeBack(values.clozeBackBefore, values.clozeBackGap, values.clozeBackAfter) ??
          '')
        : values.backText;

    const input: CreateCardInput = {
      collectionId: values.collectionId,
      deckId: values.deckId,
      type: values.type,
      frontText: values.type === CARD_TYPES.CLOZE ? clozeFrontText : values.frontText,
      // Pronúncia em modo TTS espelha o texto da frente no verso (frase falada); nos modos de
      // áudio o verso fica sem texto (só mídia). A Escuta usa a transcrição no verso.
      backText: values.type === CARD_TYPES.CLOZE ? clozeBackText : values.backText,
      notes: values.notes,
      tags: values.tags,
      media: submitMedia,
    };

    try {
      await createCardMutation.mutateAsync(input);
      clearCardContent();
      reset({
        ...defaultValues,
        collectionId: values.collectionId,
        deckId: values.deckId,
        type: values.type,
      });
      setStep('content');
      setSuccessMessage(strings.cards.savedNextReady);
    } catch (error) {
      if (isCreateCardInputError(error)) {
        applyFieldErrors(setError, error.fieldErrors);
        return;
      }

      setFormError(strings.cards.createError);
    }
  });

  const onNext = useCallback(() => {
    clearErrors(['collectionId', 'deckId', 'type']);
    setStep('content');
  }, [clearErrors]);

  const testReview = useCardTestReview({
    type: selectedType,
    frontText,
    backText,
    cloze: {
      front: { before: clozeBefore, gap: clozeGap, after: clozeAfter },
      back: { before: clozeBackBefore, gap: clozeBackGap, after: clozeBackAfter },
    },
    frontMedia,
    backMedia,
    reviewStrings: strings.review,
    onPlayAudio: recording.playAudio,
    onSpeakTts: (side: MediaSide) => {
      void speakTts(side);
    },
  });

  return {
    step,
    collectionsLoading: activeCollectionsQuery.isLoading,
    collectionsError: activeCollectionsQuery.error,
    onRetryCollections: () => {
      void activeCollectionsQuery.refetch();
    },
    collections,
    collectionOptions,
    deckOptions,
    decksLoading: activeDecksQuery.isLoading,
    decksEmpty: Boolean(selectedCollectionId) && decks.length === 0 && !activeDecksQuery.isLoading,
    typeOptions,
    selectedCollectionId,
    selectedDeckId,
    selectedType,
    selectedCollectionName: selectedCollection?.name,
    selectedDeckName: selectedDeck?.name,
    selectedTypeLabel: selectedTypeConfig.label,
    errors,
    formError,
    successMessage,
    isSaving,
    isCreatingDeck,
    deckCreateErrors,
    isRecording,
    canGoNext,
    isSaveDisabled,
    frontText,
    backText,
    cloze: {
      front: { before: clozeBefore, gap: clozeGap, after: clozeAfter },
      back: { before: clozeBackBefore, gap: clozeBackGap, after: clozeBackAfter },
    },
    frontMedia,
    backMedia,
    ttsLanguages,
    listeningModes,
    vocabularyFrontMode,
    typingFrontMode,
    recordingSide: recording.recordingSide,
    recordingDurationMs: recording.recordingDurationMs,
    tags,
    notes,
    showOptionalFields,
    testReview,
    handleBack,
    onCollectionChange: handleCollectionChange,
    onDeckChange: handleDeckChange,
    onCreateDeck: handleCreateDeck,
    onCreateDeckFormDismiss: clearDeckCreateErrors,
    onTypeChange: handleTypeChange,
    onVocabularyFrontModeChange: handleVocabularyFrontModeChange,
    onTypingFrontModeChange: handleTypingFrontModeChange,
    onNext,
    onSubmit,
    goToCreateCollection: () => router.replace(ROUTES.COLLECTION_NEW),
    goToCreateDeck: () => router.replace(ROUTES.DECK_NEW),
    onChangeText: handleChangeText,
    onChangeCloze: handleChangeCloze,
    onPickImage: (side: MediaSide, source: 'library' | 'camera') => {
      void media.pickImage(side, source);
    },
    onPickAudio: (side: MediaSide) => {
      void media.pickAudio(side);
    },
    onStartRecording: (side: MediaSide) => {
      void recording.startRecording(side);
    },
    onStopRecording: () => {
      void recording.stopRecording();
    },
    onRemoveMedia: media.removeSideMedia,
    onPlayAudio: recording.playAudio,
    onToggleTts: (side: MediaSide) => {
      void toggleTts(side);
    },
    onSpeakTts: (side: MediaSide) => {
      void speakTts(side);
    },
    onTtsLanguageChange: handleTtsLanguageChange,
    onListeningModeChange: handleListeningModeChange,
    onTestListeningAudio: (side: MediaSide) => {
      void testListeningAudio(side);
    },
    onToggleOptional: () => setShowOptionalFields((current) => !current),
    onChangeTags: (names: string[]) => setValue('tags', names, { shouldDirty: true }),
    onChangeNotes: (value: string) => setValue('notes', value, { shouldDirty: true }),
  };
}
