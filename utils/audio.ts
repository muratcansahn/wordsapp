/**
 * Compatibility adapter over `expo-audio`.
 *
 * The three call sites (`app/writing.tsx`, `app/quiz.tsx`,
 * `components/screen/dashboard/index.tsx`) were written against the old
 * `expo-av`-style `Audio.Sound.createAsync(...)` API. Rather than touching
 * those call sites, this file adapts `expo-audio`'s real API (`createAudioPlayer`,
 * `AudioPlayer#play/seekTo/remove`, the `playbackStatusUpdate` event, and
 * `setAudioModeAsync`) to match the exact shape already in use:
 *   - `Audio.Sound.createAsync(source, initialStatus?) -> { sound }`
 *   - `sound.playAsync()` / `sound.replayAsync()` / `sound.unloadAsync()`
 *   - `sound.setOnPlaybackStatusUpdate(callback)`
 *   - `Audio.setAudioModeAsync(mode)`
 */
import {
  createAudioPlayer,
  setAudioModeAsync as expoSetAudioModeAsync,
  type AudioMode,
  type AudioSource,
  type AudioStatus,
} from 'expo-audio';

// Legacy (expo-av-shaped) playback status the call sites actually read from.
type PlaybackStatus = {
  isLoaded: boolean;
  isPlaying: boolean;
  didJustFinish: boolean;
  positionMillis: number;
};

type StatusCallback = (status: PlaybackStatus) => void;

type Sound = {
  playAsync: () => Promise<void>;
  replayAsync: () => Promise<void>;
  unloadAsync: () => Promise<void>;
  setOnPlaybackStatusUpdate: (callback: StatusCallback) => void;
};

type CreateAsyncOptions = {
  shouldPlay?: boolean;
};

const toPlaybackStatus = (status: AudioStatus): PlaybackStatus => ({
  isLoaded: status.isLoaded,
  isPlaying: status.playing,
  didJustFinish: status.didJustFinish,
  positionMillis: status.currentTime * 1000,
});

const createSound = (source: AudioSource, initialStatus?: CreateAsyncOptions): Sound => {
  const player = createAudioPlayer(source);
  let statusCallback: StatusCallback | null = null;

  const subscription = player.addListener('playbackStatusUpdate', (status) => {
    statusCallback?.(toPlaybackStatus(status));
  });

  if (initialStatus?.shouldPlay) {
    player.play();
  }

  return {
    playAsync: async () => {
      player.play();
    },
    replayAsync: async () => {
      await player.seekTo(0);
      player.play();
    },
    unloadAsync: async () => {
      subscription.remove();
      player.remove();
    },
    setOnPlaybackStatusUpdate: (callback) => {
      statusCallback = callback;
    },
  };
};

// Legacy (expo-av-shaped) audio mode config the call sites actually pass.
type LegacyAudioMode = {
  playsInSilentModeIOS?: boolean;
  staysActiveInBackground?: boolean;
  shouldDuckAndroid?: boolean;
  allowsRecordingIOS?: boolean;
} & Partial<AudioMode>;

const setAudioModeAsync = async (mode: LegacyAudioMode): Promise<void> => {
  const mapped: Partial<AudioMode> = {
    ...mode,
    playsInSilentMode: mode.playsInSilentMode ?? mode.playsInSilentModeIOS,
    shouldPlayInBackground: mode.shouldPlayInBackground ?? mode.staysActiveInBackground,
    allowsRecording: mode.allowsRecording ?? mode.allowsRecordingIOS,
  };
  await expoSetAudioModeAsync(mapped);
};

export const Audio = {
  Sound: {
    createAsync: async (
      source: AudioSource,
      initialStatus?: CreateAsyncOptions
    ): Promise<{ sound: Sound }> => ({
      sound: createSound(source, initialStatus),
    }),
  },
  setAudioModeAsync,
};
