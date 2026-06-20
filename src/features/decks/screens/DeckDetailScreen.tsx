import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { Badge } from '@/components/common/Badge';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SearchableListContainer } from '@/components/common/SearchableListContainer';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { SectionTitle } from '@/components/common/SectionTitle';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectableChip } from '@/components/forms/SelectableChip';
import type { CardType } from '@/constants/cardTypes';
import { routeHrefs } from '@/constants/routes';
import type { CardListMediaFilters } from '@/domain/repositories/CardListReadRepository';
import { useCollection } from '@/features/collections/hooks/useCollection';
import { useDeckCards } from '@/features/cards/hooks/useDeckCards';
import {
  DeckFormModal,
  type DeckFormErrors,
  type DeckFormValues,
} from '@/features/decks/components/DeckFormModal';
import { useDeck } from '@/features/decks/hooks/useDeck';
import { useUpdateDeck } from '@/features/decks/hooks/useUpdateDeck';
import { isUpdateDeckInputError } from '@/features/decks/services/updateDeck';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

export function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors, shadows } = useTheme();

  const deckQuery = useDeck(id);
  const deck = deckQuery.data;
  const collectionQuery = useCollection(deck?.collectionId);
  const collection = collectionQuery.data;
  const updateDeckMutation = useUpdateDeck();

  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [deckErrors, setDeckErrors] = useState<DeckFormErrors>({});
  const [deckFormError, setDeckFormError] = useState<string | undefined>(undefined);
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [mediaFilters, setMediaFilters] = useState<CardListMediaFilters>({
    audio: false,
    image: false,
  });
  const cardsQuery = useDeckCards(id, cardSearchQuery, mediaFilters);
  const cards = cardsQuery.cards;
  const hasActiveFilters =
    cardSearchQuery.trim().length > 0 || mediaFilters.audio || mediaFilters.image;

  const cardTypeLabel = (type: CardType): string => strings.cards.cardTypes[type].label;

  const openEditDeck = () => {
    setDeckErrors({});
    setDeckFormError(undefined);
    setIsEditingDeck(true);
  };

  const handleEditDeckSubmit = async (values: DeckFormValues) => {
    if (!deck) {
      return;
    }
    setDeckErrors({});
    setDeckFormError(undefined);

    try {
      await updateDeckMutation.mutateAsync({
        id: deck.id,
        name: values.name,
        description: values.description || undefined,
        autoGenerateReverseCards: values.autoGenerateReverseCards,
      });
      setIsEditingDeck(false);
    } catch (error) {
      if (isUpdateDeckInputError(error)) {
        setDeckErrors(error.fieldErrors);
        return;
      }
      setDeckFormError(strings.decks.updateError);
    }
  };

  const renderBody = () => {
    if (deckQuery.isLoading) {
      return (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.common.loading}
        </Text>
      );
    }

    if (deckQuery.error) {
      return (
        <StateCard
          title={strings.decks.loadError}
          action={{
            label: strings.common.retry,
            accessibilityLabel: strings.decks.loadRetryA11y,
            variant: 'secondary',
            onPress: () => {
              void deckQuery.refetch();
            },
          }}
        />
      );
    }

    if (!deck) {
      return <StateCard title={strings.decks.notFound} />;
    }

    return (
      <>
        <View className="gap-2">
          {collection ? (
            <View className="flex-row">
              <Badge label={collection.name} tone="textSecondary" />
            </View>
          ) : null}
          <Text style={{ color: colors.textPrimary }} className="text-3xl font-bold">
            {deck.name}
          </Text>
        </View>

        <View
          style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
          className="gap-3 rounded-2xl border p-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
              className="h-11 w-11 items-center justify-center rounded-2xl"
            >
              <Icon name="deck" size={22} tone="primary" />
            </View>
            <View className="min-w-0 flex-1">
              <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
                {strings.decks.descriptionLabel}
              </Text>
              <Text
                style={{ color: colors.textPrimary }}
                className="mt-1 text-base font-semibold"
                numberOfLines={3}
              >
                {deck.description ?? strings.decks.noDescription}
              </Text>
            </View>
            <IconButton
              icon="edit"
              accessibilityLabel={strings.decks.editA11y}
              onPress={openEditDeck}
            />
          </View>
        </View>

        <View className="gap-3">
          <SectionTitle title={strings.decks.detailCardsTitle} />

          {cardsQuery.isPending ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {strings.common.loading}
            </Text>
          ) : cardsQuery.isError && cards.length === 0 && !cardsQuery.isFetchNextPageError ? (
            <StateCard
              title={strings.decks.cardsLoadError}
              action={{
                label: strings.common.retry,
                accessibilityLabel: strings.decks.cardsLoadRetryA11y,
                variant: 'secondary',
                onPress: () => {
                  void cardsQuery.refetch();
                },
              }}
            />
          ) : cards.length === 0 && !hasActiveFilters && !cardsQuery.isFilterTransition ? (
            <StateCard title={strings.decks.noCards} />
          ) : (
            <SearchableListContainer
              data={cards}
              query={cardSearchQuery}
              placeholder={strings.decks.cardsSearchPlaceholder}
              searchAccessibilityLabel={strings.decks.cardsSearchA11y}
              clearSearchAccessibilityLabel={strings.common.clearSearch}
              emptyMessage={strings.decks.noCardsFound}
              keyExtractor={(item) => item.card.id}
              onQueryChange={setCardSearchQuery}
              resetKey={`${cardsQuery.debouncedQuery}:${mediaFilters.audio}:${mediaFilters.image}`}
              canLoadMore={Boolean(cardsQuery.hasNextPage) && !cardsQuery.isFilterTransition}
              isLoadingMore={cardsQuery.isFetchingNextPage || cardsQuery.isFilterTransition}
              onEndReached={() => {
                void cardsQuery.fetchNextPage();
              }}
              footer={
                cardsQuery.isFetchingNextPage || cardsQuery.isFilterTransition ? (
                  <View className="items-center py-4">
                    <ActivityIndicator
                      color={colors.primary}
                      accessibilityLabel={strings.decks.cardsLoadingMoreA11y}
                    />
                  </View>
                ) : cardsQuery.isFetchNextPageError ? (
                  <View className="gap-2 py-3">
                    <Text style={{ color: colors.danger }} className="text-center text-sm">
                      {strings.decks.cardsLoadMoreError}
                    </Text>
                    <SecondaryButton
                      compact
                      label={strings.common.retry}
                      accessibilityLabel={strings.decks.cardsLoadMoreRetryA11y}
                      onPress={() => {
                        void cardsQuery.fetchNextPage();
                      }}
                    />
                  </View>
                ) : undefined
              }
              filters={
                <View className="flex-row flex-wrap gap-2">
                  <SelectableChip
                    label={strings.decks.audioFilter}
                    selected={mediaFilters.audio}
                    onPress={() =>
                      setMediaFilters((current) => ({ ...current, audio: !current.audio }))
                    }
                  />
                  <SelectableChip
                    label={strings.decks.imageFilter}
                    selected={mediaFilters.image}
                    onPress={() =>
                      setMediaFilters((current) => ({ ...current, image: !current.image }))
                    }
                  />
                </View>
              }
              renderItem={({ item }) => {
                const card = item.card;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={card.front}
                    onPress={() => router.push(routeHrefs.cardDetail(card.id) as Href)}
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      ...shadows.sm,
                    }}
                    className="flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-90"
                  >
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
                        numberOfLines={2}
                      >
                        {card.front}
                      </Text>
                      {card.back ? (
                        <Text
                          style={{ color: colors.textSecondary }}
                          className="text-sm"
                          numberOfLines={1}
                        >
                          {card.back}
                        </Text>
                      ) : null}
                      <View className="mt-1 flex-row">
                        <Badge label={cardTypeLabel(card.type)} tone="secondary" />
                      </View>
                    </View>
                    <Icon name="chevron" size={22} tone="textSecondary" />
                  </Pressable>
                );
              }}
            />
          )}

          <PrimaryButton
            label={strings.decks.addCardLabel}
            accessibilityLabel={strings.decks.addCardA11y}
            onPress={() =>
              router.push(
                routeHrefs.cardNew({ collectionId: deck.collectionId, deckId: deck.id }) as Href,
              )
            }
          />
        </View>
      </>
    );
  };

  return (
    <FormScreen>
      <Header
        variant="page"
        title={collection?.name ?? strings.decks.detailTitle}
        onBack={goBack}
      />
      {renderBody()}

      {deck ? (
        <DeckFormModal
          visible={isEditingDeck}
          mode="edit"
          collectionName={collectionQuery.data?.name ?? ''}
          initialValues={{
            name: deck.name,
            description: deck.description ?? '',
            autoGenerateReverseCards: deck.autoGenerateReverseCards,
          }}
          isSaving={updateDeckMutation.isPending}
          fieldErrors={deckErrors}
          formError={deckFormError}
          onSubmit={handleEditDeckSubmit}
          onClose={() => setIsEditingDeck(false)}
        />
      ) : null}
    </FormScreen>
  );
}
