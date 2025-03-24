export const officialPlugins = [
  {
    name: 'IED',
    src: '/plugins/src/editors/IED.js',
    icon: 'developer_board',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Substation',
    src: '/plugins/src/editors/Substation.js',
    icon: 'margin',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Single Line Diagram',
    src: '/plugins/src/editors/SingleLineDiagram.js',
    icon: 'edit',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscriber Message Binding (GOOSE)',
    src: '/plugins/src/editors/GooseSubscriberMessageBinding.js',
    icon: 'link',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscriber Data Binding (GOOSE)',
    src: '/plugins/src/editors/GooseSubscriberDataBinding.js',
    icon: 'link',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscriber Later Binding (GOOSE)',
    src: '/plugins/src/editors/GooseSubscriberLaterBinding.js',
    icon: 'link',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscriber Message Binding (SMV)',
    src: '/plugins/src/editors/SMVSubscriberMessageBinding.js',
    icon: 'link',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscriber Data Binding (SMV)',
    src: '/plugins/src/editors/SMVSubscriberDataBinding.js',
    icon: 'link',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscriber Later Binding (SMV)',
    src: '/plugins/src/editors/SMVSubscriberLaterBinding.js',
    icon: 'link',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Communication',
    src: '/plugins/src/editors/Communication.js',
    icon: 'settings_ethernet',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: '104',
    src: '/plugins/src/editors/Protocol104.js',
    icon: 'settings_ethernet',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Templates',
    src: '/plugins/src/editors/Templates.js',
    icon: 'copy_all',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'CoMPAS Versions',
    src: '/src/compas-editors/CompasVersions.js',
    icon: 'copy_all',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Publisher',
    src: '/external-plugins/oscd-publisher/oscd-publisher.js',
    icon: 'publish',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Communication Explorer',
    src: '/external-plugins/oscd-plugins/communication-explorer/0.0.31/index.js',
    icon: 'lan',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Template Generator',
    src: '/external-plugins/oscd-template-generator/oscd-template-generator.js',
    icon: 'copy_all',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Cleanup',
    src: '/plugins/src/editors/Cleanup.js',
    icon: 'cleaning_services',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true,
  },
  {
    name: 'Subscribe (Later Binding)',
    src: '/external-plugins/oscd-subscriber-later-binding/oscd-subscriber-later-binding.js',
    icon: 'link',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true
  },
  {
    name: 'Template Update',
    src: '/external-plugins/scl-template-update/scl-template-update.js',
    icon: 'copy_all',
    activeByDefault: false,
    kind: 'editor',
    requireDoc: true
  },
  {
    name: 'Open project',
    src: '/src/menu/CompasOpen.js',
    icon: 'folder_open',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: false,
    position: 'top',
  },
  {
    name: 'New project',
    src: '/plugins/src/menu/NewProject.js',
    icon: 'create_new_folder',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: false,
    position: 'top',
  },
  {
    name: 'Project from CIM',
    src: '/src/menu/CompasCimMapping.js',
    icon: 'input',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: false,
    position: 'top',
  },
  {
    name: 'Import from API',
    src: '/src/menu/CompasImportFromApi.js',
    icon: 'cloud_download',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: false,
    position: 'top',
  },
  {
    name: 'Save project',
    src: '/src/menu/CompasSave.js',
    icon: 'save',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'top',
  },
  {
    name: 'Save project as',
    src: '/src/menu/CompasSaveAs.js',
    icon: 'save',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'top',
  },
  {
    name: 'Save as version',
    src: '/src/menu/CompasSaveAsVersion.js',
    icon: 'save',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'top',
  },
  {
    name: '[WIP] Validate using OCL',
    src: '/src/validators/CompasValidateSchema.js',
    icon: 'rule_folder',
    activeByDefault: false,
    kind: 'validator'
  },
  {
    name: 'Validate Schema',
    src: '/plugins/src/validators/ValidateSchema.js',
    icon: 'rule_folder',
    activeByDefault: true,
    kind: 'validator',
  },
  {
    name: 'Validate Templates',
    src: '/plugins/src/validators/ValidateTemplates.js',
    icon: 'rule_folder',
    activeByDefault: true,
    kind: 'validator',
  },
  {
    name: 'Import IEDs',
    src: '/src/menu/CompasImportIEDs.js',
    icon: 'snippet_folder',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Create Virtual IED',
    src: '/plugins/src/menu/VirtualTemplateIED.js',
    icon: 'developer_board',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Subscriber Update',
    src: '/plugins/src/menu/SubscriberInfo.js',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Update desc (ABB)',
    src: '/plugins/src/menu/UpdateDescriptionABB.js',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Update desc (SEL)',
    src: '/plugins/src/menu/UpdateDescriptionSEL.js',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Merge Project',
    src: '/src/menu/CompasMerge.js',
    icon: 'merge_type',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Update Substation',
    src: '/src/menu/CompasUpdateSubstation.js',
    icon: 'merge_type',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Compare IED',
    src: '/src/menu/CompasCompareIED.js',
    icon: 'compare_arrows',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Auto Align SLD',
    src: '/src/menu/CompasAutoAlignment.js',
    icon: 'dashboard',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Export IED Params',
    src: '/src/menu/ExportIEDParams.js',
    icon: 'download',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Locamation VMU',
    src: '/src/menu/LocamationVMU.js',
    icon: 'edit_note',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Show SCL History',
    src: '/plugins/src/menu/SclHistory.js',
    icon: 'history_toggle_off',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'bottom',
  },
  {
    name: 'CoMPAS Settings',
    src: '/src/menu/CompasSettings.js',
    icon: 'settings',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: false,
    position: 'bottom',
  },
  {
    name: 'Help',
    src: '/plugins/src/menu/Help.js',
    icon: 'help',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: false,
    position: 'bottom',
  },
  {
    name: 'Export Communication Section',
    src: '/plugins/src/menu/ExportCommunication.js',
    icon: 'sim_card_download',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Sitipe',
    src: '/src/compas-editors/Sitipe.js',
    icon: 'precision_manufacturing',
    activeByDefault: true,
    kind: 'editor',
    requireDoc: true
  },
  {
    name: 'Autogen Substation',
    src: '/src/compas-editors/autogen-substation.js',
    icon: 'playlist_add_circle',
    activeByDefault: true,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
  {
    name: 'Export IEC 104 CSV',
    src: '/plugins/src/menu/Export104.js',
    icon: 'sim_card_download',
    activeByDefault: false,
    kind: 'menu',
    requireDoc: true,
    position: 'middle',
  },
];
