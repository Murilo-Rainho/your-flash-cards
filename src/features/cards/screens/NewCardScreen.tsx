import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type AudioPlayer,
} from 'expo-audio';

import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import { ROUTES } from '@/constants/routes';
import type { Collection } from '@/domain/entities/Collection';
import type { Deck } from '@/domain/entities/Deck';
import { MEDIA_SIDES, MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';
import { useActiveCollections } from '@/features/collections/hooks/useActiveCollections';
import { useActiveDecks } from '@/features/decks/hooks/useActiveDecks';
import { getExpoSpeechTtsProvider } from '@/infrastructure/tts/ExpoSpeechTtsProvider';
import { colors, shadows } from '@/theme';

import { useCreateCard } from '../hooks/useCreateCard';
import {
  isCreateCardInputError,
  type CreateCardField,
  type CreateCardInput,
  type CreateCardMediaInput,
} from '../services/createCard';

const MAX_RECORDING_MS = 30_000;

type CardFormValues = {
  collectionId: string;
  deckId: string;
  type: CardType;
  frontText: string;
  backText: string;
  frontMedia: string;
  backMedia: string;
  notes: string;
  tags: string;
};

type Step = 'setup' | 'content';

type SelectOption = {
  value: string;
  label: string;
  description?: string;
  badge?: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

type FieldErrorProps = {
  message?: string;
};

type TextAreaFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  minHeight?: number;
  onChangeText: (value: string) => void;
};

type MediaControlsProps = {
  label: string;
  media: CreateCardMediaInput[];
  textForTts: string;
  ttsLanguage: string;
  isSaving: boolean;
  isRecording: boolean;
  isRecordingThisSide: boolean;
  recordingDurationMs: number;
  allowImage?: boolean;
  allowAudioFile?: boolean;
  allowRecording?: boolean;
  allowTts?: boolean;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onPickAudio: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRemoveMedia: (type: CreateCardMediaInput['type']) => void;
  onPlayAudio: (uri: string) => void;
  onToggleTts: () => void;
  onSpeakTts: () => void;
  onTtsLanguageChange: (language: string) => void;
};

const defaultValues: CardFormValues = {
  collectionId: '',
  deckId: '',
  type: CARD_TYPES.CLOZE,
  frontText: '',
  backText: '',
  frontMedia: '',
  backMedia: '',
  notes: '',
  tags: '',
};

const emptyCollections: Collection[] = [];
const emptyDecks: Deck[] = [];

const cardTypeOptions: Array<{
  type: CardType;
  label: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    type: CARD_TYPES.CLOZE,
    label: 'Preencher lacuna',
    description: 'Frase com lacuna manual',
    recommended: true,
  },
  {
    type: CARD_TYPES.VOCABULARY,
    label: 'Vocabulario',
    description: 'Frente e verso simples',
  },
  {
    type: CARD_TYPES.LISTENING,
    label: 'Escuta',
    description: 'Audio na frente',
  },
  {
    type: CARD_TYPES.TYPING,
    label: 'Escrita',
    description: 'Resposta digitada',
  },
  {
    type: CARD_TYPES.PRONUNCIATION,
    label: 'Pronuncia',
    description: 'Audio e TTS local',
  },
];

