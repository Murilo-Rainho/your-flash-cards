import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { Badge } from '@/components/common/Badge';
import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SearchableListContainer } from '@/components/common/SearchableListContainer';
import { SectionTitle } from '@/components/common/SectionTitle';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { routeHrefs } from '@/constants/routes';
import type { Deck } from '@/domain/entities/Deck';
import type { Tag } from '@/domain/entities/Tag';
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
import {
  TagFormModal,
  type TagFormErrors,
  type TagFormValues,
} from '@/features/tags/components/TagFormModal';
import { useCreateTag } from '@/features/tags/hooks/useCreateTag';
import { useDeleteTag } from '@/features/tags/hooks/useDeleteTag';
import { useTags } from '@/features/tags/hooks/useTags';
import { useUpdateTag } from '@/features/tags/hooks/useUpdateTag';
import { isCreateTagInputError } from '@/features/tags/services/createTag';
import { isUpdateTagInputError } from '@/features/tags/services/updateTag';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';
import { filterNamedItems } from '@/utils/search';

type DeckModalState = { mode: 'create' } | { mode: 'edit'; deck: Deck };
type TagModalState = { mode: 'create' } | { mode: 'edit'; tag: Tag };

const emptyDecks: Deck[] = [];
const emptyTags: Tag[] = [];

