import type { MediaSide, MediaType } from '@/domain/entities/Media';

export type PersistLocalMediaInput = {
  cardId: string;
  mediaId: string;
  side: MediaSide;
  type: Exclude<MediaType, 'tts'>;
  sourceUri: string;
  mimeType: string;
  fileName?: string;
};

export type PersistedLocalMedia = {
  uri: string;
  mimeType: string;
};

export type LocalMediaStorage = {
  copyToCard(input: PersistLocalMediaInput): Promise<PersistedLocalMedia>;
  deleteMany(uris: readonly string[]): Promise<void>;
};
