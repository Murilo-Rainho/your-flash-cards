import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { FormScreen } from '@/components/forms/FormScreen';
import { routeHrefs } from '@/constants/routes';
import { useGoBack } from '@/hooks/useGoBack';
import { useTheme } from '@/theme/useTheme';

import { CardReviewResetRow } from '../components/CardReviewResetRow';
import { useDevCardsWithReviewState } from '../hooks/useDevCardsWithReviewState';
import { useDevMutations } from '../hooks/useDevMutations';
import { useDevTables } from '../hooks/useDevTables';

function confirmDestructiveAction(title: string, message: string, onConfirm: () => void): void {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'destructive', onPress: onConfirm },
    ],
    { cancelable: true },
  );
}

export function DevToolsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { colors } = useTheme();

  const tablesQuery = useDevTables();
  const cardsQuery = useDevCardsWithReviewState();
  const { resetSelected, resetAll, makeAllDue, clearLogs, isPending } = useDevMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  const filteredCards = useMemo(() => {
    const cards = cardsQuery.data ?? [];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return cards;
    }

    return cards.filter(
      (card) =>
        card.front.toLowerCase().includes(normalizedQuery) ||
        card.back.toLowerCase().includes(normalizedQuery),
    );
  }, [cardsQuery.data, searchQuery]);

  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds((current) => {
      const next = new Set(current);

      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }

      return next;
    });
  };

  const handleResetSelected = () => {
    const cardIds = [...selectedCardIds];

    if (cardIds.length === 0) {
      return;
    }

    confirmDestructiveAction(
      'Resetar revisão',
      `Resetar o estado de revisão de ${cardIds.length} card(s)? Logs serão apagados.`,
      () => {
        void resetSelected.mutateAsync(cardIds).then(() => {
          setSelectedCardIds(new Set());
        });
      },
    );
  };

  const handleResetAll = () => {
    confirmDestructiveAction(
      'Resetar todos',
      'Resetar revisão de TODOS os cards ativos? Esta ação apaga todos os review_logs.',
      () => {
        void resetAll.mutateAsync();
      },
    );
  };

  const handleMakeAllDue = () => {
    confirmDestructiveAction(
      'Tornar vencidos',
      'Definir next_review_at = agora para todos os cards ativos?',
      () => {
        void makeAllDue.mutateAsync();
      },
    );
  };

  const handleClearLogs = () => {
    confirmDestructiveAction(
      'Limpar logs',
      'Apagar todos os review_logs sem alterar o scheduling?',
      () => {
        void clearLogs.mutateAsync();
      },
    );
  };

  return (
    <FormScreen>
      <Header variant="page" title="Dev Tools" onBack={goBack} />

      <View className="gap-3">
        <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
          SQLite Inspector
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Tabelas do banco local com contagem de registros.
        </Text>
        {tablesQuery.isLoading ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Carregando tabelas...
          </Text>
        ) : null}
        {tablesQuery.error ? (
          <Text style={{ color: colors.danger }} className="text-sm">
            Erro ao carregar tabelas.
          </Text>
        ) : null}
        <View className="gap-2">
          {(tablesQuery.data ?? []).map((table) => (
            <Pressable
              key={table.name}
              accessibilityRole="button"
              accessibilityLabel={`Tabela ${table.name}, ${table.rowCount} registros`}
              onPress={() => router.push(routeHrefs.devToolsTable(table.name) as Href)}
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="flex-row items-center justify-between rounded-xl border p-3 active:opacity-90"
            >
              <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
                {table.name}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">
                {table.rowCount} rows
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
          Reset de revisão
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Selecione cards para restaurar o baseline SM-2 (como card novo).
        </Text>
        <TextInput
          accessibilityLabel="Buscar card por frente ou verso"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por frente ou verso..."
          placeholderTextColor={colors.textSecondary}
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          }}
          className="rounded-xl border px-3 py-3 text-base"
        />
        <PrimaryButton
          label={`Resetar selecionados (${selectedCardIds.size})`}
          onPress={handleResetSelected}
          disabled={selectedCardIds.size === 0 || isPending}
        />
        {cardsQuery.isLoading ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Carregando cards...
          </Text>
        ) : null}
        <View className="gap-2">
          {filteredCards.map((card) => (
            <CardReviewResetRow
              key={card.cardId}
              card={card}
              selected={selectedCardIds.has(card.cardId)}
              onToggle={toggleCardSelection}
            />
          ))}
        </View>
        {filteredCards.length === 0 && !cardsQuery.isLoading ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            Nenhum card encontrado.
          </Text>
        ) : null}
      </View>

      <View className="gap-3">
        <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
          Ações rápidas
        </Text>
        <SecondaryButton
          label="Resetar revisão de todos os cards"
          onPress={handleResetAll}
          disabled={isPending}
        />
        <SecondaryButton
          label="Tornar todos os cards vencidos agora"
          onPress={handleMakeAllDue}
          disabled={isPending}
        />
        <SecondaryButton
          label="Limpar todos os review_logs"
          onPress={handleClearLogs}
          disabled={isPending}
        />
      </View>
    </FormScreen>
  );
}
