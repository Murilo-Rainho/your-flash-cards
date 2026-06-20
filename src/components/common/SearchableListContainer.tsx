import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import {
  FlatList,
  Text,
  TextInput,
  View,
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/useTheme';

type SearchableListContainerProps<T> = {
  data: readonly T[];
  query: string;
  placeholder: string;
  searchAccessibilityLabel: string;
  clearSearchAccessibilityLabel: string;
  emptyMessage: string;
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  onQueryChange: (query: string) => void;
  filters?: ReactNode;
  footer?: ReactElement | null;
  maxResultsHeight?: number;
  resetKey?: string;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
};

/** Painel controlado de busca com cabeçalho fixo e resultados virtualizados. */
export function SearchableListContainer<T>({
  data,
  query,
  placeholder,
  searchAccessibilityLabel,
  clearSearchAccessibilityLabel,
  emptyMessage,
  keyExtractor,
  renderItem,
  onQueryChange,
  filters,
  footer,
  maxResultsHeight = 320,
  resetKey,
  canLoadMore = false,
  isLoadingMore = false,
  onEndReached,
}: SearchableListContainerProps<T>) {
  const { colors, shadows } = useTheme();
  const resultsStyle: StyleProp<ViewStyle> = { maxHeight: maxResultsHeight };
  const listRef = useRef<FlatList<T>>(null);
  const previousResetKey = useRef(resetKey);
  const userInteracted = useRef(false);

  useEffect(() => {
    if (previousResetKey.current === resetKey) {
      return;
    }

    previousResetKey.current = resetKey;
    userInteracted.current = false;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [resetKey]);

  const handleEndReached = () => {
    if (!userInteracted.current || !canLoadMore || isLoadingMore || !onEndReached) {
      return;
    }

    userInteracted.current = false;
    onEndReached();
  };

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
      className="gap-3 rounded-2xl border p-3"
    >
      <View
        style={{ borderColor: colors.border, backgroundColor: colors.background }}
        className="flex-row items-center gap-2 rounded-2xl border px-3"
      >
        <Icon name="search" size={20} tone="textSecondary" />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          selectionHandleColor={colors.primary}
          cursorColor={colors.primary}
          underlineColorAndroid="transparent"
          accessibilityLabel={searchAccessibilityLabel}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={{ color: colors.textPrimary }}
          className="min-h-12 flex-1 py-3 text-base"
        />
        {query.length > 0 ? (
          <IconButton
            icon="close"
            accessibilityLabel={clearSearchAccessibilityLabel}
            onPress={() => onQueryChange('')}
          />
        ) : null}
      </View>

      {filters}

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={resultsStyle}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
          userInteracted.current = true;
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <Text
            style={{ color: colors.textSecondary, paddingVertical: spacing.lg }}
            className="text-center text-sm"
          >
            {emptyMessage}
          </Text>
        }
      />
    </View>
  );
}
