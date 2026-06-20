import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import type { QuickAction } from '@/domain/entities/QuickAction';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type QuickActionsFabProps = {
  actions: QuickAction[];
  showFirstCollectionHint?: boolean;
  onActionPress: (action: QuickAction) => void;
};

/**
 * Quick-actions FAB. Opens a simple local menu (no navigation yet); tapping an
 * action closes the menu and delegates via `onActionPress`.
 */
export function QuickActionsFab({
  actions,
  showFirstCollectionHint = false,
  onActionPress,
}: QuickActionsFabProps) {
  const [open, setOpen] = useState(false);
  const strings = useStrings();
  const { colors, shadows } = useTheme();

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
          <View
            style={{ backgroundColor: colors.warning, maxWidth: 160, ...shadows.md }}
            className="rounded-lg px-3 py-2"
          >
            <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
              {strings.home.quickActions.hintClickHere}
            </Text>
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
            ? `${strings.home.quickActions.hintClickHere} ${strings.home.quickActions.hintStartHere}`
            : strings.home.quickActions.newCollection
        }
        onPress={() => setOpen(true)}
        style={{
          backgroundColor: colors.primary,
          borderColor: showFirstCollectionHint ? colors.warning : undefined,
          borderWidth: showFirstCollectionHint ? 4 : 0,
          ...shadows.lg,
        }}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full active:opacity-90"
      >
        <Icon name="add" size={28} color={colors.background} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.home.quickActions.closeA11y}
          onPress={() => setOpen(false)}
          style={{ backgroundColor: `${colors.textPrimary}66` }}
          className="flex-1 justify-end p-6"
        >
          <View
            style={{ backgroundColor: colors.background, ...shadows.lg }}
            className="rounded-2xl p-2 pt-3"
          >
            <View
              style={{ backgroundColor: withAlpha(colors.textSecondary, 0.3) }}
              className="mb-2 h-1 w-10 self-center rounded-full"
            />
            <View className="gap-1">
              {actions.map((action) => {
                const shouldHighlightAction =
                  showFirstCollectionHint && action.id === 'new-collection';

                return (
                  <Pressable
                    key={action.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      shouldHighlightAction
                        ? `${action.label}, ${strings.home.quickActions.hintStartHere}`
                        : action.label
                    }
                    accessibilityState={{ disabled: action.disabled }}
                    disabled={action.disabled}
                    onPress={() => handleActionPress(action)}
                    className={`flex-row items-center gap-3 rounded-xl p-3 active:opacity-90 ${
                      action.disabled ? 'opacity-40' : ''
                    }`}
                  >
                    <View
                      style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
                      className="h-10 w-10 items-center justify-center rounded-full"
                    >
                      <Icon name={action.icon as IconName} size={20} tone="primary" />
                    </View>
                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                      <Text
                        style={{ color: colors.textPrimary }}
                        className="shrink text-base font-medium"
                      >
                        {action.label}
                      </Text>
                      {shouldHighlightAction ? (
                        <View
                          style={{ backgroundColor: colors.warning }}
                          className="rounded-lg px-2 py-1"
                        >
                          <Text style={{ color: colors.textPrimary }} className="text-xs font-bold">
                            {strings.home.quickActions.hintStartHere}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
