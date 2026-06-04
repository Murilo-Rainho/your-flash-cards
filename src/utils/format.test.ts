import { formatRecordingDuration } from './format';

describe('formatRecordingDuration', () => {
  it('formats milliseconds as m:ss', () => {
    expect(formatRecordingDuration(0)).toBe('0:00');
    expect(formatRecordingDuration(5_000)).toBe('0:05');
    expect(formatRecordingDuration(65_000)).toBe('1:05');
    expect(formatRecordingDuration(125_400)).toBe('2:05');
  });

  it('clamps negative durations to zero', () => {
    expect(formatRecordingDuration(-1_000)).toBe('0:00');
  });
});
