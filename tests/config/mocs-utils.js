import crypto from 'crypto';

export const defineCryptoRandom = (global) => {
    if(!global.self.crypto){
        Object.defineProperty(global.self, 'crypto', {
            value: {
              getRandomValues: (arr) => crypto.randomBytes(arr.length)
            }
        });
    }
}