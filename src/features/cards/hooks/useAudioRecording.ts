import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type AudioPlayer,
} from 'expo-audio';

import type { MediaSide } from '@/domain/entities/Media';

type UseAudioRecordingParams = {
  maxDurationMs: number;
  onError: (message: string | null) => void;
  onComplete: (result: { side: MediaSide; uri: string }) => void;
};

export type AudioRecording = {
  recordingSide: MediaSide | null;
  isRecording: boolean;
  recordingDurationMs: number;
  startRecording: (side: MediaSide) => Promise<void>;
  stopRecording: () => Promise<void>;
  playAudio: (uri: string) => void;
};

/**
 * Gravação e reprodução de áudio local (expo-audio), com auto-stop por duração máxima.
 * Reportar erros via `onError`; entregar a gravação concluída via `onComplete`.
 */
export function useAudioRecording({
  maxDurationMs,
  onError,
  onComplete,
}: UseAudioRecordingParams): AudioRecording {
  const [recordingSide, setRecordingSide] = useState<MediaSide | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const recordingSideRef = useRef<MediaSide | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const clearRecordingTimeout = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      audioPlayerRef.current?.remove();
      clearRecordingTimeout();
    };
  }, [clearRecordingTimeout]);

  const stopRecordingForSide = useCallback(
    async (side: MediaSide) => {
      if (recordingSideRef.current !== side) {
        return;
      }

      clearRecordingTimeout();
      await audioRecorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      recordingSideRef.current = null;
      setRecordingSide(null);

      if (!audioRecorder.uri) {
        onError('Nao foi possivel salvar a gravacao local.');
        return;
      }

      onComplete({ side, uri: audioRecorder.uri });
    },
    [audioRecorder, clearRecordingTimeout, onComplete, onError],
  );

  const startRecording = useCallback(
    async (side: MediaSide) => {
      onError(null);
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        onError('Permissao de microfone negada.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingSideRef.current = side;
      setRecordingSide(side);
      clearRecordingTimeout();
      recordingTimeoutRef.current = setTimeout(() => {
        void stopRecordingForSide(side);
      }, maxDurationMs);
    },
    [audioRecorder, clearRecordingTimeout, maxDurationMs, onError, stopRecordingForSide],
  );

  const stopRecording = useCallback(async () => {
    const side = recordingSideRef.current;

    if (side) {
      await stopRecordingForSide(side);
    }
  }, [stopRecordingForSide]);

  const playAudio = useCallback((uri: string) => {
    audioPlayerRef.current?.remove();
    const player = createAudioPlayer(uri);
    audioPlayerRef.current = player;
    player.seekTo(0);
    player.play();
  }, []);

  return {
    recordingSide,
    isRecording: Boolean(recordingSide),
    recordingDurationMs: recorderState.durationMillis,
    startRecording,
    stopRecording,
    playAudio,
  };
}
