import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import { Spine } from "pixi-spine";
import { REEL_HEIGHT, SYMBOL_SIZE, SYMBOLS_PER_REEL, REEL_SPACING, REEL_COUNT } from '../GameConfig';

interface SlotMachineInterface {
    container: PIXI.Container;
    reelContainer: PIXI.Container;
    reels: Reel[];
    app: PIXI.Application;
}

export class SlotMachine implements SlotMachineInterface {
    public container: PIXI.Container;
    public reelContainer: PIXI.Container;
    public reels: Reel[];
    public app: PIXI.Application;
    private isSpinning: boolean = false;
    private spinButton: PIXI.Sprite | null = null;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.reelContainer = new PIXI.Container();

        this.reels = [];

        // Center the slot machine
        this.container.x = this.app.screen.width / 2 - ((SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2);
        this.container.y = this.app.screen.height / 2 - ((REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2);

        this.reelContainer.x = this.container.x;
        this.reelContainer.y = this.container.y;
        this.createBackground();

        this.createReels();
        this.createReelMask();

        this.initSpineAnimations();
    }

    public setSpinButton(button: PIXI.Sprite): void {
        this.spinButton = button;
    }

    public update(delta: number): void {
        // Update each reel
        for (const reel of this.reels) {
            reel.update(delta);
        }
    }

    public spin(): void {
        if (this.isSpinning) return;

        this.isSpinning = true;

        // Play spin sound
        sound.play('Reel spin');

        // Disable spin button
        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('button_spin_disabled.png');
            this.spinButton.interactive = false;
        }

        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].startSpin();
            }, i * 100);
        }

        // Stop all reels after a delay
        setTimeout(() => {
            this.stopSpin();
        }, 100 + (this.reels.length - 1) * 220);

    }

    private createReelMask(): void {
        const reelMask = new PIXI.Graphics();
        reelMask.beginFill(0x000000, 0.5);
        reelMask.drawRect(
            -20,
            -20,
            (SYMBOL_SIZE + REEL_SPACING) * SYMBOLS_PER_REEL + REEL_SPACING,
            REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
        );
        reelMask.endFill();
        this.reelContainer.addChild(reelMask);
        this.reelContainer.mask = reelMask;
    }

    private createBackground(): void {
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.5);
        background.drawRect(
            -20,
            -20,
            (SYMBOL_SIZE + REEL_SPACING) * SYMBOLS_PER_REEL + REEL_SPACING, // Width now based on symbols per reel
            REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
        );
        background.endFill();
        this.container.addChild(background);

    }

    private createReels(): void {
        // Create each reel
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel();
            reel.container.y = i * (REEL_HEIGHT + REEL_SPACING) - REEL_SPACING * 2;
            this.reelContainer.addChild(reel.container);
            this.reels.push(reel);
        }
    }

    private stopSpin(): void {
        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].stopSpin();

                // If this is the last reel, check for wins and enable spin button
                if (i === this.reels.length - 1) {
                    setTimeout(() => {
                        this.checkWin();
                        this.isSpinning = false;
                        sound.stop('Reel spin');

                        if (this.spinButton) {
                            this.spinButton.texture = AssetLoader.getTexture('button_spin.png');
                            this.spinButton.interactive = true;
                        }
                    }, 500);
                }
            }, i * 100);
        }
    }

    private checkWin(): void {
        // Simple win check - just for demonstration
        const randomWin = Math.random() < 0.3; // 30% chance of winning

        if (randomWin) {
            sound.play('win');
            console.log('Winner!');

            if (this.winAnimation) {
                this.winAnimation.visible = true;

                if (this.winAnimation.state.hasAnimation('start')) {
                    this.winAnimation.state.setAnimation(0, 'start', false);
                }
            }
        }
    }

    private initSpineAnimations(): void {

        const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
        if (frameSpineData) {
            this.frameSpine = new Spine(frameSpineData.spineData);

            this.frameSpine.y = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
            this.frameSpine.x = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

            if (this.frameSpine.state.hasAnimation('idle')) {
                this.frameSpine.state.setAnimation(0, 'idle', true);
            }

            this.container.addChild(this.frameSpine);
        }

        const winSpineData = AssetLoader.getSpine('big-boom-h.json');
        if (winSpineData) {
            this.winAnimation = new Spine(winSpineData.spineData);

            this.winAnimation.x = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
            this.winAnimation.y = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

            this.winAnimation.visible = false;

            this.container.addChild(this.winAnimation);
        }
    }
}
