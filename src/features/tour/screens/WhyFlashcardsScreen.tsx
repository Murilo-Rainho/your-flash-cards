import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { Header } from '@/components/common/Header';
import { Icon } from '@/components/common/Icon';
import { SectionTitle } from '@/components/common/SectionTitle';
import { FormScreen } from '@/components/forms/FormScreen';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import type { StringCatalog } from '@/strings/types';
import { useTheme } from '@/theme/useTheme';

type WhySection = StringCatalog['whyFlashcards']['sections'][number];
type WhyReferenceItem =
  StringCatalog['whyFlashcards']['references']['groups'][number]['items'][number];

function Paragraph({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.textSecondary }} className="text-base leading-6">
      {text}
    </Text>
  );
}

function Bullet({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row gap-2">
      <Text style={{ color: colors.primary }} className="text-base leading-6">
        •
      </Text>
      <Text style={{ color: colors.textSecondary }} className="flex-1 text-base leading-6">
        {text}
      </Text>
    </View>
  );
}

function ExampleCard({ front, back }: { front: string; back: string }) {
  const strings = useStrings();
  const { colors } = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      className="gap-3 rounded-xl border p-4"
    >
      <View className="gap-1">
        <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase">
          {strings.common.front}
        </Text>
        <Text style={{ color: colors.textPrimary }} className="text-base font-medium">
          {front}
        </Text>
      </View>
      <View style={{ backgroundColor: colors.border }} className="h-px w-full" />
      <View className="gap-1">
        <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold uppercase">
          {strings.common.backSide}
        </Text>
        <Text style={{ color: colors.textPrimary }} className="text-base font-medium">
          {back}
        </Text>
      </View>
    </View>
  );
}

function ContentSection({ section }: { section: WhySection }) {
  const { colors } = useTheme();

  return (
    <View className="gap-3">
      {section.heading ? (
        <Text style={{ color: colors.textPrimary }} className="text-lg font-bold">
          {section.heading}
        </Text>
      ) : null}
      {section.paragraphs?.map((paragraph) => (
        <Paragraph key={paragraph} text={paragraph} />
      ))}
      {section.example ? (
        <ExampleCard front={section.example.front} back={section.example.back} />
      ) : null}
      {section.bullets ? (
        <View className="gap-2">
          {section.bullets.map((bullet) => (
            <Bullet key={bullet} text={bullet} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ReferenceLink({ item }: { item: WhyReferenceItem }) {
  const strings = useStrings();
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${item.title}. ${strings.whyFlashcards.openLinkA11y}`}
      onPress={() => {
        void Linking.openURL(item.url).catch(() => {
          Alert.alert(strings.whyFlashcards.openLinkError);
        });
      }}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      className="flex-row items-start gap-3 rounded-xl border p-3 active:opacity-90"
    >
      <Icon name="guide" tone="primary" size={18} />
      <View className="flex-1 gap-1">
        <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
          {item.title}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm leading-5">
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * "Why flashcards work" page (full guide, §33 Onboarding). 100% content
 * local via i18n (offline-first); styles via theme. Reachable from tour and menu.
 */
export function WhyFlashcardsScreen() {
  const strings = useStrings();
  const { colors } = useTheme();
  const why = strings.whyFlashcards;

  return (
    <FormScreen>
      <Header variant="page" title={why.menuLabel} />

      <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold">
        {why.screenTitle}
      </Text>
      <Paragraph text={why.intro} />

      {why.sections.map((section, index) => (
        <ContentSection key={section.heading ?? `section-${index}`} section={section} />
      ))}

      <View className="gap-3">
        <SectionTitle title={why.summary.heading} />
        <View className="gap-2">
          {why.summary.bullets.map((bullet) => (
            <Bullet key={bullet} text={bullet} />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <SectionTitle title={why.references.heading} />
        <Paragraph text={why.references.intro} />
        {why.references.groups.map((group) => (
          <View key={group.heading} className="gap-2">
            <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
              {group.heading}
            </Text>
            {group.items.map((item) => (
              <ReferenceLink key={item.url} item={item} />
            ))}
          </View>
        ))}
      </View>
    </FormScreen>
  );
}
