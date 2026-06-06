import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/common/PrimaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import type { CardType } from '@/constants/cardTypes';
import { ROUTES, routeHrefs } from '@/constants/routes';
import { useCollection } from '@/features/collections/hooks/useCollection';
import {
  DeckFormModal,
  type DeckFormErrors,
  type DeckFormValues,
} from '@/features/decks/components/DeckFormModal';
import { useDeck } from '@/features/decks/hooks/useDeck';
import { useUpdateDeck } from '@/features/decks/hooks/useUpdateDeck';
import { isUpdateDeckInputError } from '@/features/decks/services/updateDeck';
import { useDeckCards } from '@/features/cards/hooks/useDeckCards';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { useTheme } from '@/theme/useTheme';
import type { Card } from '@/domain/entities/Card';

const emptyCards: Card[] = [];

export function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors } = useTheme();

  const deckQuery = useDeck(id);
  const deck = deckQuery.data;
  const collectionQuery = useCollection(deck?.collectionId);
  const cardsQuery = useDeckCards(id);
  const updateDeckMutation = useUpdateDeck();

  const cards = cardsQuery.data ?? emptyCards;

  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [deckErrors, setDeckErrors] = useState<DeckFormErrors>({});
  const [deckFormError, setDeckFormError] = useState<string | undefined>(undefined);

  const cardTypeLabel = (type: CardType): string => strings.cards.cardTypes[type].label;

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
        <View
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          className="gap-2 rounded-2xl border p-4"
        >
          <Text style={{ color: colors.textPrimary }} className="text-base">
            {deck.description ?? strings.decks.noDescription}
          </Text>
          <SecondaryButton
            label={strings.decks.editLabel}
            accessibilityLabel={strings.decks.editA11y}
            onPress={() => {
              setDeckErrors({});
              setDeckFormError(undefined);
              setIsEditingDeck(true);
            }}
          />
        </View>

        <View className="gap-3">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
            {strings.decks.detailCardsTitle}
          </Text>

          {cardsQuery.isLoading ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {strings.common.loading}
            </Text>
          ) : cardsQuery.error ? (
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
          ) : cards.length === 0 ? (
            <StateCard title={strings.decks.noCards} />
          ) : (
            cards.map((card) => (
              <Pressable
                key={card.id}
                accessibilityRole="button"
                accessibilityLabel={card.front}
                onPress={() => router.push(routeHrefs.cardDetail(card.id) as Href)}
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                className="gap-2 rounded-2xl border p-4 active:opacity-90"
              >
                <View className="flex-row items-center gap-2">
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="flex-1 text-base font-semibold"
                    numberOfLines={2}
                  >
                    {card.front}
                  </Text>
                  <View
                    style={{ backgroundColor: colors.secondary }}
                    className="rounded-lg px-2 py-1"
                  >
                    <Text style={{ color: colors.background }} className="text-xs font-bold">
                      {cardTypeLabel(card.type)}
                    </Text>
                  </View>
                </View>
                {card.back ? (
                  <Text
                    style={{ color: colors.textSecondary }}
                    className="text-sm"
                    numberOfLines={1}
                  >
                    {card.back}
                  </Text>
                ) : null}
              </Pressable>
            ))
          )}

          <PrimaryButton
            label={strings.decks.addCardLabel}
            accessibilityLabel={strings.decks.addCardA11y}
            onPress={() => router.push(ROUTES.CARD_NEW as Href)}
          />
        </View>
      </>
    );
  };

  return (
    <FormScreen>
      <ScreenHeader title={deck?.name ?? strings.decks.newTitle} onBack={goBack} />
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
