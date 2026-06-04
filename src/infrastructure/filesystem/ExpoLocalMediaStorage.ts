import { Directory, File, Paths } from 'expo-file-system';

import type {
  LocalMediaStorage,
  PersistedLocalMedia,
  PersistLocalMediaInput,
} from '@/domain/services/LocalMediaStorage';

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/mp4': '.m4a',
  'audio/m4a': '.m4a',
  'audio/aac': '.aac',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/3gpp': '.3gp',
  'audio/webm': '.webm',
};

function getExtension(input: PersistLocalMediaInput): string {
  const fileName = input.fileName ?? input.sourceUri.split('/').pop() ?? '';
  const cleanName = fileName.split('?')[0] ?? '';
  const extension = cleanName.includes('.') ? cleanName.slice(cleanName.lastIndexOf('.')) : '';

  if (extension.length > 1 && extension.length <= 8) {
    return extension.toLowerCase();
  }

  return extensionByMimeType[input.mimeType.toLowerCase()] ?? '';
}

export class ExpoLocalMediaStorage implements LocalMediaStorage {
  async copyToCard(input: PersistLocalMediaInput): Promise<PersistedLocalMedia> {
    const cardsDirectory = new Directory(Paths.document, 'cards');
    cardsDirectory.create({ idempotent: true, intermediates: true });

    const cardDirectory = new Directory(cardsDirectory, input.cardId);
    cardDirectory.create({ idempotent: true, intermediates: true });

    const destination = new File(
      cardDirectory,
      `${input.side}-${input.type}-${input.mediaId}${getExtension(input)}`,
    );

    if (destination.exists) {
      destination.delete();
    }

    const source = new File(input.sourceUri);
    source.copy(destination);

    return {
      uri: destination.uri,
      mimeType: input.mimeType,
    };
  }

  async deleteMany(uris: readonly string[]): Promise<void> {
    for (const uri of uris) {
      try {
        const file = new File(uri);

        if (file.exists) {
          file.delete();
        }
      } catch {
        // Best effort cleanup after a failed SQLite transaction.
      }
    }
  }
}

let localMediaStorage: LocalMediaStorage | null = null;

export function getExpoLocalMediaStorage(): LocalMediaStorage {
  if (!localMediaStorage) {
    localMediaStorage = new ExpoLocalMediaStorage();
  }

  return localMediaStorage;
}
