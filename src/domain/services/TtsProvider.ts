export type TtsAvailabilityInput = {
  language: string;
};

export type TtsSpeakInput = {
  text: string;
  language: string;
};

export type TtsProvider = {
  isAvailable(input: TtsAvailabilityInput): Promise<boolean>;
  speak(input: TtsSpeakInput): Promise<void>;
};
