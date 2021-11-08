# `compas-save`

## `still determining if document exists in CoMPAS`

####   `looks like the latest snapshot`

```html
<compas-divider>
</compas-divider>
<section>
  <h3>
    [compas.save.localTitle]
  </h3>
  <mwc-button label="[compas.save.saveFileButton]">
  </mwc-button>
</section>
<compas-divider>
</compas-divider>
<section>
  <h3>
    [compas.save.compasTitle]
  </h3>
  <compas-loading>
  </compas-loading>
</section>

```

## `new document in compas`

####   `looks like the latest snapshot`

```html
<compas-divider>
</compas-divider>
<section>
  <h3>
    [compas.save.localTitle]
  </h3>
  <mwc-button label="[compas.save.saveFileButton]">
  </mwc-button>
</section>
<compas-divider>
</compas-divider>
<section>
  <h3>
    [compas.save.compasTitle]
  </h3>
  <mwc-textfield
    dialoginitialfocus=""
    id="name"
    label="[scl.name]"
    required=""
    value="station123.scd"
  >
  </mwc-textfield>
  <compas-scltype-radiogroup>
  </compas-scltype-radiogroup>
  <compas-comment>
  </compas-comment>
</section>

```

## `existing document in compas`

####   `looks like the latest snapshot`

```html
<compas-divider>
</compas-divider>
<section>
  <h3>
    [compas.save.localTitle]
  </h3>
  <mwc-button label="[compas.save.saveFileButton]">
  </mwc-button>
</section>
<compas-divider>
</compas-divider>
<section>
  <h3>
    [compas.save.compasTitle]
  </h3>
  <compas-changeset-radiogroup>
  </compas-changeset-radiogroup>
  <compas-comment>
  </compas-comment>
</section>

```