const languageToSpeechCode: Record<LanguageCode, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  ja: 'ja-JP',
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <Text className="text-sm text-danger">{message}</Text>;
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  disabled = false,
  error,
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`rounded-xl border border-border bg-surface px-4 py-3 active:bg-background ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-base font-semibold text-textPrimary">
          {selectedOption?.label ?? placeholder}
        </Text>
        {selectedOption?.description ? (
          <Text className="mt-1 text-sm text-textSecondary">{selectedOption.description}</Text>
        ) : null}
      </Pressable>
      <FieldError message={error} />

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Fechar ${label}`}
          onPress={() => setOpen(false)}
          className="flex-1 justify-end bg-textPrimary/40 p-4"
        >
          <View style={shadows.lg} className="rounded-xl bg-background p-2">
            <Text className="px-3 py-2 text-base font-bold text-textPrimary">{label}</Text>
            <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`rounded-xl p-3 active:bg-surface ${
                      selected ? 'bg-surface' : 'bg-background'
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="flex-1 text-base font-semibold text-textPrimary">
                        {option.label}
                      </Text>
                      {option.badge ? (
                        <View className="rounded-lg bg-secondary px-2 py-1">
                          <Text className="text-xs font-bold text-background">{option.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    {option.description ? (
                      <Text className="mt-1 text-sm text-textSecondary">{option.description}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  error,
  disabled = false,
  minHeight = 112,
  onChangeText,
}: TextAreaFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-textPrimary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        editable={!disabled}
        multiline
        textAlignVertical="top"
        style={{ minHeight }}
        className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
      />
      <FieldError message={error} />
    </View>
  );
}

function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toSpeechLanguage(code: string | undefined): string {
  return languageToSpeechCode[code as LanguageCode] ?? 'en-US';
}

function formatRecordingDuration(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function mediaGroup(type: CreateCardMediaInput['type']): 'image' | 'audio' {
  return type === MEDIA_TYPES.IMAGE ? 'image' : 'audio';
}

function getMediaLabel(item: CreateCardMediaInput): string {
  if (item.type === MEDIA_TYPES.TTS) {
    return `TTS ${item.language}`;
  }

  return item.fileName ?? item.uri.split('/').pop() ?? item.type;
}

function isFrontAudioForPronunciation(item: CreateCardMediaInput): boolean {
  return (
    item.side === MEDIA_SIDES.FRONT &&
    (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING)
  );
}

function sanitizeMediaForType(
  type: CardType,
  media: readonly CreateCardMediaInput[],
): CreateCardMediaInput[] {
  if (type === CARD_TYPES.CLOZE) {
    return [];
  }

  if (type === CARD_TYPES.LISTENING || type === CARD_TYPES.TYPING) {
    return media.filter(
      (item) => item.side === MEDIA_SIDES.FRONT && item.type !== MEDIA_TYPES.IMAGE,
    );
  }

  if (type === CARD_TYPES.PRONUNCIATION) {
    return media.filter(
      (item) =>
        isFrontAudioForPronunciation(item) ||
        (item.side === MEDIA_SIDES.BACK && item.type === MEDIA_TYPES.TTS),
    );
  }

  return [...media];
}

function MediaControls({
  label,
  media,
  textForTts,
  ttsLanguage,
  isSaving,
  isRecording,
  isRecordingThisSide,
  recordingDurationMs,
  allowImage = false,
  allowAudioFile = false,
  allowRecording = false,
  allowTts = false,
  onPickImage,
  onTakePhoto,
  onPickAudio,
  onStartRecording,
  onStopRecording,
  onRemoveMedia,
  onPlayAudio,
  onToggleTts,
  onSpeakTts,
  onTtsLanguageChange,
}: MediaControlsProps) {
  const imageMedia = media.find((item) => item.type === MEDIA_TYPES.IMAGE);
  const audioMedia = media.find((item) => item.type !== MEDIA_TYPES.IMAGE);
  const canShowAudioBlock = allowAudioFile || allowRecording || allowTts || audioMedia;

  if (!allowImage && !canShowAudioBlock) {
    return null;
  }

  return (
    <View className="gap-4">
      {allowImage ? (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-textPrimary">Imagem</Text>
          {imageMedia?.type === MEDIA_TYPES.IMAGE ? (
            <View className="gap-2">
              <Image
                source={{ uri: imageMedia.uri }}
                className="h-36 w-full rounded-xl bg-surface"
                resizeMode="cover"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover imagem de ${label}`}
                disabled={isSaving}
                onPress={() => onRemoveMedia(MEDIA_TYPES.IMAGE)}
                className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
              >
                <Text className="text-sm font-semibold text-textPrimary">Remover imagem</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Escolher imagem de ${label}`}
                disabled={isSaving}
                onPress={onPickImage}
                className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
              >
                <Text className="text-sm font-semibold text-textPrimary">Galeria</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Tirar foto de ${label}`}
                disabled={isSaving}
                onPress={onTakePhoto}
                className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
              >
                <Text className="text-sm font-semibold text-textPrimary">Camera</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : null}

      {canShowAudioBlock ? (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-textPrimary">Audio</Text>
          {audioMedia ? (
            <View className="gap-2 rounded-xl border border-border bg-surface p-3">
              <Text className="text-sm text-textSecondary" numberOfLines={1}>
                {getMediaLabel(audioMedia)}
              </Text>
              <View className="flex-row gap-2">
                {audioMedia.type === MEDIA_TYPES.AUDIO ||
                audioMedia.type === MEDIA_TYPES.RECORDING ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Tocar audio de ${label}`}
                    disabled={isSaving}
                    onPress={() => onPlayAudio(audioMedia.uri)}
                    className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
                  >
                    <Text className="text-sm font-semibold text-textPrimary">Tocar</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ouvir TTS de ${label}`}
                    disabled={isSaving}
                    onPress={onSpeakTts}
                    className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
                  >
                    <Text className="text-sm font-semibold text-textPrimary">Ouvir</Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover audio de ${label}`}
                  disabled={isSaving}
                  onPress={() => onRemoveMedia(audioMedia.type)}
                  className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
                >
                  <Text className="text-sm font-semibold text-textPrimary">Remover</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="gap-2">
              <View className="flex-row gap-2">
                {allowAudioFile ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Anexar audio de ${label}`}
                    disabled={isSaving || isRecording}
                    onPress={onPickAudio}
                    className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
                  >
                    <Text className="text-sm font-semibold text-textPrimary">Arquivo</Text>
                  </Pressable>
                ) : null}
                {allowRecording ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isRecordingThisSide ? `Parar gravacao de ${label}` : `Gravar ${label}`
                    }
                    disabled={isSaving || (isRecording && !isRecordingThisSide)}
                    onPress={isRecordingThisSide ? onStopRecording : onStartRecording}
                    className="flex-1 items-center rounded-xl border border-border bg-background px-3 py-3 active:bg-surface"
                  >
                    <Text className="text-sm font-semibold text-textPrimary">
                      {isRecordingThisSide
                        ? `Parar ${formatRecordingDuration(recordingDurationMs)}`
                        : 'Gravar'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {allowTts ? (
                <View className="gap-2">
                  <SelectField
                    label="Idioma TTS"
                    value={ttsLanguage}
                    placeholder="Escolha o idioma"
                    disabled={isSaving}
                    options={LANGUAGES.map((language) => ({
                      value: toSpeechLanguage(language.code),
                      label: language.label,
                    }))}
                    onChange={onTtsLanguageChange}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Usar TTS local em ${label}`}
                    disabled={isSaving || !textForTts.trim()}
                    onPress={onToggleTts}
                    className={`items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface ${
                      !textForTts.trim() ? 'opacity-50' : ''
                    }`}
                  >
                    <Text className="text-sm font-semibold text-textPrimary">Usar TTS local</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

export function NewCardScreen() {
  const router = useRouter();
  const createCardMutation = useCreateCard();
  const activeCollectionsQuery = useActiveCollections();
  const [step, setStep] = useState<Step>('setup');
  const [media, setMedia] = useState<CreateCardMediaInput[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recordingSide, setRecordingSide] = useState<MediaSide | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [ttsLanguages, setTtsLanguages] = useState<Record<MediaSide, string>>({
    front: 'en-US',
    back: 'pt-BR',
  });
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const recordingSideRef = useRef<MediaSide | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const ttsProvider = useMemo(() => getExpoSpeechTtsProvider(), []);
  const {
    control,
    clearErrors,
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
  const backText = watch('backText');
  const activeDecksQuery = useActiveDecks(selectedCollectionId || undefined);
  const decks = activeDecksQuery.data ?? emptyDecks;
  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId,
  );
  const selectedDeck = decks.find((deck) => deck.id === selectedDeckId);
  const selectedTypeOption = cardTypeOptions.find((option) => option.type === selectedType);
  const isSaving = createCardMutation.isPending;
  const isRecording = Boolean(recordingSide);
  const isSetupLoading = activeCollectionsQuery.isLoading || activeDecksQuery.isLoading;
  const canGoNext =
    Boolean(selectedCollectionId) &&
    Boolean(selectedDeckId) &&
    Boolean(selectedType) &&
    !isSetupLoading &&
    collections.length > 0 &&
    decks.length > 0;
  const isSaveDisabled = isSaving || isRecording || !canGoNext;
  const frontMedia = media.filter((item) => item.side === MEDIA_SIDES.FRONT);
  const backMedia = media.filter((item) => item.side === MEDIA_SIDES.BACK);
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
  const typeOptions = cardTypeOptions.map<SelectOption>((option) => ({
    value: option.type,
    label: option.label,
    description: option.description,
    badge: option.recommended ? 'Recomendado' : undefined,
  }));

  const clearRecordingTimeout = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  const clearCardContent = () => {
    setMedia([]);
    setShowOptionalFields(false);
    clearErrors(['frontText', 'backText', 'frontMedia', 'backMedia', 'tags', 'notes']);
    setValue('frontText', '', { shouldDirty: false, shouldValidate: false });
    setValue('backText', '', { shouldDirty: false, shouldValidate: false });
    setValue('tags', '', { shouldDirty: false, shouldValidate: false });
    setValue('notes', '', { shouldDirty: false, shouldValidate: false });
  };

  useEffect(() => {
    return () => {
      audioPlayerRef.current?.remove();
      clearRecordingTimeout();
    };
  }, []);

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

  const handleBack = () => {
    if (step === 'content') {
      setStep('setup');
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.HOME);
  };

  const handleCollectionChange = (collectionId: string) => {
    setValue('collectionId', collectionId, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue('deckId', '', {
      shouldDirty: true,
      shouldValidate: false,
    });
    clearCardContent();
    setSuccessMessage(null);
    setFormError(null);
  };

  const handleDeckChange = (deckId: string) => {
    setValue('deckId', deckId, {
      shouldDirty: true,
      shouldValidate: false,
    });
    clearCardContent();
    setSuccessMessage(null);
    setFormError(null);
  };

  const handleTypeChange = (type: string) => {
    if (!Object.values(CARD_TYPES).includes(type as CardType)) {
      return;
    }

    const nextType = type as CardType;
    setValue('type', nextType, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setMedia((current) => sanitizeMediaForType(nextType, current));
    setSuccessMessage(null);
    setFormError(null);
  };

  const setSideMedia = (nextMedia: CreateCardMediaInput) => {
    setMedia((current) =>
      sanitizeMediaForType(selectedType, [
        ...current.filter(
          (item) =>
            item.side !== nextMedia.side || mediaGroup(item.type) !== mediaGroup(nextMedia.type),
        ),
        nextMedia,
      ]),
    );
    setSuccessMessage(null);
  };

  const removeSideMedia = (side: MediaSide, type: CreateCardMediaInput['type']) => {
    setMedia((current) =>
      current.filter((item) => item.side !== side || mediaGroup(item.type) !== mediaGroup(type)),
    );
  };

  const pickImage = async (side: MediaSide, source: 'library' | 'camera') => {
    setFormError(null);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setFormError('Permissao de imagem negada.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.9,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.9,
          });

    const asset = result.canceled ? null : result.assets[0];

    if (!asset) {
      return;
    }

    setSideMedia({
      side,
      type: MEDIA_TYPES.IMAGE,
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      fileName: asset.fileName ?? undefined,
    });
  };

  const pickAudio = async (side: MediaSide) => {
    setFormError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
      multiple: false,
      base64: false,
    });
    const asset = result.canceled ? null : result.assets[0];

    if (!asset) {
      return;
    }

    setSideMedia({
      side,
      type: MEDIA_TYPES.AUDIO,
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'audio/mpeg',
      fileName: asset.name,
    });
  };

  const stopRecordingForSide = async (side: MediaSide) => {
    if (recordingSideRef.current !== side) {
      return;
    }

    clearRecordingTimeout();
    await audioRecorder.stop();
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });
    recordingSideRef.current = null;
    setRecordingSide(null);

    if (!audioRecorder.uri) {
      setFormError('Nao foi possivel salvar a gravacao local.');
      return;
    }

    setSideMedia({
      side,
      type: MEDIA_TYPES.RECORDING,
      uri: audioRecorder.uri,
      mimeType: 'audio/m4a',
      fileName: `gravacao-${side}.m4a`,
    });
  };

  const startRecording = async (side: MediaSide) => {
    setFormError(null);
    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      setFormError('Permissao de microfone negada.');
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    recordingSideRef.current = side;
    setRecordingSide(side);
    clearRecordingTimeout();
    recordingTimeoutRef.current = setTimeout(() => {
      void stopRecordingForSide(side);
    }, MAX_RECORDING_MS);
  };

  const stopRecording = async () => {
    const side = recordingSideRef.current;

    if (side) {
      await stopRecordingForSide(side);
    }
  };

  const playAudio = (uri: string) => {
    audioPlayerRef.current?.remove();
    const player = createAudioPlayer(uri);
    audioPlayerRef.current = player;
    player.seekTo(0);
    player.play();
  };

  const toggleTts = async (side: MediaSide) => {
    setFormError(null);
    const currentText = side === MEDIA_SIDES.FRONT ? frontText : backText;
    const language = ttsLanguages[side];

    if (!currentText.trim()) {
      setError(side === MEDIA_SIDES.FRONT ? 'frontText' : 'backText', {
        message: 'Informe texto para usar TTS local.',
      });
      return;
    }

    if (!(await ttsProvider.isAvailable({ language }))) {
      setFormError('TTS local indisponivel para este idioma neste dispositivo.');
      return;
    }

    setSideMedia({
      side,
      type: MEDIA_TYPES.TTS,
      language,
    });
  };

  const speakTts = async (side: MediaSide) => {
    setFormError(null);
    const text = side === MEDIA_SIDES.FRONT ? frontText : backText;

    try {
      await ttsProvider.speak({
        text,
        language: ttsLanguages[side],
      });
    } catch {
      setFormError('Nao foi possivel reproduzir TTS local para este idioma.');
    }
  };

  const buildMediaForSubmit = async (values: CardFormValues): Promise<CreateCardMediaInput[]> => {
    let nextMedia = sanitizeMediaForType(values.type, media);

    if (values.type === CARD_TYPES.PRONUNCIATION && values.backText.trim()) {
      const language = ttsLanguages.back;

      if (!(await ttsProvider.isAvailable({ language }))) {
        throw new Error('TTS_UNAVAILABLE');
      }

      nextMedia = [
        ...nextMedia.filter(
          (item) => !(item.side === MEDIA_SIDES.BACK && item.type === MEDIA_TYPES.TTS),
        ),
        {
          side: MEDIA_SIDES.BACK,
          type: MEDIA_TYPES.TTS,
          language,
        },
      ];
    }

    return nextMedia;
  };

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

    const input: CreateCardInput = {
      collectionId: values.collectionId,
      deckId: values.deckId,
      type: values.type,
      frontText: values.type === CARD_TYPES.PRONUNCIATION ? '' : values.frontText,
      backText: values.backText,
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
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as CreateCardField, { message });
          }
        });
        return;
      }

      setFormError('Nao foi possivel criar o card local.');
    }
  });

  const renderOptionalFields = () => (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Campos opcionais"
        accessibilityState={{ expanded: showOptionalFields }}
        disabled={isSaving}
        onPress={() => setShowOptionalFields((current) => !current)}
        className="rounded-xl border border-border bg-surface px-4 py-3 active:bg-background"
      >
        <Text className="text-base font-semibold text-textPrimary">
          {showOptionalFields ? 'Ocultar opcionais' : 'Tags e observacoes'}
        </Text>
      </Pressable>

      {showOptionalFields ? (
        <>
          <View className="gap-2">
            <Text className="text-sm font-semibold text-textPrimary">Tags</Text>
            <Controller
              control={control}
              name="tags"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="travel, listening"
                  placeholderTextColor={colors.textSecondary}
                  editable={!isSaving}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-base text-textPrimary"
                />
              )}
            />
            <FieldError message={errors.tags?.message} />
          </View>

          <TextAreaField
            label="Observacoes"
            value={watch('notes')}
            placeholder="Opcional"
            error={errors.notes?.message}
            disabled={isSaving}
            minHeight={96}
            onChangeText={(value) => setValue('notes', value, { shouldDirty: true })}
          />
        </>
      ) : null}
    </View>
  );

  const renderVocabularyFields = () => (
    <>
      <TextAreaField
        label="Frente"
        value={frontText}
        placeholder="apple"
        error={errors.frontText?.message ?? errors.frontMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('frontText', value, { shouldDirty: true })}
      />
      <MediaControls
        label="Frente"
        media={frontMedia}
        textForTts={frontText}
        ttsLanguage={ttsLanguages.front}
        isSaving={isSaving}
        isRecording={isRecording}
        isRecordingThisSide={recordingSide === MEDIA_SIDES.FRONT}
        recordingDurationMs={recorderState.durationMillis}
        allowImage
        allowAudioFile
        allowRecording
        allowTts
        onPickImage={() => {
          void pickImage(MEDIA_SIDES.FRONT, 'library');
        }}
        onTakePhoto={() => {
          void pickImage(MEDIA_SIDES.FRONT, 'camera');
        }}
        onPickAudio={() => {
          void pickAudio(MEDIA_SIDES.FRONT);
        }}
        onStartRecording={() => {
          void startRecording(MEDIA_SIDES.FRONT);
        }}
        onStopRecording={() => {
          void stopRecording();
        }}
        onRemoveMedia={(type) => removeSideMedia(MEDIA_SIDES.FRONT, type)}
        onPlayAudio={playAudio}
        onToggleTts={() => {
          void toggleTts(MEDIA_SIDES.FRONT);
        }}
        onSpeakTts={() => {
          void speakTts(MEDIA_SIDES.FRONT);
        }}
        onTtsLanguageChange={(language) =>
          setTtsLanguages((current) => ({ ...current, front: language }))
        }
      />

      <TextAreaField
        label="Verso"
        value={backText}
        placeholder="maca"
        error={errors.backText?.message ?? errors.backMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('backText', value, { shouldDirty: true })}
      />
      <MediaControls
        label="Verso"
        media={backMedia}
        textForTts={backText}
        ttsLanguage={ttsLanguages.back}
        isSaving={isSaving}
        isRecording={isRecording}
        isRecordingThisSide={recordingSide === MEDIA_SIDES.BACK}
        recordingDurationMs={recorderState.durationMillis}
        allowImage
        allowAudioFile
        allowRecording
        allowTts
        onPickImage={() => {
          void pickImage(MEDIA_SIDES.BACK, 'library');
        }}
        onTakePhoto={() => {
          void pickImage(MEDIA_SIDES.BACK, 'camera');
        }}
        onPickAudio={() => {
          void pickAudio(MEDIA_SIDES.BACK);
        }}
        onStartRecording={() => {
          void startRecording(MEDIA_SIDES.BACK);
        }}
        onStopRecording={() => {
          void stopRecording();
        }}
        onRemoveMedia={(type) => removeSideMedia(MEDIA_SIDES.BACK, type)}
        onPlayAudio={playAudio}
        onToggleTts={() => {
          void toggleTts(MEDIA_SIDES.BACK);
        }}
        onSpeakTts={() => {
          void speakTts(MEDIA_SIDES.BACK);
        }}
        onTtsLanguageChange={(language) =>
          setTtsLanguages((current) => ({ ...current, back: language }))
        }
      />
    </>
  );

  const renderClozeFields = () => (
    <>
      <TextAreaField
        label="Frente"
        value={frontText}
        placeholder="I'm {cansado} now"
        error={errors.frontText?.message ?? errors.frontMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('frontText', value, { shouldDirty: true })}
      />
      <TextAreaField
        label="Verso"
        value={backText}
        placeholder="I'm tired now"
        error={errors.backText?.message ?? errors.backMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('backText', value, { shouldDirty: true })}
      />
    </>
  );

  const renderListeningFields = () => (
    <>
      <TextAreaField
        label="Frente"
        value={frontText}
        placeholder="Texto para TTS"
        error={errors.frontText?.message ?? errors.frontMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('frontText', value, { shouldDirty: true })}
      />
      <MediaControls
        label="Frente"
        media={frontMedia}
        textForTts={frontText}
        ttsLanguage={ttsLanguages.front}
        isSaving={isSaving}
        isRecording={isRecording}
        isRecordingThisSide={recordingSide === MEDIA_SIDES.FRONT}
        recordingDurationMs={recorderState.durationMillis}
        allowAudioFile
        allowRecording
        allowTts
        onPickImage={() => {}}
        onTakePhoto={() => {}}
        onPickAudio={() => {
          void pickAudio(MEDIA_SIDES.FRONT);
        }}
        onStartRecording={() => {
          void startRecording(MEDIA_SIDES.FRONT);
        }}
        onStopRecording={() => {
          void stopRecording();
        }}
        onRemoveMedia={(type) => removeSideMedia(MEDIA_SIDES.FRONT, type)}
        onPlayAudio={playAudio}
        onToggleTts={() => {
          void toggleTts(MEDIA_SIDES.FRONT);
        }}
        onSpeakTts={() => {
          void speakTts(MEDIA_SIDES.FRONT);
        }}
        onTtsLanguageChange={(language) =>
          setTtsLanguages((current) => ({ ...current, front: language }))
        }
      />
      <TextAreaField
        label="Verso"
        value={backText}
        placeholder="Significado ou resposta"
        error={errors.backText?.message ?? errors.backMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('backText', value, { shouldDirty: true })}
      />
    </>
  );

  const renderTypingFields = () => (
    <>
      <TextAreaField
        label="Frente"
        value={frontText}
        placeholder="Estou cansado agora."
        error={errors.frontText?.message ?? errors.frontMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('frontText', value, { shouldDirty: true })}
      />
      <MediaControls
        label="Frente"
        media={frontMedia}
        textForTts={frontText}
        ttsLanguage={ttsLanguages.front}
        isSaving={isSaving}
        isRecording={isRecording}
        isRecordingThisSide={recordingSide === MEDIA_SIDES.FRONT}
        recordingDurationMs={recorderState.durationMillis}
        allowAudioFile
        allowRecording
        allowTts
        onPickImage={() => {}}
        onTakePhoto={() => {}}
        onPickAudio={() => {
          void pickAudio(MEDIA_SIDES.FRONT);
        }}
        onStartRecording={() => {
          void startRecording(MEDIA_SIDES.FRONT);
        }}
        onStopRecording={() => {
          void stopRecording();
        }}
        onRemoveMedia={(type) => removeSideMedia(MEDIA_SIDES.FRONT, type)}
        onPlayAudio={playAudio}
        onToggleTts={() => {
          void toggleTts(MEDIA_SIDES.FRONT);
        }}
        onSpeakTts={() => {
          void speakTts(MEDIA_SIDES.FRONT);
        }}
        onTtsLanguageChange={(language) =>
          setTtsLanguages((current) => ({ ...current, front: language }))
        }
      />
      <TextAreaField
        label="Verso"
        value={backText}
        placeholder="I'm tired now."
        error={errors.backText?.message ?? errors.backMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('backText', value, { shouldDirty: true })}
      />
    </>
  );

  const renderPronunciationFields = () => (
    <>
      <View className="gap-2">
        <Text className="text-sm font-semibold text-textPrimary">Frente</Text>
        <MediaControls
          label="Frente"
          media={frontMedia}
          textForTts=""
          ttsLanguage={ttsLanguages.front}
          isSaving={isSaving}
          isRecording={isRecording}
          isRecordingThisSide={recordingSide === MEDIA_SIDES.FRONT}
          recordingDurationMs={recorderState.durationMillis}
          allowAudioFile
          allowRecording
          onPickImage={() => {}}
          onTakePhoto={() => {}}
          onPickAudio={() => {
            void pickAudio(MEDIA_SIDES.FRONT);
          }}
          onStartRecording={() => {
            void startRecording(MEDIA_SIDES.FRONT);
          }}
          onStopRecording={() => {
            void stopRecording();
          }}
          onRemoveMedia={(type) => removeSideMedia(MEDIA_SIDES.FRONT, type)}
          onPlayAudio={playAudio}
          onToggleTts={() => {}}
          onSpeakTts={() => {}}
          onTtsLanguageChange={() => {}}
        />
        <FieldError message={errors.frontText?.message ?? errors.frontMedia?.message} />
      </View>
      <TextAreaField
        label="Verso"
        value={backText}
        placeholder="I'm tired now"
        error={errors.backText?.message ?? errors.backMedia?.message}
        disabled={isSaving}
        onChangeText={(value) => setValue('backText', value, { shouldDirty: true })}
      />
      <View className="gap-2">
        <SelectField
          label="Idioma TTS"
          value={ttsLanguages.back}
          placeholder="Escolha o idioma"
          disabled={isSaving}
          options={LANGUAGES.map((language) => ({
            value: toSpeechLanguage(language.code),
            label: language.label,
          }))}
          onChange={(language) => setTtsLanguages((current) => ({ ...current, back: language }))}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvir preview TTS"
          disabled={isSaving || !backText.trim()}
          onPress={() => {
            void speakTts(MEDIA_SIDES.BACK);
          }}
          className={`items-center rounded-xl border border-border bg-surface px-4 py-3 active:bg-background ${
            !backText.trim() ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-base font-semibold text-textPrimary">Ouvir TTS</Text>
        </Pressable>
      </View>
    </>
  );

  const renderContentFields = () => {
    if (selectedType === CARD_TYPES.VOCABULARY) {
      return renderVocabularyFields();
    }

    if (selectedType === CARD_TYPES.LISTENING) {
      return renderListeningFields();
    }

    if (selectedType === CARD_TYPES.TYPING) {
      return renderTypingFields();
    }

    if (selectedType === CARD_TYPES.PRONUNCIATION) {
      return renderPronunciationFields();
    }

    return renderClozeFields();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="gap-6 px-4 pb-10 pt-2">
            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={handleBack}
                className="rounded-xl border border-border px-4 py-3 active:bg-surface"
              >
                <Text className="text-base font-semibold text-textPrimary">Voltar</Text>
              </Pressable>
              <View className="flex-1 items-end">
                <Text className="text-2xl font-bold text-textPrimary">Novo Card</Text>
                <Text className="mt-1 text-sm text-textSecondary">
                  {step === 'setup' ? 'Etapa 1 de 2' : 'Etapa 2 de 2'}
                </Text>
              </View>
            </View>

            {activeCollectionsQuery.isLoading ? (
              <Text className="text-sm text-textSecondary">Carregando colecoes locais...</Text>
            ) : activeCollectionsQuery.error ? (
              <View className="gap-3 rounded-xl border border-border bg-surface p-4">
                <Text className="text-base font-semibold text-textPrimary">
                  Nao foi possivel carregar as colecoes
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tentar carregar colecoes novamente"
                  onPress={() => {
                    void activeCollectionsQuery.refetch();
                  }}
                  className="items-center rounded-xl border border-border bg-background px-4 py-3 active:bg-surface"
                >
                  <Text className="text-base font-semibold text-textPrimary">Tentar novamente</Text>
                </Pressable>
              </View>
            ) : collections.length === 0 ? (
              <View className="gap-3 rounded-xl border border-border bg-surface p-4">
                <Text className="text-base font-semibold text-textPrimary">
                  Nenhuma colecao criada ainda
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Criar colecao"
                  onPress={() => router.replace(ROUTES.COLLECTION_NEW)}
                  className="items-center rounded-xl bg-primary px-4 py-3 active:opacity-90"
                >
                  <Text className="text-base font-bold text-background">Criar colecao</Text>
                </Pressable>
              </View>
            ) : step === 'setup' ? (
              <>
                <SelectField
                  label="Colecao"
                  value={selectedCollectionId}
                  placeholder="Escolha uma colecao"
                  disabled={isSaving}
                  options={collectionOptions}
                  error={errors.collectionId?.message}
                  onChange={handleCollectionChange}
                />

                {selectedCollectionId && decks.length === 0 && !activeDecksQuery.isLoading ? (
                  <View className="gap-3 rounded-xl border border-border bg-surface p-4">
                    <Text className="text-base font-semibold text-textPrimary">
                      Nenhum deck nesta colecao
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Criar deck"
                      onPress={() => router.replace(ROUTES.DECK_NEW)}
                      className="items-center rounded-xl bg-primary px-4 py-3 active:opacity-90"
                    >
                      <Text className="text-base font-bold text-background">Criar deck</Text>
                    </Pressable>
                  </View>
                ) : (
                  <SelectField
                    label="Deck"
                    value={selectedDeckId}
                    placeholder={
                      activeDecksQuery.isLoading ? 'Carregando decks...' : 'Escolha um deck'
                    }
                    disabled={
                      !selectedCollectionId || activeDecksQuery.isLoading || decks.length === 0
                    }
                    options={deckOptions}
                    error={errors.deckId?.message}
                    onChange={handleDeckChange}
                  />
                )}

                <SelectField
                  label="Tipo"
                  value={selectedType}
                  placeholder="Escolha um tipo"
                  disabled={isSaving}
                  options={typeOptions}
                  error={errors.type?.message}
                  onChange={handleTypeChange}
                />

                {formError ? (
                  <Text className="text-sm font-medium text-danger">{formError}</Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Proximo"
                  accessibilityState={{ disabled: !canGoNext }}
                  disabled={!canGoNext}
                  onPress={() => {
                    clearErrors(['collectionId', 'deckId', 'type']);
                    setStep('content');
                  }}
                  className={`items-center rounded-xl bg-primary px-4 py-4 active:opacity-90 ${
                    !canGoNext ? 'opacity-50' : ''
                  }`}
                >
                  <Text className="text-base font-bold text-background">Proximo</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View className="gap-2 rounded-xl border border-border bg-surface p-4">
                  <Text className="text-sm font-semibold text-textPrimary">
                    {selectedCollection?.name}
                  </Text>
                  <Text className="text-sm text-textSecondary">
                    {selectedDeck?.name} - {selectedTypeOption?.label}
                  </Text>
                </View>

                {renderContentFields()}
                {renderOptionalFields()}

                {successMessage ? (
                  <Text className="text-sm font-semibold text-success">{successMessage}</Text>
                ) : null}

                {formError ? (
                  <Text className="text-sm font-medium text-danger">{formError}</Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Salvar card"
                  accessibilityState={{ disabled: isSaveDisabled }}
                  disabled={isSaveDisabled}
                  onPress={onSubmit}
                  className={`items-center rounded-xl bg-primary px-4 py-4 active:opacity-90 ${
                    isSaveDisabled ? 'opacity-50' : ''
                  }`}
                >
                  <Text className="text-base font-bold text-background">
                    {isSaving
                      ? 'Salvando...'
                      : isRecording
                        ? 'Pare a gravacao para salvar'
                        : 'Salvar card'}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
