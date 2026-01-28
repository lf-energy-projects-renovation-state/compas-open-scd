import { html, LitElement } from 'lit-element';
import { get } from 'lit-translate';

import { oscdHtml } from '@compas-oscd/open-scd/dist/foundation.js';
import { newWizardEvent, Wizard } from '@compas-oscd/open-scd/dist/foundation.js';

import { DocRetrievedEvent } from '../compas/CompasOpen.js';
import { mergeSubstation } from '@openscd/plugins/src/menu/UpdateSubstation.js';

import '../compas/CompasOpen.js';

export default class CompasUpdateSubstationMenuPlugin extends LitElement {
  doc!: XMLDocument;
  parent!: HTMLElement;

  private substationCompasWizard(): Wizard {
    return [
      {
        title: get('compas.updateSubstation.title'),
        content: [
          oscdHtml`<compas-open
            @doc-retrieved=${(evt: DocRetrievedEvent) => {
              mergeSubstation(this, this.doc, evt.detail.doc);
              this.dispatchEvent(newWizardEvent());
            }}
          >
          </compas-open> `,
        ],
      },
    ];
  }

  firstUpdated(): void {
    this.parent = this.parentElement!;
  }

  async run(): Promise<void> {
    this.dispatchEvent(newWizardEvent(this.substationCompasWizard()));
  }
}
