import { Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectField } from '@/components/forms/SelectField';
import { FlashcardReview } from '@/components/review';
import { DeckSelectField } from '../components/DeckSelectField';
import { usePreferences } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

import { CardTypeFields } from '../components/CardTypeFields';
import { OptionalCardFields } from '../components/OptionalCardFields';
import { useNewCardForm } from '../hooks/useNewCardForm';

/**
 * Novo Card (§7–§12) — tela burra: orquestra `useNewCardForm` e compõe os componentes
 * compartilhados/da feature. Sem regra de negócio nem acesso a infra direto.
 */
export function NewCardScreen() {
  const form = useNewCardForm();
  const { setTtsPlaybackSpeed, strings, ttsPlaybackSpeed } = usePreferences();
  const { colors, shadows } = useTheme();

  const saveLabel = form.isSaving
    ? strings.cards.savingLabel
    : form.isRecording
      ? strings.cards.stopRecordingToSave
      : strings.cards.saveLabel;

  const renderBody = () => {
    if (form.collectionsLoading) {
      return (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.cards.loadingCollections}
        </Text>
      );
    }

    if (form.collectionsError) {
      return (
        <StateCard
          title={strings.cards.loadCollectionsError}
          action={{
            label: strings.common.retry,
            accessibilityLabel: strings.cards.loadCollectionsRetryA11y,
            variant: 'secondary',
            onPress: form.onRetryCollections,
          }}
        />
      );
    }

    if (form.collections.length === 0) {
      return (
        <StateCard
          title={strings.cards.noCollections}
          action={{
            label: strings.cards.createCollection,
            accessibilityLabel: strings.cards.createCollectionA11y,
            onPress: form.goToCreateCollection,
          }}
        />
      );
    }

    if (form.step === 'setup') {
      return (
        <>
          <SelectField
            label={strings.cards.collectionLabel}
            value={form.selectedCollectionId}
            placeholder={strings.cards.collectionPlaceholder}
            disabled={form.isSaving}
            options={form.collectionOptions}
            error={form.errors.collectionId?.message}
            onChange={form.onCollectionChange}
          />

          <DeckSelectField
            label={strings.cards.deckLabel}
            value={form.selectedDeckId}
            placeholder={
              form.decksLoading ? strings.cards.loadingDecks : strings.cards.deckPlaceholder
            }
            disabled={!form.selectedCollectionId || form.decksLoading || form.isSaving}
            options={form.deckOptions}
            collectionLabel={strings.decks.collectionLabel}
            collectionName={form.selectedCollectionName ?? ''}
            emptyHint={form.decksEmpty ? strings.cards.noDecksInCollection : undefined}
            error={form.errors.deckId?.message}
            onChange={form.onDeckChange}
            createDeckLabel={strings.cards.createDeck}
            createDeckA11y={strings.cards.createDeckA11y}
            nameLabel={strings.decks.nameLabel}
            namePlaceholder={strings.decks.namePlaceholder}
            descriptionLabel={strings.decks.descriptionLabel}
            descriptionPlaceholder={strings.decks.descriptionPlaceholder}
            saveDeckLabel={strings.decks.saveLabel}
            saveDeckA11y={strings.decks.saveA11y}
            backLabel={strings.common.back}
            backA11y={strings.common.back}
            isCreatingDeck={form.isCreatingDeck}
            createDeckErrors={form.deckCreateErrors}
            onCreateDeck={form.onCreateDeck}
            onCreateFormDismiss={form.onCreateDeckFormDismiss}
          />

          <SelectField
            label={strings.cards.typeLabel}
            value={form.selectedType}
            placeholder={strings.cards.typePlaceholder}
            disabled={form.isSaving}
            options={form.typeOptions}
            error={form.errors.type?.message}
            onChange={form.onTypeChange}
          />

          {form.formError ? (
            <Text style={{ color: colors.danger }} className="text-sm font-medium">
              {form.formError}
            </Text>
          ) : null}

          <PrimaryButton
            label={strings.common.next}
            accessibilityLabel={strings.common.next}
            disabled={!form.canGoNext}
            onPress={form.onNext}
          />
        </>
      );
    }

    return (
      <>
        <View
          style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
          className="gap-3 rounded-2xl border p-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
              className="h-11 w-11 items-center justify-center rounded-2xl"
            >
              <Icon name="card" size={22} tone="primary" />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text
                style={{ color: colors.textPrimary }}
                className="text-base font-bold"
                numberOfLines={1}
              >
                {form.selectedCollectionName}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm" numberOfLines={1}>
                {form.selectedDeckName}
              </Text>
            </View>
            <Badge label={form.selectedTypeLabel} tone="secondary" />
          </View>
        </View>

        <CardTypeFields
          type={form.selectedType}
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
          collectionId={form.selectedCollectionId}
          tags={form.tags}
          notes={form.notes}
          disabled={form.isSaving}
          tagsError={form.errors.tags?.message}
          notesError={form.errors.notes?.message}
          onChangeTags={form.onChangeTags}
          onChangeNotes={form.onChangeNotes}
        />

        {form.successMessage ? (
          <Text style={{ color: colors.success }} className="text-sm font-semibold">
            {form.successMessage}
          </Text>
        ) : null}

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

          <PrimaryButton
            label={saveLabel}
            accessibilityLabel={strings.cards.saveA11y}
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
            ttsPlaybackSpeed={ttsPlaybackSpeed}
            ttsSpeedLabels={{ fast: strings.common.fast, slow: strings.common.slow }}
            onRate={form.testReview.handleRate}
            onClose={form.testReview.close}
            onTtsPlaybackSpeedChange={(speed) => void setTtsPlaybackSpeed(speed)}
          />
        ) : null}
      </>
    );
  };

  return (
    <FormScreen>
      <Header
        variant="page"
        title={strings.cards.newTitle}
        subtitle={form.step === 'setup' ? strings.cards.stepSetup : strings.cards.stepContent}
        onBack={form.handleBack}
      />
      {renderBody()}
    </FormScreen>
  );
}
