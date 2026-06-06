import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { routeHrefs } from '@/constants/routes';
import type { Deck } from '@/domain/entities/Deck';
import {
  CollectionEditModal,
  type CollectionEditErrors,
  type CollectionEditValues,
} from '@/features/collections/components/CollectionEditModal';
import { useCollection } from '@/features/collections/hooks/useCollection';
import { useUpdateCollection } from '@/features/collections/hooks/useUpdateCollection';
import { isUpdateCollectionInputError } from '@/features/collections/services/updateCollection';
import {
  DeckFormModal,
  type DeckFormErrors,
  type DeckFormValues,
} from '@/features/decks/components/DeckFormModal';
import { useActiveDecks } from '@/features/decks/hooks/useActiveDecks';
import { useCreateDeck } from '@/features/decks/hooks/useCreateDeck';
import { useUpdateDeck } from '@/features/decks/hooks/useUpdateDeck';
import { isCreateDeckInputError } from '@/features/decks/services/createDeck';
import { isUpdateDeckInputError } from '@/features/decks/services/updateDeck';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { useTheme } from '@/theme/useTheme';

type DeckModalState = { mode: 'create' } | { mode: 'edit'; deck: Deck };

const emptyDecks: Deck[] = [];

export function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors } = useTheme();

  const collectionQuery = useCollection(id);
  const decksQuery = useActiveDecks(id);
  const updateCollectionMutation = useUpdateCollection();
  const createDeckMutation = useCreateDeck();
  const updateDeckMutation = useUpdateDeck();

  const collection = collectionQuery.data;
  const decks = decksQuery.data ?? emptyDecks;

  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [collectionErrors, setCollectionErrors] = useState<CollectionEditErrors>({});
  const [collectionFormError, setCollectionFormError] = useState<string | undefined>(undefined);

  const [deckModal, setDeckModal] = useState<DeckModalState | null>(null);
  const [deckErrors, setDeckErrors] = useState<DeckFormErrors>({});
  const [deckFormError, setDeckFormError] = useState<string | undefined>(undefined);

  const languagePair = collection
    ? `${collection.baseLanguage.toUpperCase()} -> ${collection.targetLanguage.toUpperCase()}`
    : '';

  const collectionInitialValues = useMemo<CollectionEditValues>(
    () => ({ name: collection?.name ?? '', description: collection?.description ?? '' }),
    [collection?.name, collection?.description],
  );

  const handleEditCollectionSubmit = async (values: CollectionEditValues) => {
    if (!id) {
      return;
    }
    setCollectionErrors({});
    setCollectionFormError(undefined);

    try {
      await updateCollectionMutation.mutateAsync({
        id,
        name: values.name,
        description: values.description || undefined,
      });
      setIsEditingCollection(false);
    } catch (error) {
      if (isUpdateCollectionInputError(error)) {
        setCollectionErrors(error.fieldErrors);
        return;
      }
      setCollectionFormError(strings.collections.updateError);
    }
  };

  const handleDeckSubmit = async (values: DeckFormValues) => {
    if (!id || !deckModal) {
      return;
    }
    setDeckErrors({});
    setDeckFormError(undefined);

    try {
      if (deckModal.mode === 'create') {
        await createDeckMutation.mutateAsync({
          collectionId: id,
          name: values.name,
          description: values.description || undefined,
          autoGenerateReverseCards: values.autoGenerateReverseCards,
        });
      } else {
        await updateDeckMutation.mutateAsync({
          id: deckModal.deck.id,
          name: values.name,
          description: values.description || undefined,
          autoGenerateReverseCards: values.autoGenerateReverseCards,
        });
      }
      setDeckModal(null);
    } catch (error) {
      if (isCreateDeckInputError(error) || isUpdateDeckInputError(error)) {
        setDeckErrors(error.fieldErrors);
        return;
      }
      setDeckFormError(
        deckModal.mode === 'create' ? strings.decks.createError : strings.decks.updateError,
      );
    }
  };

  const openCreateDeck = () => {
    setDeckErrors({});
    setDeckFormError(undefined);
    setDeckModal({ mode: 'create' });
  };

  const openEditDeck = (deck: Deck) => {
    setDeckErrors({});
    setDeckFormError(undefined);
    setDeckModal({ mode: 'edit', deck });
  };

  const renderBody = () => {
    if (collectionQuery.isLoading) {
      return (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.common.loading}
        </Text>
      );
    }

    if (collectionQuery.error) {
      return (
        <StateCard
          title={strings.collections.loadError}
          action={{
            label: strings.common.retry,
            accessibilityLabel: strings.collections.loadRetryA11y,
            variant: 'secondary',
            onPress: () => {
              void collectionQuery.refetch();
            },
          }}
        />
      );
    }

    if (!collection) {
      return <StateCard title={strings.collections.notFound} />;
    }

    return (
      <>
        <View
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          className="gap-2 rounded-2xl border p-4"
        >
          <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
            {languagePair}
          </Text>
          <Text style={{ color: colors.textPrimary }} className="text-base">
            {collection.description ?? strings.collections.noDescription}
          </Text>
          <SecondaryButton
            label={strings.collections.editLabel}
            accessibilityLabel={strings.collections.editA11y}
            onPress={() => {
              setCollectionErrors({});
              setCollectionFormError(undefined);
              setIsEditingCollection(true);
            }}
          />
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
              {strings.collections.decksSectionTitle}
            </Text>
          </View>

          {decksQuery.isLoading ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {strings.common.loading}
            </Text>
          ) : decksQuery.error ? (
            <StateCard
              title={strings.collections.decksLoadError}
              action={{
                label: strings.common.retry,
                accessibilityLabel: strings.collections.decksLoadRetryA11y,
                variant: 'secondary',
                onPress: () => {
                  void decksQuery.refetch();
                },
              }}
            />
          ) : decks.length === 0 ? (
            <StateCard title={strings.collections.noDecks} />
          ) : (
            decks.map((deck) => (
              <View
                key={deck.id}
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                className="flex-row items-center gap-3 rounded-2xl border p-4"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={deck.name}
                  onPress={() => router.push(routeHrefs.deckDetail(deck.id) as Href)}
                  className="flex-1 active:opacity-90"
                >
                  <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
                    {deck.name}
                  </Text>
                  {deck.description ? (
                    <Text style={{ color: colors.textSecondary }} className="mt-1 text-sm">
                      {deck.description}
                    </Text>
                  ) : null}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${strings.decks.editA11y}: ${deck.name}`}
                  onPress={() => openEditDeck(deck)}
                  style={{ borderColor: colors.border }}
                  className="rounded-xl border px-3 py-2 active:opacity-90"
                >
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
                    {strings.decks.editLabel}
                  </Text>
                </Pressable>
              </View>
            ))
          )}

          <PrimaryButton
            label={strings.collections.addDeckLabel}
            accessibilityLabel={strings.collections.addDeckA11y}
            onPress={openCreateDeck}
          />
        </View>
      </>
    );
  };

  return (
    <FormScreen>
      <ScreenHeader title={collection?.name ?? strings.collections.newTitle} onBack={goBack} />
      {renderBody()}

      {collection ? (
        <CollectionEditModal
          visible={isEditingCollection}
          languagePair={languagePair}
          initialValues={collectionInitialValues}
          isSaving={updateCollectionMutation.isPending}
          fieldErrors={collectionErrors}
          formError={collectionFormError}
          onSubmit={handleEditCollectionSubmit}
          onClose={() => setIsEditingCollection(false)}
        />
      ) : null}

      {collection ? (
        <DeckFormModal
          visible={deckModal !== null}
          mode={deckModal?.mode ?? 'create'}
          collectionName={collection.name}
          initialValues={
            deckModal?.mode === 'edit'
              ? {
                  name: deckModal.deck.name,
                  description: deckModal.deck.description ?? '',
                  autoGenerateReverseCards: deckModal.deck.autoGenerateReverseCards,
                }
              : undefined
          }
          isSaving={createDeckMutation.isPending || updateDeckMutation.isPending}
          fieldErrors={deckErrors}
          formError={deckFormError}
          onSubmit={handleDeckSubmit}
          onClose={() => setDeckModal(null)}
        />
      ) : null}
    </FormScreen>
  );
}
