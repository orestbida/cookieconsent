import { api } from './core/api';
import { setWindowData } from './core/config-init';

export default {
    init: () => {
        setWindowData();
        return api;
    }
};