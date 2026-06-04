import { useCallback, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import type { CardType } from '@/constants/cardTypes';
import { MEDIA_TYPES, type MediaSide } from '@/domain/entities/Media';

import { mediaGroup, sanitizeMediaForType } from '../services/cardMedia';
import type { CreateCardMediaInput } from '../services/createCard';

type UseCardMediaParams = {
  selectedType: CardType;
  onError: (message: string | null) => void;
  onChange: () => void;
};

export type CardMedia = {
  media: CreateCardMediaInput[];
  setSideMedia: (nextMedia: CreateCardMediaInput) => void;
  removeSideMedia: (side: MediaSide, type: CreateCardMediaInput['type']) => void;
  clearMedia: () => void;
  sanitizeForType: (type: CardType) => void;
  pickImage: (side: MediaSide, source: 'library' | 'camera') => Promise<void>;
  pickAudio: (side: MediaSide) => Promise<void>;
};

/** Estado e seleção de mídia (imagem/áudio) do card em criação. */
export function useCardMedia({ selectedType, onError, onChange }: UseCardMediaParams): CardMedia {
  const [media, setMedia] = useState<CreateCardMediaInput[]>([]);

  const setSideMedia = useCallback(
    (nextMedia: CreateCardMediaInput) => {
      setMedia((current) =>
        sanitizeMediaForType(selectedType, [
          ...current.filter(
            (item) =>
              item.side !== nextMedia.side || mediaGroup(item.type) !== mediaGroup(nextMedia.type),
          ),
          nextMedia,
        ]),
      );
      onChange();
    },
    [selectedType, onChange],
  );

  const removeSideMedia = useCallback((side: MediaSide, type: CreateCardMediaInput['type']) => {
    setMedia((current) =>
      current.filter((item) => item.side !== side || mediaGroup(item.type) !== mediaGroup(type)),
    );
  }, []);

  const clearMedia = useCallback(() => setMedia([]), []);

  const sanitizeForType = useCallback((type: CardType) => {
    setMedia((current) => sanitizeMediaForType(type, current));
  }, []);

  const pickImage = useCallback(
    async (side: MediaSide, source: 'library' | 'camera') => {
      onError(null);
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        onError('Permissao de imagem negada.');
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: false,
              quality: 0.9,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: false,
              quality: 0.9,
            });

      const asset = result.canceled ? null : result.assets[0];

      if (!asset) {
        return;
      }

      setSideMedia({
        side,
        type: MEDIA_TYPES.IMAGE,
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? undefined,
      });
    },
    [onError, setSideMedia],
  );

  const pickAudio = useCallback(
    async (side: MediaSide) => {
      onError(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });
      const asset = result.canceled ? null : result.assets[0];

      if (!asset) {
        return;
      }

      setSideMedia({
        side,
        type: MEDIA_TYPES.AUDIO,
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'audio/mpeg',
        fileName: asset.name,
      });
    },
    [onError, setSideMedia],
  );

  return {
    media,
    setSideMedia,
    removeSideMedia,
    clearMedia,
    sanitizeForType,
    pickImage,
    pickAudio,
  };
}
