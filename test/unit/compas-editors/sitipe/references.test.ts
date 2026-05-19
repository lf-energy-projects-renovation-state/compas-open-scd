import { fixture, html, expect } from '@open-wc/testing';

import { deleteReferences } from '../../../../src/compas-editors/sitipe/references.js';

describe('references', () => {
  let doc: XMLDocument;

  beforeEach(async () => {
    doc = await fetch('/test/testfiles/Sitipe.scd')
      .then(response => response.text())
      .then(str => new DOMParser().parseFromString(str, 'application/xml'));
  });

  it('should delete references', () => {
    const ied = doc.querySelector('IED[name="Vienna_north_Prot"]')!;

    const deletes = deleteReferences(ied);

    expect(deletes.length).to.equal(2);
  });
});
