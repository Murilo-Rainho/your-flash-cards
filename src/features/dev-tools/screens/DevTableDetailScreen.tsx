import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { FormScreen } from '@/components/forms/FormScreen';
import { useGoBack } from '@/hooks/useGoBack';
import { useTheme } from '@/theme/useTheme';

import { DEV_TABLE_PAGE_SIZE, useDevTableRows } from '../hooks/useDevTableRows';

const ROW_PREVIEW_LIMIT = 240;

function formatRowPreview(row: Record<string, unknown>): string {
  const serialized = JSON.stringify(row, null, 2);
  if (serialized.length <= ROW_PREVIEW_LIMIT) {
    return serialized;
  }

  return `${serialized.slice(0, ROW_PREVIEW_LIMIT)}…`;
}

export function DevTableDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const goBack = useGoBack();
  const { colors } = useTheme();
  const [page, setPage] = useState(0);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  const rowsQuery = useDevTableRows(name, page);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!rowsQuery.data) {
      return;
    }

    setRows((current) => {
      if (page === 0) {
        return rowsQuery.data;
      }

      return [...current, ...rowsQuery.data];
    });
  }, [page, rowsQuery.data]);

  const hasMore = (rowsQuery.data?.length ?? 0) === DEV_TABLE_PAGE_SIZE;

  return (
    <FormScreen>
      <Header variant="page" title={name ?? 'Tabela'} onBack={goBack} />

      <Text style={{ color: colors.textSecondary }} className="text-sm">
        Página {page + 1} • {rows.length} registro(s) carregado(s)
      </Text>

      {rowsQuery.isLoading ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Carregando registros...
        </Text>
      ) : null}

      {rowsQuery.error ? (
        <Text style={{ color: colors.danger }} className="text-sm">
          Erro ao carregar registros.
        </Text>
      ) : null}

      <View className="gap-2">
        {rows.map((row, index) => {
          const isExpanded = expandedRowIndex === index;
          const content = isExpanded ? JSON.stringify(row, null, 2) : formatRowPreview(row);

          return (
            <Pressable
              key={`${page}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Registro ${page * DEV_TABLE_PAGE_SIZE + index + 1}`}
              onPress={() => setExpandedRowIndex(isExpanded ? null : index)}
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="rounded-xl border p-3 active:opacity-90"
            >
              <Text style={{ color: colors.textSecondary }} className="mb-2 text-xs font-semibold">
                #{page * DEV_TABLE_PAGE_SIZE + index + 1}
              </Text>
              <Text
                style={{ color: colors.textPrimary, fontFamily: 'monospace' }}
                className="text-xs"
              >
                {content}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {rows.length === 0 && !rowsQuery.isLoading ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          Tabela vazia.
        </Text>
      ) : null}

      {hasMore ? (
        <PrimaryButton
          label="Carregar mais"
          onPress={() => {
            setPage((current) => current + 1);
            setExpandedRowIndex(null);
          }}
          disabled={rowsQuery.isFetching}
        />
      ) : null}
    </FormScreen>
  );
}
