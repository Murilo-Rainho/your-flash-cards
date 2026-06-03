import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors, shadows } from '@/theme';
import type { QuickAction } from '@/domain/entities/QuickAction';

type QuickActionsFabProps = {
  actions: QuickAction[];
  showFirstCollectionHint?: boolean;
  onActionPress: (action: QuickAction) => void;
};

/**
 * FAB de ações rápidas. Abre um menu local simples (sem navegação ainda); ao tocar numa
 * ação, fecha o menu e delega via `onActionPress`.
 */
export function QuickActionsFab({
  actions,
  showFirstCollectionHint = false,
  onActionPress,
}: QuickActionsFabProps) {
  const [open, setOpen] = useState(false);

  const handleActionPress = (action: QuickAction) => {
    setOpen(false);
    onActionPress(action);
  };

  return (
    <>
      {showFirstCollectionHint ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="absolute bottom-24 right-4 items-end"
        >
          <View style={[shadows.md, { maxWidth: 160 }]} className="rounded-lg bg-warning px-3 py-2">
            <Text className="text-sm font-bold text-textPrimary">Clique aqui!</Text>
          </View>
          <View
            style={{
              backgroundColor: colors.warning,
              height: 12,
              marginRight: 28,
              marginTop: -6,
              transform: [{ rotate: '45deg' }],
              width: 12,
            }}
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          showFirstCollectionHint
            ? 'Ações rápidas. Clique aqui para criar sua primeira coleção'
            : 'Ações rápidas'
        }
        onPress={() => setOpen(true)}
        style={shadows.lg}
        className={`absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-90 ${
          showFirstCollectionHint ? 'border-4 border-warning' : ''
        }`}
      >
        <Text className="text-3xl leading-none text-background">+</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar ações rápidas"
          onPress={() => setOpen(false)}
          className="flex-1 justify-end bg-textPrimary/40 p-6"
        >
          <View style={shadows.lg} className="gap-1 rounded-2xl bg-background p-2">
            {actions.map((action) => {
              const shouldHighlightAction =
                showFirstCollectionHint && action.id === 'new-collection';

              return (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    shouldHighlightAction ? `${action.label}, comece aqui` : action.label
                  }
                  accessibilityState={{ disabled: action.disabled }}
                  disabled={action.disabled}
                  onPress={() => handleActionPress(action)}
                  className={`flex-row items-center gap-3 rounded-xl p-3 active:bg-surface ${
                    action.disabled ? 'opacity-40' : ''
                  }`}
                >
                  <Text className="text-xl">{action.icon}</Text>
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <Text className="shrink text-base font-medium text-textPrimary">
                      {action.label}
                    </Text>
                    {shouldHighlightAction ? (
                      <View className="rounded-lg bg-warning px-2 py-1">
                        <Text className="text-xs font-bold text-textPrimary">Comece aqui</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
