import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export type ShareExportFileInput = {
  fileName: string;
  content: string;
  mimeType: string;
};

/**
 * Writes the export content to a cache file and opens the native share sheet (§26 local backup).
 * Returns `false` when sharing is unavailable on the device (the file is still written).
 */
export async function shareExportFile({
  fileName,
  content,
  mimeType,
}: ShareExportFileInput): Promise<boolean> {
  const file = new File(Paths.cache, fileName);

  if (file.exists) {
    file.delete();
  }

  file.create();
  file.write(content);

  if (!(await Sharing.isAvailableAsync())) {
    return false;
  }

  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
  return true;
}
