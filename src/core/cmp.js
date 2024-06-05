import { CmpApi } from '@iabtechlabtcf/cmpapi';
import { TCModel, TCString, GVL } from '@iabtechlabtcf/core';

import { globalObj } from './global';
import { validConsent } from './api';
import { gvl as gvlJson, mapGvlData } from '../utils/gvl';
import { loadCmpApiStub } from './stub';

const CMP_ID = 1_500;
const CMP_VERSION = 1;

// TODO: Once BE is ready, add this information
// GVL.baseUrl = ''
// GVL.latestFilename = '';
// GVL.languageFilename = ''

/**
 * TODO: Once the BE is ready, maybe put this in a state so you can directly use this in your mapping functions?
 * @type {GVL | undefined}
 */
let gvl;

/**
 * @type {CmpApi | undefined}
 */
let cmpApi;

/**
 * Configures the CMP API asynchronously.
 */
export const configCmpApi = async () => {
    const { _config, _state } = globalObj;

    // Configure the CMP API if the cookie consent should be TCF compliant
    if (!_config.isTcfCompliant) return;
    
    // Check if the CMP API stub was successfully loaded, if not, load it first
    if (!_state._isCmpApiStubLoaded) {
        loadCmpApiStub();
    }

    _state._gvlData = mapGvlData(_config.tcfComplianceConfig?.disclosedVendorIds);

    // TODO: Loading the local GVL json for now. Once BE is ready, refactor this logic around GVL
    gvl = new GVL(gvlJson);

    cmpApi = new CmpApi(CMP_ID, CMP_VERSION, true);
    _state._isCmpApiLoaded = true;

    updateTCString();
};

/**
 * Updates the TC string with the new cookie values.
 */
export const updateTCString = () => {
    const { _config } = globalObj;

    // Update the TC string if the cookie consent should be TCF compliant
    if (!_config.isTcfCompliant) return;

    const consentIsValid = validConsent();

    if (!consentIsValid || !gvl || !cmpApi) {
        cmpApi.update('', true);

        return;
    }

    const tcModel = new TCModel(gvl);
    tcModel.isServiceSpecific = true;

    // TODO: Once BE is ready, refactor this logic GVL promise resolving
    // tcModel.gvl.readyPromise.then(() => {

    // }).catch(err => {

    // });

    const { _savedCookieContent, _gvlData } = globalObj._state;

    // Set consent data based on the content saved in the cookie
    tcModel.vendorsDisclosed.set(_gvlData.vendorIds);
    tcModel.vendorConsents.set(_savedCookieContent.vendorIds);
    tcModel.purposeConsents.set(_savedCookieContent.purposeIds);
    tcModel.specialFeatureOptins.set(_savedCookieContent.specialFeatureIds);

    // Set if the CMP uses non standard texts
    tcModel.useNonStandardTexts = false;

    // Set CMP identifiers
    tcModel.cmpId = CMP_ID;
    tcModel.cmpVersion = CMP_VERSION;

    // Encode TCModel to TCString and update the CMP API
    const encodedString = TCString.encode(tcModel);
    cmpApi.update(encodedString, false);
};