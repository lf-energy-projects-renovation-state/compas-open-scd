import { pluginTag } from '@compas-oscd/open-scd/dist/plugin-tag.js';

// editor plugins
import { default as Substation } from '@compas-oscd/plugins/dist/editors/Substation.js';
// import { default as SingleLineDiagram } from '@compas-oscd/plugins/dist/editors/SingleLineDiagram.js';
import { default as GooseSubscriberMessageBinding } from '@compas-oscd/plugins/dist/editors/GooseSubscriberMessageBinding.js';
import { default as GooseSubscriberDataBinding } from '@compas-oscd/plugins/dist/editors/GooseSubscriberDataBinding.js';
import { default as SMVSubscriberMessageBinding } from '@compas-oscd/plugins/dist/editors/SMVSubscriberMessageBinding.js';
import { default as SMVSubscriberDataBinding } from '@compas-oscd/plugins/dist/editors/SMVSubscriberDataBinding.js';
import { default as Communication } from '@compas-oscd/plugins/dist/editors/Communication.js';
import { default as Protocol104 } from '@compas-oscd/plugins/dist/editors/Protocol104.js';
import { default as Templates } from '@compas-oscd/plugins/dist/editors/Templates.js';
import { default as Cleanup } from '@compas-oscd/plugins/dist/editors/Cleanup.js';
// validator plugins
import { default as ValidateSchema } from '@compas-oscd/plugins/dist/validators/ValidateSchema.js';
import { default as ValidateTemplates } from '@compas-oscd/plugins/dist/validators/ValidateTemplates.js';
// menu plugins
import { default as NewProject } from '@compas-oscd/plugins/dist/menu/NewProject.js';
import { default as VirtualTemplateIED } from '@compas-oscd/plugins/dist/menu/VirtualTemplateIED.js';
import { default as SubscriberInfo } from '@compas-oscd/plugins/dist/menu/SubscriberInfo.js';
import { default as UpdateDescriptionABB } from '@compas-oscd/plugins/dist/menu/UpdateDescriptionABB.js';
import { default as UpdateDescriptionSEL } from '@compas-oscd/plugins/dist/menu/UpdateDescriptionSEL.js';
import { default as SclHistory } from '@compas-oscd/plugins/dist/menu/SclHistory.js';
import { default as Help } from '@compas-oscd/plugins/dist/menu/Help.js';
import { default as ExportCommunication } from '@compas-oscd/plugins/dist/menu/ExportCommunication.js';

export enum OscdPluginSrc {
  Substation = '/oscd-plugins/editors/Substation.js',
  // SingleLineDiagram = '/oscd-plugins/editors/SingleLineDiagram.js',
  GooseSubscriberMessageBinding = '/oscd-plugins/editors/GooseSubscriberMessageBinding.js',
  GooseSubscriberDataBinding = '/oscd-plugins/editors/GooseSubscriberDataBinding.js',
  SMVSubscriberMessageBinding = '/oscd-plugins/editors/SMVSubscriberMessageBinding.js',
  SMVSubscriberDataBinding = '/oscd-plugins/editors/SMVSubscriberDataBinding.js',
  Communication = '/oscd-plugins/editors/Communication.js',
  Protocol104 = '/oscd-plugins/editors/Protocol104.js',
  Templates = '/oscd-plugins/editors/Templates.js',
  Cleanup = '/oscd-plugins/editors/Cleanup.js',
  ValidateSchema = '/oscd-plugins/validators/ValidateSchema.js',
  ValidateTemplates = '/oscd-plugins/validators/ValidateTemplates.js',
  NewProject = '/oscd-plugins/menu/NewProject.js',
  VirtualTemplateIED = '/oscd-plugins/menu/VirtualTemplateIED.js',
  SubscriberInfo = '/oscd-plugins/menu/SubscriberInfo.js',
  UpdateDescriptionABB = '/oscd-plugins/menu/UpdateDescriptionABB.js',
  UpdateDescriptionSEL = '/oscd-plugins/menu/UpdateDescriptionSEL.js',
  SclHistory = '/oscd-plugins/menu/SclHistory.js',
  Help = '/oscd-plugins/menu/Help.js',
  ExportCommunication = '/oscd-plugins/menu/ExportCommunication.js'
}

const plugins: { [key in OscdPluginSrc]: CustomElementConstructor } = {
  [OscdPluginSrc.Substation]: Substation,
  // [OscdPluginSrc.SingleLineDiagram]: SingleLineDiagram,
  [OscdPluginSrc.GooseSubscriberMessageBinding]: GooseSubscriberMessageBinding,
  [OscdPluginSrc.GooseSubscriberDataBinding]: GooseSubscriberDataBinding,
  [OscdPluginSrc.SMVSubscriberMessageBinding]: SMVSubscriberMessageBinding,
  [OscdPluginSrc.SMVSubscriberDataBinding]: SMVSubscriberDataBinding,
  [OscdPluginSrc.Communication]: Communication,
  [OscdPluginSrc.Protocol104]: Protocol104,
  [OscdPluginSrc.Templates]: Templates,
  [OscdPluginSrc.Cleanup]: Cleanup,
  [OscdPluginSrc.ValidateSchema]: ValidateSchema,
  [OscdPluginSrc.ValidateTemplates]: ValidateTemplates,
  [OscdPluginSrc.NewProject]: NewProject,
  [OscdPluginSrc.VirtualTemplateIED]: VirtualTemplateIED,
  [OscdPluginSrc.SubscriberInfo]: SubscriberInfo,
  [OscdPluginSrc.UpdateDescriptionABB]: UpdateDescriptionABB,
  [OscdPluginSrc.UpdateDescriptionSEL]: UpdateDescriptionSEL,
  [OscdPluginSrc.SclHistory]: SclHistory,
  [OscdPluginSrc.Help]: Help,
  [OscdPluginSrc.ExportCommunication]: ExportCommunication
};

export function registerOscdPlugins() {
  for (const [src, pluginConstructor] of Object.entries(plugins)) {
    const tag = pluginTag(src);

    customElements.define(tag, pluginConstructor);
  }
}
