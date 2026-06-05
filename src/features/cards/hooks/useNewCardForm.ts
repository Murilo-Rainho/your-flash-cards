import { useCallback, useEffect, useState } from 'react';
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
import { useGoBack } from '@/hooks/useGoBack';
import { applyFieldErrors } from '@/utils/forms';
import { splitTags } from '@/utils/text';

import { CARD_TYPE_FORM_CONFIGS, getCardTypeFormConfig } from '../config/cardTypeForm';
import { LISTENING_INPUT_MODES, type ListeningInputMode } from '../config/listeningInputMode';
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
  tags: string;
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
  tags: '',
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
  const activeCollectionsQuery = useActiveCollections();
  const tts = useCardTts();

  const [step, setStep] = useState<CardFormStep>('setup');
  const [formError, setFormError] = useState<string | null>(null);
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
  const selectedTypeConfig = getCardTypeFormConfig(selectedType);
  const isSaving = createCardMutation.isPending;
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
      ? 'Reverso automatico ativo'
      : 'Somente card original',
  }));
  const typeOptions = CARD_TYPE_FORM_CONFIGS.map<SelectOption>((config) => ({
    value: config.type,
    label: config.label,
    description: config.description,
    badge: config.recommended ? 'Recomendado' : undefined,
  }));

  const clearCardContent = useCallback(() => {
    media.clearMedia();
    setListeningModes(defaultListeningModes);
    setVocabularyFrontMode(VOCABULARY_FRONT_MODES.TEXT);
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
    setValue('tags', '', { shouldDirty: false, shouldValidate: false });
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

  const handleChangeText = useCallback(
    (side: MediaSide, value: string) => {
      setValue(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', value, {
        shouldDirty: true,
      });
    },
    [setValue],
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
          message: 'Informe texto para usar TTS local.',
        });
        return;
      }

      if (!(await tts.isAvailable(language))) {
        setFormError('TTS local indisponivel para este idioma neste dispositivo.');
        return;
      }

      media.setSideMedia({ side, type: MEDIA_TYPES.TTS, language });
    },
    [backText, frontText, media, setError, tts, ttsLanguages],
  );

  const speakTts = useCallback(
    async (side: MediaSide) => {
      setFormError(null);
      const text = side === MEDIA_SIDES.FRONT ? frontText : backText;

      try {
        await tts.speak(text, ttsLanguages[side]);
      } catch {
        setFormError('Nao foi possivel reproduzir TTS local para este idioma.');
      }
    },
    [backText, frontText, tts, ttsLanguages],
  );

  const handleTtsLanguageChange = useCallback((side: MediaSide, language: string) => {
    setTtsLanguages((current) => ({ ...current, [side]: language }));
  }, []);

  const handleListeningModeChange = useCallback(
    (side: MediaSide, mode: ListeningInputMode) => {
      setListeningModes((current) => ({ ...current, [side]: mode }));
      media.removeSideMedia(side, MEDIA_TYPES.AUDIO);

      if (mode !== LISTENING_INPUT_MODES.TTS) {
        setValue(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', '', {
          shouldDirty: true,
        });
      }
    },
    [media, setValue],
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
          message: 'Adicione audio antes de testar.',
        });
        return;
      }

      try {
        await recording.playAudio(sideMedia.uri);
      } catch {
        setFormError('Nao foi possivel reproduzir o audio.');
      }
    },
    [listeningModes, media.media, recording, setError, speakTts],
  );

  const buildMediaForSubmit = useCallback(
    async (values: CardFormValues): Promise<CreateCardMediaInput[]> => {
      let nextMedia = sanitizeMediaForType(values.type, media.media);

      // Escuta, Pronúncia e Vocabulário (modo áudio) constroem o TTS da frente no envio,
      // a partir do texto digitado e do idioma da frente.
      const usesFrontTts =
        ((values.type === CARD_TYPES.LISTENING || values.type === CARD_TYPES.PRONUNCIATION) &&
          listeningModes.front === LISTENING_INPUT_MODES.TTS) ||
        (values.type === CARD_TYPES.VOCABULARY &&
          vocabularyFrontMode === VOCABULARY_FRONT_MODES.AUDIO &&
          listeningModes.front === LISTENING_INPUT_MODES.TTS);

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

      return nextMedia;
    },
    [listeningModes, media.media, tts, ttsLanguages, vocabularyFrontMode],
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);

    let submitMedia: CreateCardMediaInput[];

    try {
      submitMedia = await buildMediaForSubmit(values);
    } catch {
      setFormError('TTS local indisponivel para este idioma neste dispositivo.');
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

    const backIsContentless =
      values.type === CARD_TYPES.LISTENING || values.type === CARD_TYPES.PRONUNCIATION;

    const input: CreateCardInput = {
      collectionId: values.collectionId,
      deckId: values.deckId,
      type: values.type,
      frontText: values.type === CARD_TYPES.CLOZE ? clozeFrontText : values.frontText,
      backText:
        values.type === CARD_TYPES.CLOZE ? clozeBackText : backIsContentless ? '' : values.backText,
      notes: values.notes,
      tags: splitTags(values.tags),
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
      setSuccessMessage('Card salvo. Proximo card pronto.');
    } catch (error) {
      if (isCreateCardInputError(error)) {
        applyFieldErrors(setError, error.fieldErrors);
        return;
      }

      setFormError('Nao foi possivel criar o card local.');
    }
  });

  const onNext = useCallback(() => {
    clearErrors(['collectionId', 'deckId', 'type']);
    setStep('content');
  }, [clearErrors]);

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
    recordingSide: recording.recordingSide,
    recordingDurationMs: recording.recordingDurationMs,
    tags,
    notes,
    showOptionalFields,
    handleBack,
    onCollectionChange: handleCollectionChange,
    onDeckChange: handleDeckChange,
    onTypeChange: handleTypeChange,
    onVocabularyFrontModeChange: handleVocabularyFrontModeChange,
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
    onChangeTags: (value: string) => setValue('tags', value, { shouldDirty: true }),
    onChangeNotes: (value: string) => setValue('notes', value, { shouldDirty: true }),
  };
}