export function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const strings = useStrings();
  const { colors, shadows } = useTheme();

  const collectionQuery = useCollection(id);
  const decksQuery = useActiveDecks(id);
  const tagsQuery = useTags(id ?? '');
  const updateCollectionMutation = useUpdateCollection();
  const createDeckMutation = useCreateDeck();
  const updateDeckMutation = useUpdateDeck();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const collection = collectionQuery.data;
  const decks = decksQuery.data ?? emptyDecks;
  const tags = tagsQuery.data ?? emptyTags;

  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [collectionErrors, setCollectionErrors] = useState<CollectionEditErrors>({});
  const [collectionFormError, setCollectionFormError] = useState<string | undefined>(undefined);

  const [deckModal, setDeckModal] = useState<DeckModalState | null>(null);
  const [deckErrors, setDeckErrors] = useState<DeckFormErrors>({});
  const [deckFormError, setDeckFormError] = useState<string | undefined>(undefined);

  const [tagModal, setTagModal] = useState<TagModalState | null>(null);
  const [tagErrors, setTagErrors] = useState<TagFormErrors>({});
  const [tagFormError, setTagFormError] = useState<string | undefined>(undefined);
  const [deckSearchQuery, setDeckSearchQuery] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const filteredDecks = useMemo(
    () => filterNamedItems(decks, deckSearchQuery),
    [deckSearchQuery, decks],
  );
  const filteredTags = useMemo(
    () => filterNamedItems(tags, tagSearchQuery),
    [tagSearchQuery, tags],
  );

  const languagePair = collection
    ? `${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`
    : '';
  const collectionInitial = collection?.name.trim().charAt(0).toUpperCase() || '•';

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

  const handleTagSubmit = async (values: TagFormValues) => {
    if (!id || !tagModal) {
      return;
    }
    setTagErrors({});
    setTagFormError(undefined);

    try {
      if (tagModal.mode === 'create') {
        await createTagMutation.mutateAsync({
          collectionId: id,
          name: values.name,
        });
      } else {
        await updateTagMutation.mutateAsync({
          id: tagModal.tag.id,
          name: values.name,
        });
      }
      setTagModal(null);
    } catch (error) {
      if (isCreateTagInputError(error) || isUpdateTagInputError(error)) {
        setTagErrors(error.fieldErrors);
        return;
      }
      setTagFormError(
        tagModal.mode === 'create' ? strings.tags.createError : strings.tags.updateError,
      );
    }
  };

  const openCreateTag = () => {
    setTagErrors({});
    setTagFormError(undefined);
    setTagModal({ mode: 'create' });
  };

  const openEditTag = (tag: Tag) => {
    setTagErrors({});
    setTagFormError(undefined);
    setTagModal({ mode: 'edit', tag });
  };

  const confirmDeleteTag = (tag: Tag) => {
    Alert.alert(
      strings.tags.deleteConfirmTitle,
      strings.tags.deleteConfirmMessage,
      [
        { text: strings.tags.deleteConfirmCancel, style: 'cancel' },
        {
          text: strings.tags.deleteConfirmConfirm,
          style: 'destructive',
          onPress: () => {
            void deleteTagMutation
              .mutateAsync({ id: tag.id, collectionId: tag.collectionId })
              .catch(() => {
                Alert.alert(strings.tags.deleteError);
              });
          },
        },
      ],
      { cancelable: true },
    );
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
          style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
          className="gap-3 rounded-2xl border p-4"
        >
          <View className="flex-row items-center gap-3">
            <View
              style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
              className="h-11 w-11 items-center justify-center rounded-2xl"
            >
              <Text style={{ color: colors.primary }} className="text-lg font-bold">
                {collectionInitial}
              </Text>
            </View>
            <View className="min-w-0 flex-1 flex-row">
              <Badge label={languagePair} tone="textSecondary" />
            </View>
            <IconButton
              icon="edit"
              accessibilityLabel={strings.collections.editA11y}
              onPress={() => {
                setCollectionErrors({});
                setCollectionFormError(undefined);
                setIsEditingCollection(true);
              }}
            />
          </View>
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {collection.description ?? strings.collections.noDescription}
          </Text>
        </View>

        <View className="gap-3">
          <SectionTitle title={strings.collections.decksSectionTitle} />

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
            <SearchableListContainer
              data={filteredDecks}
              query={deckSearchQuery}
              placeholder={strings.collections.decksSearchPlaceholder}
              searchAccessibilityLabel={strings.collections.decksSearchA11y}
              clearSearchAccessibilityLabel={strings.common.clearSearch}
              emptyMessage={strings.collections.noDecksFound}
              keyExtractor={(deck) => deck.id}
              onQueryChange={setDeckSearchQuery}
              maxResultsHeight={280}
              renderItem={({ item: deck }) => (
                <View
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    ...shadows.sm,
                  }}
                  className="flex-row items-center gap-3 rounded-2xl border p-4"
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={deck.name}
                    onPress={() => router.push(routeHrefs.deckDetail(deck.id) as Href)}
                    className="flex-1 flex-row items-center gap-3 active:opacity-90"
                  >
                    <View
                      style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
                      className="h-11 w-11 items-center justify-center rounded-2xl"
                    >
                      <Icon name="deck" size={22} tone="primary" />
                    </View>
                    <View className="min-w-0 flex-1 gap-1">
                      <Text
                        style={{ color: colors.textPrimary }}
                        className="text-base font-bold"
                        numberOfLines={1}
                      >
                        {deck.name}
                      </Text>
                      {deck.description ? (
                        <Text
                          style={{ color: colors.textSecondary }}
                          className="text-sm"
                          numberOfLines={1}
                        >
                          {deck.description}
                        </Text>
                      ) : null}
                    </View>
                    <Icon name="chevron" size={22} tone="textSecondary" />
                  </Pressable>
                  <IconButton
                    icon="edit"
                    accessibilityLabel={`${strings.decks.editA11y}: ${deck.name}`}
                    onPress={() => openEditDeck(deck)}
                  />
                </View>
              )}
            />
          )}

          <PrimaryButton
            label={strings.collections.addDeckLabel}
            accessibilityLabel={strings.collections.addDeckA11y}
            onPress={openCreateDeck}
          />
        </View>

        <View className="gap-3">
          <SectionTitle title={strings.collections.tagsSectionTitle} />

          {tagsQuery.isLoading ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {strings.common.loading}
            </Text>
          ) : tagsQuery.error ? (
            <StateCard
              title={strings.collections.tagsLoadError}
              action={{
                label: strings.common.retry,
                accessibilityLabel: strings.collections.tagsLoadRetryA11y,
                variant: 'secondary',
                onPress: () => {
                  void tagsQuery.refetch();
                },
              }}
            />
          ) : tags.length === 0 ? (
            <StateCard title={strings.collections.noTags} />
          ) : (
            <SearchableListContainer
              data={filteredTags}
              query={tagSearchQuery}
              placeholder={strings.collections.tagsSearchPlaceholder}
              searchAccessibilityLabel={strings.collections.tagsSearchA11y}
              clearSearchAccessibilityLabel={strings.common.clearSearch}
              emptyMessage={strings.collections.noTagsFound}
              keyExtractor={(tag) => tag.id}
              onQueryChange={setTagSearchQuery}
              maxResultsHeight={270}
              renderItem={({ item: tag }) => (
                <View
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    ...shadows.sm,
                  }}
                  className="flex-row items-center gap-3 rounded-2xl border p-4"
                >
                  <View
                    style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                  >
                    <Icon name="tag" size={22} tone="primary" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      style={{ color: colors.textPrimary }}
                      className="text-base font-bold"
                      numberOfLines={1}
                    >
                      {tag.name}
                    </Text>
                  </View>
                  <IconButton
                    icon="edit"
                    accessibilityLabel={`${strings.tags.editA11y}: ${tag.name}`}
                    onPress={() => openEditTag(tag)}
                  />
                  <IconButton
                    icon="delete"
                    tone="danger"
                    accessibilityLabel={`${strings.tags.deleteA11y}: ${tag.name}`}
                    onPress={() => confirmDeleteTag(tag)}
                    disabled={deleteTagMutation.isPending}
                  />
                </View>
              )}
            />
          )}

          <PrimaryButton
            label={strings.collections.addTagLabel}
            accessibilityLabel={strings.collections.addTagA11y}
            onPress={openCreateTag}
          />
        </View>
      </>
    );
  };

  return (
    <FormScreen>
      <Header variant="page" title={collection?.name ?? strings.collections.detailTitle} />
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

      {collection ? (
        <TagFormModal
          visible={tagModal !== null}
          mode={tagModal?.mode ?? 'create'}
          collectionName={collection.name}
          initialValues={tagModal?.mode === 'edit' ? { name: tagModal.tag.name } : undefined}
          isSaving={createTagMutation.isPending || updateTagMutation.isPending}
          fieldErrors={tagErrors}
          formError={tagFormError}
          onSubmit={handleTagSubmit}
          onClose={() => setTagModal(null)}
        />
      ) : null}
    </FormScreen>
  );
}
