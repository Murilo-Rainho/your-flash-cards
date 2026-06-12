import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { SelectOption } from '@/components/forms/SelectField';
import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { DEFAULT_TTS_PLAYBACK_SPEED, type TtsPlaybackSpeed } from '@/constants/tts';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';
import type { CardAggregate } from '@/domain/repositories/CardRepository';
import { useCollection } from '@/features/collections/hooks/useCollection';
import { useActiveDecks } from '@/features/decks/hooks/useActiveDecks';
import { useDeck } from '@/features/decks/hooks/useDeck';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { applyFieldErrors } from '@/utils/forms';

import { LISTENING_INPUT_MODES, type ListeningInputMode } from '../config/listeningInputMode';
import { getCardTypeFormConfig } from '../config/cardTypeForm';
import {
  TYPING_FRONT_MODES,
  type TypingFrontMode,
  typingFrontModeToListeningMode,
} from '../config/typingFrontMode';
import { VOCABULARY_FRONT_MODES, type VocabularyFrontMode } from '../config/vocabularyFrontMode';
import { sanitizeMediaForType } from '../services/cardMedia';
import { deriveEditCardPrefill } from '../services/deriveEditCardPrefill';
import { localizeCardFieldErrors } from '../services/localizeCardFieldErrors';
import type { CreateCardFileMediaInput, CreateCardMediaInput } from '../services/sanitizeCardInput';
import { isUpdateCardInputError } from '../services/updateCard';
import { useAudioRecording } from './useAudioRecording';
import { useCardMedia } from './useCardMedia';
import { useCardTestReview } from './useCardTestReview';
import { useCardTts } from './useCardTts';
import { useClozeEditor } from './useClozeEditor';
import { useDeleteCard } from './useDeleteCard';
import { useUpdateCard } from './useUpdateCard';

const MAX_RECORDING_MS = 30_000;

type EditCardFormValues = {
  deckId: string;
  frontText: string;
  backText: string;
  frontMedia: string;
  backMedia: string;
  notes: string;
  tags: string[];
};

const emptyDecks: Deck[] = [];

type UseEditCardFormParams = {
  aggregate: CardAggregate;
  onSaved: () => void;
  onDeleted: () => void;
};

