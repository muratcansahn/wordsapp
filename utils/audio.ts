type NoopSound = {
  playAsync: () => Promise<void>;
  replayAsync: () => Promise<void>;
  unloadAsync: () => Promise<void>;
};

const noopSound: NoopSound = {
  playAsync: async () => {},
  replayAsync: async () => {},
  unloadAsync: async () => {},
};

export const Audio = {
  Sound: {
    createAsync: async (_source: unknown): Promise<{ sound: NoopSound }> => ({
      sound: noopSound,
    }),
  },
  setAudioModeAsync: async (_mode: unknown): Promise<void> => {},
};
