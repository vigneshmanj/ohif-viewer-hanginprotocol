<h1>Hanging Protocol Toolbar Implementation</h2>

This project enhances the OHIF Viewer by adding a Hanging Protocol Toolbar feature that allows users to switch between predefined imaging protocols (e.g., CT Chest, MRI Brain) through toolbar buttons.

<h2>The implementation provides:</h2>
- Protocol-specific viewport configurations (Orientation, Tool Group, Synchronization)
- Toolbar buttons with active highlighting
- Protocol switching logic with validation
- Error handling and logging for protocol changes

<h2>🚀 Features</h2>
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

<h2>🛠️ Hanging Protocol Configuration</h2>

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



<h2>📄 Command Registration</h2>

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

<h2>🔥 Toolbar Button Configuration</h2>

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

<h2>🧩 How it works</h2>

1. Toolbar Buttons are created with `toolbarService.addButtons()` and associated with protocol IDs.
2. On button click:
   - `setHangingProtocol` command is invoked.
   - Active protocol is validated and applied.
3. The active protocol is highlighted in the UI.
4. Optional: Dropdown support added to select protocols dynamically.

<h2>📂 Project Structure - Hanging Protocol Integration</h2>

<pre>
├── <strong>toolbarbutton.ts</strong>              → modes/longitudinal/src/toolbarButtons.ts
├── <strong>getHangingProtocolModule.js</strong>   → extensions/default/src/getHangingProtocolModule.js
├── <strong>index.ts</strong>                      → modes/longitudinal/src/index.ts
├── <strong>hpCTChest.ts</strong>                  → extensions/default/src/hangingprotocols/hpCTChest.ts
├── <strong>hpMRIBrain.ts</strong>                 → extensions/default/src/hangingprotocols/hpMRIBrain.ts
├── <strong>hpViewports.ts</strong>                → extensions/tmtv/src/utils/hpViewports.ts
</pre>

<h2>Screenshot of the commits made.</h2>



