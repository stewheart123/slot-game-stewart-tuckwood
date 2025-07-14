import { Reel } from '../Reel';

// Mock PIXI.js
jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    x: 0,
    width: 100,
    position: { x: 0, y: 0 }
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

// Mock GameConfig
jest.mock('../../GameConfig', () => ({
  REEL_SPACING: 10,
  SLOWDOWN_RATE: 0.93,
  SPIN_START_SPEED: 50,
  SYMBOL_SIZE: 150,
  SYMBOLS_PER_REEL: 6
}));

// Mock window object
Object.defineProperty(window, 'innerWidth', {
  value: 1280,
  writable: true
});

describe('Reel', () => {
  let reel: Reel;

  beforeEach(() => {
    reel = new Reel();
  });

  describe('constructor', () => {
    it('should create a reel with container and symbols', () => {
      expect(reel.container).toBeDefined();
      expect((reel as any).symbols).toHaveLength(6); // SYMBOLS_PER_REEL
    });

    it('should initialize with correct default values', () => {
      expect((reel as any).speed).toBe(0);
      expect((reel as any).isSpinning).toBe(false);
      expect((reel as any).spinCount).toBe(0);
    });
  });

  describe('startSpin', () => {
    it('should set isSpinning to true and set speed', () => {
      reel.startSpin();
      
      expect((reel as any).isSpinning).toBe(true);
      expect((reel as any).speed).toBe(50); // SPIN_START_SPEED
    });
  });

  describe('stopSpin', () => {
    it('should set isSpinning to false', () => {
      reel.startSpin();
      expect((reel as any).isSpinning).toBe(true);
      
      reel.stopSpin();
      expect((reel as any).isSpinning).toBe(false);
    });
  });

  describe('update', () => {
    it('should not update when not spinning and speed is 0', () => {
      const initialX = reel.container.x;
      
      reel.update(1);
      
      expect(reel.container.x).toBe(initialX);
    });

    it('should update position when spinning', () => {
      reel.startSpin();
      const initialX = reel.container.x;
      
      reel.update(1);
      
      expect(reel.container.x).toBeGreaterThan(initialX);
    });

    it('should reset position when off screen', () => {
      reel.startSpin();
      reel.container.x = 1300; // Beyond window.innerWidth (1280)
      const initialSpinCount = (reel as any).spinCount;
      
      reel.update(1);
      
      expect(reel.container.x).toBe(-reel.container.width);
      expect((reel as any).spinCount).toBe(initialSpinCount + 1);
    });

    it('should slow down when stopping', () => {
      reel.startSpin();
      (reel as any).isSpinning = false;
      (reel as any).spinCount = 1;
      const initialSpeed = (reel as any).speed;
      
      reel.update(1);
      
      expect((reel as any).speed).toBeLessThan(initialSpeed);
    });

    it('should snap to grid when within range and speed is low', () => {
      reel.startSpin();
      (reel as any).isSpinning = false;
      (reel as any).spinCount = 1;
      (reel as any).speed = 0.5; // Low speed
      reel.container.x = 10; // Within snapping range
      
      reel.update(1);
      
      expect((reel as any).speed).toBe(0);
      expect(reel.container.x).toBe(0);
    });
  });

  describe('symbol creation', () => {
    it('should create the correct number of symbols', () => {
      expect((reel as any).symbols).toHaveLength(6);
    });

    it('should add symbols to container', () => {
      expect(reel.container.addChild).toHaveBeenCalledTimes(6);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple start/stop cycles', () => {
      reel.startSpin();
      reel.stopSpin();
      reel.startSpin();
      
      expect((reel as any).isSpinning).toBe(true);
      expect((reel as any).speed).toBe(50);
    });

    it('should handle rapid updates', () => {
      reel.startSpin();
      
      for (let i = 0; i < 10; i++) {
        reel.update(1);
      }
      
      expect(reel.container.x).toBeGreaterThan(0);
    });
  });
}); 