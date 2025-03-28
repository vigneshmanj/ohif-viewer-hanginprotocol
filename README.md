Hanging Protocol Toolbar Implementation

This project enhances the OHIF Viewer by adding a Hanging Protocol Toolbar feature that allows users to switch between predefined imaging protocols (e.g., CT Chest, MRI Brain) through toolbar buttons.

The implementation provides:
- Protocol-specific viewport configurations (Orientation, Tool Group, Synchronization)
- Toolbar buttons with active highlighting
- Protocol switching logic with validation
- Error handling and logging for protocol changes

🗂️ Project file location(files to which changes where made)


├── toolbarbutton.ts          modes/longitudinal/src/toolbarButtons.ts
├── getHangingProtocolModule.js extensions/default/src/getHangingProtocolModule.js
├── index.ts                 modes/longitudinal/src/index.ts
├── hpCTChest                extensions/default/src/hangingprotocols/hpCTChest.ts
├── hpMRIBrain               extensions/default/src/hangingprotocols/hpMRIBrain.ts
├── hpViewports.ts           extensions/tmtv/src/utils/hpViewports.ts


🚀 Features
- Toolbar Buttons  
  Easily switch protocols using toolbar buttons:  
  - Default
  - CT Chest
  - MRI Brain

- Active Protocol Highlighting
  Currently selected protocol is visually highlighted in the toolbar.

- Error Handling & Validation  
  Ensures only valid protocol IDs are applied. Logs errors and failures.

- Protocol Viewport Configurations  
  Supports:
  - Axial, Sagittal orientations
  - MRI & CT specific sync options
  - Multi-series display sets

- Dropdown Interaction (Optional)  
  Allows protocol switching via dropdown selection as well.



🛠️ Hanging Protocol Configuration

Each protocol is defined with detailed viewport settings in `hpViewports.ts`:

Example:
```ts
const mriT1Axial: AppTypes.HangingProtocol.Viewport = {
  viewportOptions: {
    viewportId: 'mriT1Axial',
    viewportType: 'stack',
    orientation: 'axial',
    toolGroupId: 'mriToolGroup',
    syncGroups: [cameraPositionSync('mriT1Sync'), voiSync('mriWLSync'), hydrateSegSync],
  },
  displaySets: [{ id: 't1AxialDisplaySet' }],
};
```



📄 Command Registration

In `index.ts`, the `setHangingProtocol` command is registered:

```ts
commandsManager.registerCommand('DEFAULT', 'setHangingProtocol', {
  commandFn: ({ protocolId }) => {
    const validProtocols = ['default', 'ctchest', 'mribrain'];
    if (!validProtocols.includes(protocolId)) {
      console.error(`Invalid protocol ID: ${protocolId}`);
      return Promise.reject(`Invalid protocol ID: ${protocolId}`);
    }
    return hangingProtocolService.setProtocol(protocolId);
  },
});
```

🔥 Toolbar Button Configuration

In `toolbarbutton.ts`:

```ts
const protocolButton1 = {
  id: 'ProtocolSelector1',
  uiType: 'ohif.toolButton',
  props: {
    type: 'tool',
    id: 'ProtocolSelector1',
    icon: 'tool-layout',
    label: 'CT Chest',
    tooltip: 'CT Chest',
    commands: [
      {
        commandName: 'setHangingProtocol',
        commandOptions: { protocolId: 'ctchest' },
        context: 'DEFAULT',
      },
    ],
    evaluateActiveClass: ({ servicesManager }) => {
      const { hangingProtocolService } = servicesManager.services;
      return hangingProtocolService.getActiveProtocol()?.id === 'ctchest' ? 'active' : '';
    },
  },
};
```

🧩 How it works

1. Toolbar Buttons are created with `toolbarService.addButtons()` and associated with protocol IDs.
2. On button click:
   - `setHangingProtocol` command is invoked.
   - Active protocol is validated and applied.
3. The active protocol is highlighted in the UI.
4. Optional: Dropdown support added to select protocols dynamically.




