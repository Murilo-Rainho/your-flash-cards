import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectField } from '@/components/forms/SelectField';

import { CardTypeFields } from '../components/CardTypeFields';
import { OptionalCardFields } from '../components/OptionalCardFields';
import { useNewCardForm } from '../hooks/useNewCardForm';

/**
 * Novo Card (§7–§12) — tela burra: orquestra `useNewCardForm` e compõe os componentes
 * compartilhados/da feature. Sem regra de negócio nem acesso a infra direto.
 */
export function NewCardScreen() {
  const form = useNewCardForm();

  const saveLabel = form.isSaving
    ? 'Salvando...'
    : form.isRecording
      ? 'Pare a gravacao para salvar'
      : 'Salvar card';

  const renderBody = () => {
    if (form.collectionsLoading) {
      return <Text className="text-sm text-textSecondary">Carregando colecoes locais...</Text>;
    }

    if (form.collectionsError) {
      return (
        <StateCard
          title="Nao foi possivel carregar as colecoes"
          action={{
            label: 'Tentar novamente',
            accessibilityLabel: 'Tentar carregar colecoes novamente',
            variant: 'secondary',
            onPress: form.onRetryCollections,
          }}
        />
      );
    }

    if (form.collections.length === 0) {
      return (
        <StateCard
          title="Nenhuma colecao criada ainda"
          action={{
            label: 'Criar colecao',
            accessibilityLabel: 'Criar colecao',
            onPress: form.goToCreateCollection,
          }}
        />
      );
    }

    if (form.step === 'setup') {
      return (
        <>
          <SelectField
            label="Colecao"
            value={form.selectedCollectionId}
            placeholder="Escolha uma colecao"
            disabled={form.isSaving}
            options={form.collectionOptions}
            error={form.errors.collectionId?.message}
            onChange={form.onCollectionChange}
          />

          {form.decksEmpty ? (
            <StateCard
              title="Nenhum deck nesta colecao"
              action={{
                label: 'Criar deck',
                accessibilityLabel: 'Criar deck',
                onPress: form.goToCreateDeck,
              }}
            />
          ) : (
            <SelectField
              label="Deck"
              value={form.selectedDeckId}
              placeholder={form.decksLoading ? 'Carregando decks...' : 'Escolha um deck'}
              disabled={!form.selectedCollectionId || form.decksLoading}
              options={form.deckOptions}
              error={form.errors.deckId?.message}
              onChange={form.onDeckChange}
            />
          )}

          <SelectField
            label="Tipo"
            value={form.selectedType}
            placeholder="Escolha um tipo"
            disabled={form.isSaving}
            options={form.typeOptions}
            error={form.errors.type?.message}
            onChange={form.onTypeChange}
          />

          {form.formError ? (
            <Text className="text-sm font-medium text-danger">{form.formError}</Text>
          ) : null}

          <PrimaryButton
            label="Proximo"
            accessibilityLabel="Proximo"
            disabled={!form.canGoNext}
            onPress={form.onNext}
          />
        </>
      );
    }

    return (
      <>
        <View className="gap-2 rounded-xl border border-border bg-surface p-4">
          <Text className="text-sm font-semibold text-textPrimary">
            {form.selectedCollectionName}
          </Text>
          <Text className="text-sm text-textSecondary">
            {form.selectedDeckName} - {form.selectedTypeLabel}
          </Text>
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
          onChangeText={form.onChangeText}
          onListeningModeChange={form.onListeningModeChange}
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
          expanded={form.showOptionalFields}
          tags={form.tags}
          notes={form.notes}
          disabled={form.isSaving}
          tagsError={form.errors.tags?.message}
          notesError={form.errors.notes?.message}
          onToggle={form.onToggleOptional}
          onChangeTags={form.onChangeTags}
          onChangeNotes={form.onChangeNotes}
        />

        {form.successMessage ? (
          <Text className="text-sm font-semibold text-success">{form.successMessage}</Text>
        ) : null}

        {form.formError ? (
          <Text className="text-sm font-medium text-danger">{form.formError}</Text>
        ) : null}

        <PrimaryButton
          label={saveLabel}
          accessibilityLabel="Salvar card"
          disabled={form.isSaveDisabled}
          onPress={form.onSubmit}
        />
      </>
    );
  };

  return (
    <FormScreen>
      <ScreenHeader
        title="Novo Card"
        subtitle={form.step === 'setup' ? 'Etapa 1 de 2' : 'Etapa 2 de 2'}
        onBack={form.handleBack}
      />
      {renderBody()}
    </FormScreen>
  );
}
