import * as PIXI from 'pixi.js';
import { textureCache } from '../utils/AssetLoader';
import { REEL_SPACING, SLOWDOWN_RATE, SPIN_START_SPEED, SYMBOL_SIZE, SYMBOLS_PER_REEL } from '../GameConfig';

export class Reel {
    public container: PIXI.Container;
    private symbols: PIXI.Sprite[];
    private speed: number = 0;
    private isSpinning: boolean = false;
    private spinCount: number = 0;
    private snappingRange = 25;

    constructor() {
        this.container = new PIXI.Container();
        this.symbols = [];

        this.populateRandomSymbols();
        this.populateReelContainer();
    }

    private populateRandomSymbols(): void {
        for (var i = 0; i < SYMBOLS_PER_REEL; i++) {
            this.symbols.push(this.createRandomSymbol());
        }
    }

    private populateReelContainer(): void {
        this.symbols.forEach((symbol, index) => {
            this.container.addChild(symbol);
            symbol.position.x += ((SYMBOL_SIZE + REEL_SPACING) * index) - SYMBOL_SIZE * 0.25;
        });
    }

    private createRandomSymbol(): PIXI.Sprite {
        const randomImageSelection = Math.floor(Math.random() * 5 + 1);
        const randomTexture = textureCache[`symbol${randomImageSelection}.png`];
        return new PIXI.Sprite(randomTexture);
    }

    public update(delta: number): void {
        if (!this.isSpinning && this.speed === 0) return;

        this.container.x += delta * this.speed;

        // reset container position to left when its off screen
        if (this.container.x > window.innerWidth) {
            this.container.x = - this.container.width;
            this.spinCount++;
        }

        // If we're stopping, slow down the reel
        if (!this.isSpinning && this.speed > 0 && this.spinCount > 0) {
            this.speed *= SLOWDOWN_RATE;

            // Snap to grid when within range and speed is low
            if (this.container.x <= this.snappingRange && this.container.x >= -this.snappingRange) {
                this.speed = 0;
                this.snapToGrid();
            }
        }
    }

    private snapToGrid(): void {
        this.container.x = 0;
    }

    public startSpin(): void {
        this.isSpinning = true;
        
        this.speed = SPIN_START_SPEED;
    }

    public stopSpin(): void {
        this.isSpinning = false;
        // The reel will gradually slow down in the update method
    }
}
