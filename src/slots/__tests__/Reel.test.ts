import { Reel } from '../Reel';

// Mock PIXI.js
jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    x: 0,
    width: 100
  })),
  Sprite: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 0 },
    texture: null
  }))
}));

// Mock AssetLoader
jest.mock('../../utils/AssetLoader', () => ({
  textureCache: {
    'symbol1.png': { width: 50, height: 50 },
    'symbol2.png': { width: 50, height: 50 },
    'symbol3.png': { width: 50, height: 50 },
    'symbol4.png': { width: 50, height: 50 },
    'symbol5.png': { width: 50, height: 50 }
  }
}));

// Mock SlotMachine constants
jest.mock('../SlotMachine', () => ({
  REEL_SPACING: 10,
  SYMBOL_SIZE: 50,
  SYMBOLS_PER_REEL: 5
}));

describe('Reel', () => {
  let reel: Reel;

  beforeEach(() => {
    reel = new Reel();
  });

  describe('constructor', () => {
    it('should create a reel with container and symbols', () => {
      expect(reel.container).toBeDefined();
    });
  });

  describe('startSpin', () => {
    it('should set isSpinning to true and set speed', () => {
      // Act
      reel.startSpin();

      // Assert
      expect((reel as any).isSpinning).toBe(true);
      expect((reel as any).speed).toBe(50); // SPIN_START_SPEED
    });
  });

  describe('stopSpin', () => {
    it('should set isSpinning to false', () => {
      // Arrange
      reel.startSpin();
      expect((reel as any).isSpinning).toBe(true);

      // Act
      reel.stopSpin();

      // Assert
      expect((reel as any).isSpinning).toBe(false);
    });
  });

  describe('update', () => {
    it('should not update when not spinning and speed is 0', () => {
      // Arrange
      const initialX = reel.container.x;

      // Act
      reel.update(1);

      // Assert
      expect(reel.container.x).toBe(initialX);
    });

    it('should update position when spinning', () => {
      // Arrange
      reel.startSpin();
      const initialX = reel.container.x;

      // Act
      reel.update(1);

      // Assert
      expect(reel.container.x).toBeGreaterThan(initialX);
    });
  });
}); 