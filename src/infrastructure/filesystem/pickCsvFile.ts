import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

export type PickedCsvFile = {
  name: string;
  content: string;
};

/**
 * Opens the document picker for a CSV file and reads its text content. Returns `null` when the
 * user cancels. Offline-first: reads a local file, no network (§29).
 */
export async function pickCsvFile(): Promise<PickedCsvFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  const asset = result.canceled ? null : result.assets[0];

  if (!asset) {
    return null;
  }

  const content = await new File(asset.uri).text();

  return {
    name: asset.name,
    content,
  };
}
