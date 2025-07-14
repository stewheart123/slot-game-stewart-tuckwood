import { Howl } from 'howler';

export const soundCache: Record<string, Howl> = {};

export const sound = {
    add: (alias: string, url: string): void => {
        soundCache[alias] = new Howl({
            src: [url],
            preload: true
        });
    },
    
    play: (alias: string): void => {
        soundCache[alias]?.play();
    },

    stop: (alias: string): void => {
        soundCache[alias]?.stop();
    }
};
