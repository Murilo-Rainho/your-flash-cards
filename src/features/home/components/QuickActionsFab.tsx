import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { shadows } from '@/theme';
import type { QuickAction } from '@/domain/entities/QuickAction';

type QuickActionsFabProps = {
  actions: QuickAction[];
  onActionPress: (action: QuickAction) => void;
};

/**
 * FAB de ações rápidas. Abre um menu local simples (sem navegação ainda); ao tocar numa
 * ação, fecha o menu e delega via `onActionPress`.
 */
export function QuickActionsFab({ actions, onActionPress }: QuickActionsFabProps) {
  const [open, setOpen] = useState(false);

  const handleActionPress = (action: QuickAction) => {
    setOpen(false);
    onActionPress(action);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ações rápidas"
        onPress={() => setOpen(true)}
        style={shadows.lg}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-90"
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
            {actions.map((action) => (
              <Pressable
                key={action.id}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                disabled={action.disabled}
                onPress={() => handleActionPress(action)}
                className="flex-row items-center gap-3 rounded-xl p-3 active:bg-surface"
              >
                <Text className="text-xl">{action.icon}</Text>
                <Text className="text-base font-medium text-textPrimary">{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
