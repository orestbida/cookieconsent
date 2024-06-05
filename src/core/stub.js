import * as cmpstub from '@iabtechlabtcf/stub';
import { globalObj } from './global';

/**
 * Fires up the stub CMP API.
 */
export const loadCmpApiStub = () => {
    if (!globalObj._state._isCmpApiLoaded && !globalObj._state._isCmpApiStubLoaded) {
        cmpstub();

        globalObj._state._isCmpApiStubLoaded = true;
    }
};

window.onload = loadCmpApiStub;