import { Alert, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectField } from '@/components/forms/SelectField';
import { FlashcardReview } from '@/components/review';
import type { CardAggregate } from '@/domain/repositories/CardRepository';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

import { CardTypeFields } from '../components/CardTypeFields';
import { OptionalCardFields } from '../components/OptionalCardFields';
import { useCardAggregate } from '../hooks/useCardAggregate';
import { useEditCardForm } from '../hooks/useEditCardForm';

export function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors } = useTheme();

  const aggregateQuery = useCardAggregate(id);

  const renderBody = () => {
    if (aggregateQuery.isLoading) {
      return (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.common.loading}
        </Text>
      );
    }

    if (aggregateQuery.error) {
      return (
        <StateCard
          title={strings.cards.loadError}
          action={{
            label: strings.common.retry,
            accessibilityLabel: strings.cards.loadRetryA11y,
            variant: 'secondary',
            onPress: () => {
              void aggregateQuery.refetch();
            },
          }}
        />
      );
    }

    if (!aggregateQuery.data) {
      return <StateCard title={strings.cards.notFound} />;
    }

    return <CardDetailForm aggregate={aggregateQuery.data} />;
  };

  return (
    <FormScreen>
      <Header variant="page" title={strings.cards.detailTitle} onBack={goBack} />
      {renderBody()}
    </FormScreen>
  );
}

function CardDetailForm({ aggregate }: { aggregate: CardAggregate }) {
  const router = useRouter();
  const strings = useStrings();
  const { colors, shadows } = useTheme();

  const form = useEditCardForm({
    aggregate,
    onSaved: () => router.back(),
    onDeleted: () => router.back(),
  });

  const confirmDelete = () => {
    Alert.alert(
      strings.cards.deleteConfirmTitle,
      strings.cards.deleteConfirmMessage,
      [
        { text: strings.cards.deleteConfirmCancel, style: 'cancel' },
        {
          text: strings.cards.deleteConfirmConfirm,
          style: 'destructive',
          onPress: () => {
            void form.onDelete();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      <View
        style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
        className="flex-row items-center gap-3 rounded-2xl border p-4"
      >
        <View
          style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
          className="h-11 w-11 items-center justify-center rounded-2xl"
        >
          <Icon name="card" size={22} tone="primary" />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
            {strings.cards.typeLabel}
          </Text>
          <Text
            style={{ color: colors.textPrimary }}
            className="text-base font-bold"
            numberOfLines={1}
          >
            {form.selectedTypeLabel}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            {strings.cards.typeLockedHint}
          </Text>
        </View>
      </View>

      <SelectField
        label={strings.cards.deckLabel}
        value={form.selectedDeckId}
        placeholder={form.decksLoading ? strings.cards.loadingDecks : strings.cards.deckPlaceholder}
        disabled={form.isSaveDisabled || form.decksLoading}
        options={form.deckOptions}
        error={form.errors.deckId?.message}
        onChange={form.onDeckChange}
      />

      <CardTypeFields
        type={form.type}
        frontText={form.frontText}
        backText={form.backText}
        cloze={form.cloze}
        frontMedia={form.frontMedia}
        backMedia={form.backMedia}
        errors={{
          frontText: form.errors.frontText?.message,
          frontMedia: form.errors.frontMedia?.message,
          backText: form.errors.backText?.message,
          backMedia: form.errors.backMedia?.message,
        }}
        isSaving={form.isSaving}
        isRecording={form.isRecording}
        recordingSide={form.recordingSide}
        recordingDurationMs={form.recordingDurationMs}
        ttsLanguages={form.ttsLanguages}
        listeningModes={form.listeningModes}
        vocabularyFrontMode={form.vocabularyFrontMode}
        typingFrontMode={form.typingFrontMode}
        onChangeText={form.onChangeText}
        onListeningModeChange={form.onListeningModeChange}
        onVocabularyFrontModeChange={form.onVocabularyFrontModeChange}
        onTypingFrontModeChange={form.onTypingFrontModeChange}
        onTestListeningAudio={form.onTestListeningAudio}
        onChangeCloze={form.onChangeCloze}
        onPickImage={form.onPickImage}
        onPickAudio={form.onPickAudio}
        onStartRecording={form.onStartRecording}
        onStopRecording={form.onStopRecording}
        onRemoveMedia={form.onRemoveMedia}
        onPlayAudio={form.onPlayAudio}
        onToggleTts={form.onToggleTts}
        onSpeakTts={form.onSpeakTts}
        onTtsLanguageChange={form.onTtsLanguageChange}
      />

      <OptionalCardFields
        collectionId={form.collectionId ?? ''}
        tags={form.tags}
        notes={form.notes}
        disabled={form.isSaving}
        tagsError={form.errors.tags?.message}
        notesError={form.errors.notes?.message}
        onChangeTags={form.onChangeTags}
        onChangeNotes={form.onChangeNotes}
      />

      {form.formError ? (
        <Text style={{ color: colors.danger }} className="text-sm font-medium">
          {form.formError}
        </Text>
      ) : null}

      <View className="flex-row gap-2">
        <SecondaryButton
          label={strings.cards.testLabel}
          accessibilityLabel={strings.cards.testA11y}
          disabled={form.isSaving || form.isRecording}
          icon="review"
          compact
          className="flex-1"
          onPress={form.testReview.open}
        />

        <SecondaryButton
          label={form.isDeleting ? strings.common.saving : strings.cards.deleteLabel}
          accessibilityLabel={strings.cards.deleteA11y}
          disabled={form.isSaving || form.isDeleting || form.isRecording}
          icon="delete"
          tone="danger"
          compact
          className="flex-1"
          onPress={confirmDelete}
        />

        <PrimaryButton
          label={form.isSaving ? strings.common.saving : strings.cards.saveEditLabel}
          accessibilityLabel={strings.cards.saveEditA11y}
          disabled={form.isSaveDisabled}
          icon="done"
          compact
          className="flex-1"
          onPress={form.onSubmit}
        />
      </View>

      {form.testReview.isOpen && form.testReview.viewModel ? (
        <FlashcardReview
          visible
          card={form.testReview.viewModel}
          strings={strings.review}
          onRate={form.testReview.handleRate}
          onClose={form.testReview.close}
        />
      ) : null}
    </>
  );
}
