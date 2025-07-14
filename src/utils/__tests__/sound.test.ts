import { sound, soundCache } from '../sound';

// Mock Howler to avoid actual audio during tests
jest.mock('howler', () => ({
  Howl: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    stop: jest.fn()
  }))
}));

describe('Sound Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear the sound cache
    Object.keys(soundCache).forEach(key => delete soundCache[key]);
  });

  describe('add', () => {
    it('should add a sound with the given alias and URL', () => {
      // Arrange
      const alias = 'test-sound';
      const url = 'test-url.mp3';

      // Act
      sound.add(alias, url);

      // Assert
      expect(require('howler').Howl).toHaveBeenCalledWith({
        src: [url],
        preload: true
      });
    });
  });

  describe('play', () => {
    it('should play a sound when it exists', () => {
      // Arrange
      const alias = 'test-sound';
      const mockPlay = jest.fn();
      const mockHowl = { play: mockPlay };
      
      // Add the mock to the sound cache
      soundCache[alias] = mockHowl as any;

      // Act
      sound.play(alias);

      // Assert
      expect(mockPlay).toHaveBeenCalled();
    });

    it('should not crash when playing a non-existent sound', () => {
      // Arrange
      const alias = 'non-existent-sound';
      
      // Ensure sound cache is empty
      Object.keys(soundCache).forEach(key => delete soundCache[key]);

      // Act & Assert - should not throw
      expect(() => sound.play(alias)).not.toThrow();
    });
  });
}); 