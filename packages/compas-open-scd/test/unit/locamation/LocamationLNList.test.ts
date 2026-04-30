import {expect, fixture, html} from "@open-wc/testing";

import {MockWizardEditor} from "@compas-oscd/open-scd/dist/test-helper";
import {fetchDoc} from "../compas-wizards/test-support.js";
import {initializeNsdoc, Nsdoc} from "@compas-oscd/open-scd/dist/foundation/nsdoc.js";

import "@compas-oscd/open-scd/dist/test-helper";
import { newWizardEvent } from '@compas-oscd/open-scd/dist/foundation.js';

import {LocamationLNodeListElement, locamationLNListWizard} from "../../../src/locamation/LocamationLNList.js";

import "../../../src/locamation/LocamationLNList.js";

describe('Wizards for Locamation Plugin to select the Logical Node - ', () => {
  let nsdoc: Nsdoc;
  let doc: XMLDocument;
  let lDevice: Element;

  beforeEach(async () => {
    nsdoc = await initializeNsdoc();
    doc = await fetchDoc('/test/testfiles/locamation/LCMTN_VMU_MMS.scd');
  });

  describe('starting screen as wizard - ', async () => {
    let element: MockWizardEditor;

    beforeEach(async () => {
      lDevice = doc.querySelector('LDevice[inst="MU01"]')!

      element = await fixture(html`<mock-wizard-editor></mock-wizard-editor>`);
      const wizard = locamationLNListWizard(lDevice, nsdoc);
      element.dispatchEvent(newWizardEvent(wizard));
      await element.requestUpdate();
    });

    it('looks like the latest snapshot', async () => {
      await expect(element.wizardUI.dialog).dom.to.equalSnapshot();
    });
  });

  describe('starting screen as web component with locamation LN - ', async () => {
    let element: LocamationLNodeListElement;

    beforeEach(async () => {
      lDevice = doc.querySelector('LDevice[inst="MU01"]')!;

      element = await fixture(html`<locamation-ln-list .lDevice="${lDevice}" .nsdoc="${nsdoc}"></locamation-ln-list>`);
      await element.requestUpdate();
    });

    it('looks like the latest snapshot', async () => {
      await expect(element).shadowDom.to.equalSnapshot();
    });
  });

  describe('starting screen as web component without locamation LN - ', async () => {
    let element: LocamationLNodeListElement;

    beforeEach(async () => {
      lDevice = doc.querySelector('LDevice[inst="MU02"]')!;

      element = await fixture(html`<locamation-ln-list .lDevice="${lDevice}" .nsdoc="${nsdoc}"></locamation-ln-list>`);
      await element.requestUpdate();
    });

    it('looks like the latest snapshot', async () => {
      await expect(element).shadowDom.to.equalSnapshot();
    });
  });
});
