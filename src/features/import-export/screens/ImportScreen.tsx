import { Text, View } from 'react-native';

import { Header } from '@/components/common/Header';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { StateCard } from '@/components/common/StateCard';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectField, type SelectOption } from '@/components/forms/SelectField';
import type { SkippedRow } from '@/domain/importers/DeckImporter';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { useTheme } from '@/theme/useTheme';

import { useImportCsv } from '../hooks/useImportCsv';

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Import cards screen (§16): pick CSV -> preview rows + errors -> confirm into a collection. */
export function ImportScreen() {
  const strings = useStrings();
  const importStrings = strings.importExport.import;
  const { colors } = useTheme();
  const goBack = useGoBack();
  const importer = useImportCsv(importStrings.defaultDeckName);

  const reasonLabel = (reason: string): string => {
    const key = reason as keyof typeof importStrings.skipReasons;
    return importStrings.skipReasons[key] ?? reason;
  };

  const collectionOptions: SelectOption[] = importer.collections.map((collection) => ({
    value: collection.id,
    label: collection.name,
    description: `${collection.baseLanguage.toUpperCase()} -> ${collection.targetLanguage.toUpperCase()}`,
  }));

  const renderSkippedRows = (rows: readonly SkippedRow[]) =>
    rows.map((row) => (
      <Text key={row.rowNumber} style={{ color: colors.textSecondary }} className="text-sm">
        {`${importStrings.rowPrefix} ${row.rowNumber}: ${reasonLabel(row.reason)}`}
      </Text>
    ));

  const renderSelect = () => (
    <View className="gap-4">
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {importStrings.recommendation}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {importStrings.formatHint}
      </Text>

      {importer.error === 'read-error' ? (
        <Text style={{ color: colors.danger }} className="text-sm font-medium">
          {importStrings.readError}
        </Text>
      ) : null}

      <PrimaryButton
        label={importStrings.pickLabel}
        accessibilityLabel={importStrings.pickA11y}
        icon="import"
        onPress={() => void importer.pickFile()}
      />
    </View>
  );

  const renderPreview = () => {
    const parse = importer.parseResult;

    if (!parse) {
      return null;
    }

    const mediaSkipped = parse.cards.reduce((total, card) => total + card.fileMediaRefs.length, 0);
    const isImporting = importer.phase === 'importing';
    const hasNoCollections = !importer.collectionsLoading && importer.collections.length === 0;
    const canConfirm =
      Boolean(importer.selectedCollectionId) && parse.cards.length > 0 && !isImporting;

    return (
      <View className="gap-4">
        <View
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          className="gap-2 rounded-2xl border p-4"
        >
          <Text style={{ color: colors.textPrimary }} className="text-base font-bold">
            {importStrings.previewTitle}
          </Text>
          {importer.fileName ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {`${importStrings.fileLabel}: ${importer.fileName}`}
            </Text>
          ) : null}
          <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
            {countLabel(
              parse.cards.length,
              importStrings.readyToImportSingular,
              importStrings.readyToImportPlural,
            )}
          </Text>
          {parse.skipped.length > 0 ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {countLabel(
                parse.skipped.length,
                importStrings.skippedRowsSingular,
                importStrings.skippedRowsPlural,
              )}
            </Text>
          ) : null}
          {mediaSkipped > 0 ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {countLabel(
                mediaSkipped,
                importStrings.mediaSkippedSingular,
                importStrings.mediaSkippedPlural,
              )}
            </Text>
          ) : null}
        </View>

        {parse.skipped.length > 0 ? (
          <View className="gap-1">{renderSkippedRows(parse.skipped)}</View>
        ) : null}

        {parse.cards.length === 0 ? (
          <Text style={{ color: colors.danger }} className="text-sm font-medium">
            {importStrings.emptyParse}
          </Text>
        ) : null}

        {hasNoCollections ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {importStrings.noCollections}
          </Text>
        ) : (
          <SelectField
            label={importStrings.collectionLabel}
            value={importer.selectedCollectionId}
            placeholder={importStrings.collectionPlaceholder}
            options={collectionOptions}
            disabled={isImporting}
            onChange={importer.setSelectedCollectionId}
          />
        )}

        {importer.error === 'import-error' ? (
          <Text style={{ color: colors.danger }} className="text-sm font-medium">
            {importStrings.importError}
          </Text>
        ) : null}

        <PrimaryButton
          label={isImporting ? importStrings.importing : importStrings.confirmLabel}
          accessibilityLabel={importStrings.confirmA11y}
          icon="done"
          disabled={!canConfirm}
          onPress={() => void importer.confirmImport()}
        />

        <SecondaryButton
          label={importStrings.importAnother}
          accessibilityLabel={importStrings.importAnother}
          disabled={isImporting}
          onPress={importer.reset}
        />
      </View>
    );
  };

  const renderResult = () => {
    const result = importer.result;

    if (!result) {
      return null;
    }

    return (
      <View className="gap-4">
        <StateCard
          title={importStrings.resultTitle}
          description={countLabel(
            result.imported,
            importStrings.importedSingular,
            importStrings.importedPlural,
          )}
        />

        {result.skipped.length > 0 ? (
          <View className="gap-1">
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {countLabel(
                result.skipped.length,
                importStrings.notImportedSingular,
                importStrings.notImportedPlural,
              )}
            </Text>
            {renderSkippedRows(result.skipped)}
          </View>
        ) : null}

        {result.mediaSkipped > 0 ? (
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {countLabel(
              result.mediaSkipped,
              importStrings.mediaSkippedSingular,
              importStrings.mediaSkippedPlural,
            )}
          </Text>
        ) : null}

        <PrimaryButton
          label={importStrings.doneLabel}
          accessibilityLabel={importStrings.doneLabel}
          icon="done"
          onPress={goBack}
        />

        <SecondaryButton
          label={importStrings.importAnother}
          accessibilityLabel={importStrings.importAnother}
          onPress={importer.reset}
        />
      </View>
    );
  };

  return (
    <FormScreen>
      <Header variant="page" title={importStrings.title} />
      {importer.phase === 'select'
        ? renderSelect()
        : importer.phase === 'result'
          ? renderResult()
          : renderPreview()}
    </FormScreen>
  );
}
