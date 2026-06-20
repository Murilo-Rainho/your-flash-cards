import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { BottomSheet } from '@/components/common/BottomSheet';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SelectField, type SelectOption } from '@/components/forms/SelectField';
import { EXPORT_FORMATS } from '@/domain/exporters/DeckExporter';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

import { useExportCollection } from '../hooks/useExportCollection';

type ExportCollectionSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/** Home export modal (§24): pick a collection + file format (CSV) and share the file. */
export function ExportCollectionSheet({ visible, onClose }: ExportCollectionSheetProps) {
  const strings = useStrings();
  const exportStrings = strings.importExport.export;
  const { colors } = useTheme();
  const { collections, collectionsLoading, status, runExport, reset } = useExportCollection();
  const [selectedCollectionId, setSelectedCollectionId] = useState('');

  useEffect(() => {
    if (!visible) {
      reset();
      setSelectedCollectionId('');
    }
  }, [reset, visible]);

  const collectionOptions: SelectOption[] = collections.map((collection) => ({
    value: collection.id,
    label: collection.name,
    description: `${collection.baseLanguage.toUpperCase()} -> ${collection.targetLanguage.toUpperCase()}`,
  }));

  const formatOptions: SelectOption[] = [
    {
      value: EXPORT_FORMATS.CSV,
      label: exportStrings.formatCsv,
      description: exportStrings.formatCsvHint,
    },
  ];

  const isExporting = status === 'exporting';
  const hasNoCollections = !collectionsLoading && collections.length === 0;
  const canSubmit = Boolean(selectedCollectionId) && !isExporting;

  const statusMessage =
    status === 'empty' ? exportStrings.empty : status === 'error' ? exportStrings.error : null;

  const handleSubmit = async () => {
    const ok = await runExport(selectedCollectionId);

    if (ok) {
      onClose();
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      closeAccessibilityLabel={exportStrings.closeA11y}
      title={exportStrings.title}
    >
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {exportStrings.subtitle}
      </Text>

      {hasNoCollections ? (
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {exportStrings.noCollections}
        </Text>
      ) : (
        <>
          <SelectField
            label={exportStrings.collectionLabel}
            value={selectedCollectionId}
            placeholder={exportStrings.collectionPlaceholder}
            options={collectionOptions}
            disabled={isExporting}
            onChange={setSelectedCollectionId}
          />

          <SelectField
            label={exportStrings.formatLabel}
            value={EXPORT_FORMATS.CSV}
            placeholder={exportStrings.formatCsv}
            options={formatOptions}
            disabled={isExporting}
            onChange={() => undefined}
          />

          {statusMessage ? (
            <Text style={{ color: colors.danger }} className="text-sm font-medium">
              {statusMessage}
            </Text>
          ) : null}

          <PrimaryButton
            label={isExporting ? exportStrings.exporting : exportStrings.submitLabel}
            accessibilityLabel={exportStrings.submitA11y}
            icon="export"
            disabled={!canSubmit}
            onPress={() => void handleSubmit()}
          />
        </>
      )}
    </BottomSheet>
  );
}