/** Estado do formulário de edição de card. O tipo é imutável; reusa o render de `CardTypeFields`. */
export function useEditCardForm({ aggregate, onSaved, onDeleted }: UseEditCardFormParams) {
  const strings = useStrings();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const tts = useCardTts();

  const card = aggregate.card;
  const type: CardType = card.type;

  const currentDeckQuery = useDeck(card.deckId);
  const collectionId = currentDeckQuery.data?.collectionId;
  const collectionQuery = useCollection(collectionId);
  const decksQuery = useActiveDecks(collectionId);
  const decks = decksQuery.data ?? emptyDecks;

  const prefill = useMemo(
    () => deriveEditCardPrefill(aggregate, collectionQuery.data),
    [aggregate, collectionQuery.data],
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [ttsLanguages, setTtsLanguages] = useState<Record<MediaSide, string>>(prefill.ttsLanguages);
  const [listeningModes, setListeningModes] = useState<Record<MediaSide, ListeningInputMode>>(
    prefill.listeningModes,
  );
  const [vocabularyFrontMode, setVocabularyFrontMode] = useState<VocabularyFrontMode>(
    prefill.vocabularyFrontMode,
  );
  const [typingFrontMode, setTypingFrontMode] = useState<TypingFrontMode>(prefill.typingFrontMode);

  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  const {
    clearErrors,
    getValues,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditCardFormValues>({
    defaultValues: {
      deckId: card.deckId,
      frontText: prefill.frontText,
      backText: prefill.backText,
      frontMedia: '',
      backMedia: '',
      notes: prefill.notes,
      tags: prefill.tags,
    },
  });

  const selectedDeckId = watch('deckId');
  const frontText = watch('frontText');
  const backText = watch('backText');
  const tags = watch('tags');
  const notes = watch('notes');

  const clozeEditor = useClozeEditor(prefill.cloze);

  useEffect(() => {
    if (type !== CARD_TYPES.CLOZE) {
      return;
    }

    clearErrors(['frontText', 'backText']);
  }, [clearErrors, clozeEditor.content, type]);

  const media = useCardMedia({
    selectedType: type,
    onError: setFormError,
    onChange: clearSuccess,
    initialMedia: prefill.media,
  });
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

  const selectedTypeConfig = getCardTypeFormConfig(type, strings.cards.cardTypes);
  const isSaving = updateCardMutation.isPending;
  const isDeleting = deleteCardMutation.isPending;
  const isRecording = recording.isRecording;
  const isSaveDisabled = isSaving || isDeleting || isRecording;
  const frontMedia = media.media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  const backMedia = media.media.filter((item) => item.side === MEDIA_SIDES.BACK);

  const deckOptions = decks.map<SelectOption>((deck) => ({
    value: deck.id,
    label: deck.name,
    description: deck.autoGenerateReverseCards
      ? strings.cards.reverseModeAuto
      : strings.cards.reverseModeOriginalOnly,
  }));

  // Atualiza idiomas de TTS padrão quando a coleção carrega, sem sobrescrever um TTS já existente.
  useEffect(() => {
    const collection = collectionQuery.data;
    if (!collection) {
      return;
    }
    setTtsLanguages(prefill.ttsLanguages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionQuery.data]);

  const handleDeckChange = useCallback(
    (deckId: string) => {
      setValue('deckId', deckId, { shouldDirty: true, shouldValidate: false });
      setSuccessMessage(null);
      setFormError(null);
    },
    [setValue],
  );

  const handleChangeText = useCallback(
    (side: MediaSide, value: string) => {
      setValue(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', value, {
        shouldDirty: true,
      });

      if (
        side === MEDIA_SIDES.FRONT &&
        listeningModes.front === LISTENING_INPUT_MODES.TTS &&
        (type === CARD_TYPES.LISTENING || type === CARD_TYPES.TYPING)
      ) {
        setValue('backText', value, { shouldDirty: true });
      }

      if (
        side === MEDIA_SIDES.FRONT &&
        type === CARD_TYPES.PRONUNCIATION &&
        listeningModes.back === LISTENING_INPUT_MODES.TTS
      ) {
        setValue('backText', value, { shouldDirty: true });
      }
    },
    [listeningModes.back, listeningModes.front, type, setValue],
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
        setListeningModes((current) => ({ ...current, front: LISTENING_INPUT_MODES.AUDIO_FILE }));
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
      setValue('backText', '', { shouldDirty: true });
      setListeningModes((current) => ({ ...current, front: typingFrontModeToListeningMode(mode) }));
    },
    [clearErrors, media, setValue],
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
    async (side: MediaSide, speed: TtsPlaybackSpeed) => {
      setFormError(null);
      const text = side === MEDIA_SIDES.FRONT ? frontText : backText;

      try {
        await tts.speak(text, ttsLanguages[side], speed);
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

      const isListeningFront = type === CARD_TYPES.LISTENING && side === MEDIA_SIDES.FRONT;
      const isPronunciationBack = type === CARD_TYPES.PRONUNCIATION && side === MEDIA_SIDES.BACK;

      if (mode !== LISTENING_INPUT_MODES.TTS) {
        setValue(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', '', { shouldDirty: true });
        if (isListeningFront) {
          setValue('backText', '', { shouldDirty: true });
        }
      } else if (isListeningFront || isPronunciationBack) {
        setValue('backText', getValues('frontText'), { shouldDirty: true });
      }
    },
    [getValues, media, type, setValue],
  );

  const testListeningAudio = useCallback(
    async (side: MediaSide, speed: TtsPlaybackSpeed = DEFAULT_TTS_PLAYBACK_SPEED) => {
      setFormError(null);

      if (listeningModes[side] === LISTENING_INPUT_MODES.TTS) {
        await speakTts(side, speed);
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
    async (values: EditCardFormValues): Promise<CreateCardMediaInput[]> => {
      let nextMedia = sanitizeMediaForType(type, media.media);

      const usesFrontTts =
        (type === CARD_TYPES.LISTENING && listeningModes.front === LISTENING_INPUT_MODES.TTS) ||
        (type === CARD_TYPES.VOCABULARY &&
          vocabularyFrontMode === VOCABULARY_FRONT_MODES.AUDIO &&
          listeningModes.front === LISTENING_INPUT_MODES.TTS) ||
        (type === CARD_TYPES.TYPING && typingFrontMode === TYPING_FRONT_MODES.TTS);

      const usesBackTts =
        type === CARD_TYPES.PRONUNCIATION && listeningModes.back === LISTENING_INPUT_MODES.TTS;

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
    [listeningModes, media.media, tts, ttsLanguages, type, typingFrontMode, vocabularyFrontMode],
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

    const isCloze = type === CARD_TYPES.CLOZE;

    try {
      await updateCardMutation.mutateAsync({
        id: card.id,
        deckId: values.deckId,
        // Cloze: frente/verso são derivadas do conteúdo estruturado no serviço.
        frontText: isCloze ? undefined : values.frontText,
        backText: isCloze ? undefined : values.backText,
        cloze: isCloze ? clozeEditor.content : undefined,
        notes: values.notes,
        tags: values.tags,
        media: submitMedia,
      });
      onSaved();
    } catch (error) {
      if (isUpdateCardInputError(error)) {
        applyFieldErrors(setError, localizeCardFieldErrors(error.fieldErrors, strings.cards));
        return;
      }
      setFormError(strings.cards.updateError);
    }
  });

  const handleDelete = useCallback(async () => {
    setFormError(null);
    try {
      await deleteCardMutation.mutateAsync(card.id);
      onDeleted();
    } catch {
      setFormError(strings.cards.deleteError);
    }
  }, [card.id, deleteCardMutation, onDeleted, strings.cards.deleteError]);

  const testReview = useCardTestReview({
    type,
    frontText,
    backText,
    cloze: clozeEditor.content,
    frontMedia,
    backMedia,
    reviewStrings: strings.review,
    onPlayAudio: recording.playAudio,
    onSpeakTts: (side: MediaSide, speed: TtsPlaybackSpeed) => {
      void speakTts(side, speed);
    },
  });

  return {
    type,
    collectionId,
    selectedTypeLabel: selectedTypeConfig.label,
    deckOptions,
    selectedDeckId,
    decksLoading: decksQuery.isLoading,
    errors,
    formError,
    successMessage,
    isSaving,
    isDeleting,
    isRecording,
    isSaveDisabled,
    frontText,
    backText,
    cloze: clozeEditor,
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
    onDeckChange: handleDeckChange,
    onVocabularyFrontModeChange: handleVocabularyFrontModeChange,
    onTypingFrontModeChange: handleTypingFrontModeChange,
    onSubmit,
    onDelete: handleDelete,
    onChangeText: handleChangeText,
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
    onSpeakTts: (side: MediaSide, speed: TtsPlaybackSpeed) => {
      void speakTts(side, speed);
    },
    onTtsLanguageChange: handleTtsLanguageChange,
    onListeningModeChange: handleListeningModeChange,
    onTestListeningAudio: (side: MediaSide, speed?: TtsPlaybackSpeed) => {
      void testListeningAudio(side, speed);
    },
    onToggleOptional: () => setShowOptionalFields((current) => !current),
    onChangeTags: (names: string[]) => setValue('tags', names, { shouldDirty: true }),
    onChangeNotes: (value: string) => setValue('notes', value, { shouldDirty: true }),
  };
}
