import i18n from 'i18next';
import { id } from './id';
import initToolGroups from './initToolGroups';
import toolbarButtons from './toolbarButtons';

// Allow this mode by excluding non-imaging modalities such as SR, SEG
// Also, SM is not a simple imaging modalities, so exclude it.
const NON_IMAGE_MODALITIES = ['ECG', 'SEG', 'RTSTRUCT', 'RTPLAN', 'PR'];

const ohif = {
  layout: '@ohif/extension-default.layoutTemplateModule.viewerLayout',
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  thumbnailList: '@ohif/extension-default.panelModule.seriesList',
  wsiSopClassHandler:
    '@ohif/extension-cornerstone.sopClassHandlerModule.DicomMicroscopySopClassHandler',
};

const cornerstone = {
  measurements: '@ohif/extension-cornerstone.panelModule.panelMeasurement',
  segmentation: '@ohif/extension-cornerstone.panelModule.panelSegmentation',
};

const tracked = {
  measurements: '@ohif/extension-measurement-tracking.panelModule.trackedMeasurements',
  thumbnailList: '@ohif/extension-measurement-tracking.panelModule.seriesList',
  viewport: '@ohif/extension-measurement-tracking.viewportModule.cornerstone-tracked',
};

const dicomsr = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-sr.sopClassHandlerModule.dicom-sr',
  sopClassHandler3D: '@ohif/extension-cornerstone-dicom-sr.sopClassHandlerModule.dicom-sr-3d',
  viewport: '@ohif/extension-cornerstone-dicom-sr.viewportModule.dicom-sr',
};

const dicomvideo = {
  sopClassHandler: '@ohif/extension-dicom-video.sopClassHandlerModule.dicom-video',
  viewport: '@ohif/extension-dicom-video.viewportModule.dicom-video',
};

const dicompdf = {
  sopClassHandler: '@ohif/extension-dicom-pdf.sopClassHandlerModule.dicom-pdf',
  viewport: '@ohif/extension-dicom-pdf.viewportModule.dicom-pdf',
};

const dicomSeg = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-seg.sopClassHandlerModule.dicom-seg',
  viewport: '@ohif/extension-cornerstone-dicom-seg.viewportModule.dicom-seg',
};

const dicomPmap = {
  sopClassHandler: '@ohif/extension-cornerstone-dicom-pmap.sopClassHandlerModule.dicom-pmap',
  viewport: '@ohif/extension-cornerstone-dicom-pmap.viewportModule.dicom-pmap',
};

const dicomRT = {
  viewport: '@ohif/extension-cornerstone-dicom-rt.viewportModule.dicom-rt',
  sopClassHandler: '@ohif/extension-cornerstone-dicom-rt.sopClassHandlerModule.dicom-rt',
};

const extensionDependencies = {
  // Can derive the versions at least process.env.from npm_package_version
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  '@ohif/extension-measurement-tracking': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-sr': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-seg': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-pmap': '^3.0.0',
  '@ohif/extension-cornerstone-dicom-rt': '^3.0.0',
  '@ohif/extension-dicom-pdf': '^3.0.1',
  '@ohif/extension-dicom-video': '^3.0.1',
};

function modeFactory({ modeConfiguration }) {
  let _activatePanelTriggersSubscriptions = [];
  return {
    // TODO: We're using this as a route segment
    // We should not be.
    id,
    routeName: 'viewer',
    displayName: i18n.t('Modes:Basic Viewer'),
    /**
     * Lifecycle hooks
     */
    onModeEnter: function ({ servicesManager, extensionManager, commandsManager }: withAppTypes) {
      const { measurementService, toolbarService, toolGroupService, hangingProtocolService } =
        servicesManager.services;
      commandsManager.createContext({
        id: 'DEFAULT',
        context: {
          servicesManager,
          hangingProtocolService,
          measurementService,
          toolbarService,
        },
      });

      commandsManager.registerCommand('DEFAULT', 'setHangingProtocol', {
        commandFn: ({ protocolId }) => {
          // Validate protocol ID
          const validProtocols = ['default', 'ctchest', 'mribrain'];

          if (!protocolId) {
            console.error('No protocol ID received');
            return Promise.reject('No protocol ID');
          }

          if (!validProtocols.includes(protocolId)) {
            console.error(`Invalid protocol ID: ${protocolId}`);
            return Promise.reject(`Invalid protocol ID: ${protocolId}`);
          }

          console.log('Attempting to apply protocol:', protocolId);

          // Wrap with Promise and add comprehensive error handling
          return new Promise((resolve, reject) => {
            try {
              // Type assertion to handle potential void return
              const result = hangingProtocolService.setProtocol(protocolId) as unknown;

              // Check if result is potentially a Promise
              if (result && typeof (result as Promise<any>).then === 'function') {
                (result as Promise<any>)
                  .then(() => {
                    console.log('Protocol applied successfully:', protocolId);
                    resolve();
                  })
                  .catch(error => {
                    console.error('Failed to apply protocol:', error);
                    reject(error);
                  });
              } else {
                console.log('Protocol applied successfully:', protocolId);
                resolve(result);
              }
            } catch (error) {
              console.error('Unexpected error applying protocol:', error);
              reject(error);
            }
          });
        },
      });
      measurementService.clearMeasurements();
      initToolGroups(extensionManager, toolGroupService, commandsManager);

      // Ensure dropdown interaction is captured
      toolbarService.addButtons(
        toolbarButtons
          .map(btn => {
            if (['ProtocolSelector', 'ProtocolSelector1', 'ProtocolSelector2'].includes(btn.id)) {
              return {
                ...btn,
                onClick: () => {
                  console.log(`Button clicked: ${btn.id}`);

                  const dropdownElement = document.getElementById(`${btn.id}Dropdown`);
                  if (dropdownElement) {
                    dropdownElement.classList.toggle('show');
                  } else {
                    console.warn(`Dropdown element not found for ${btn.id}`);
                  }
                },
              };
            }

            // Extract protocol options as separate buttons for all ProtocolSelectors
            if (
              ['ProtocolSelector', 'ProtocolSelector1', 'ProtocolSelector2'].includes(btn.id) &&
              btn.props?.items
            ) {
              const protocolButtons = btn.props.items.map(item => ({
                id: `${btn.id}-${item.id}`, // Unique ID for each dropdown item
                label: item.label,
                icon: item.icon,
                onClick: () => {
                  console.log(`Button clicked: ${item.id}`);

                  if (!item.commands || item.commands.length === 0) {
                    console.warn(`No commands found for button: ${item.id}`);
                    return;
                  }

                  // Execute the command
                  const command = item.commands[0];
                  if (command.commandName === 'setHangingProtocol') {
                    const protocolId = command.commandOptions?.protocolId;
                    console.log(`Applying Hanging Protocol: ${protocolId}`);

                    // Run the command
                    commandsManager.runCommand('setHangingProtocol', { protocolId });
                  } else {
                    console.warn('Invalid protocol command for:', item.id);
                  }
                },
              }));

              return [...protocolButtons]; // Merge protocol buttons into the toolbar
            }

            return btn; // Return unchanged button if not a ProtocolSelector
          })
          .flat() // Flatten to merge buttons
      );

      const dropdownElement = document.getElementById('ProtocolSelectorDropdown');
      if (dropdownElement) {
        dropdownElement.addEventListener('change', event => {
          const selectedProtocolId = event.target.value;
          console.log(`Dropdown selected: ${selectedProtocolId}`);
          commandsManager.runCommand('setHangingProtocol', { protocolId: selectedProtocolId });
        });
      }

      toolbarService.createButtonSection('primary', [
        'ProtocolSelector',
        'ProtocolSelector1',
        'ProtocolSelector2',
        'MeasurementTools',
        'Zoom',
        'Pan',
        'TrackballRotate',
        'WindowLevel',
        'Capture',
        'Layout',
        'Crosshairs',
        'MoreTools',
      ]);

      toolbarService.createButtonSection('measurementSection', [
        'Length',
        'Bidirectional',
        'ArrowAnnotate',
        'EllipticalROI',
        'RectangleROI',
        'CircleROI',
        'PlanarFreehandROI',
        'SplineROI',
        'LivewireContour',
      ]);

      toolbarService.createButtonSection('moreToolsSection', [
        'Reset',
        'rotate-right',
        'flipHorizontal',
        'ImageSliceSync',
        'ReferenceLines',
        'ImageOverlayViewer',
        'StackScroll',
        'invert',
        'Probe',
        'Cine',
        'Angle',
        'CobbAngle',
        'Magnify',
        'CalibrationLine',
        'TagBrowser',
        'AdvancedMagnify',
        'UltrasoundDirectionalTool',
        'WindowLevelRegion',
      ]);
    },
    onModeExit: ({ servicesManager }: withAppTypes) => {
      const {
        toolGroupService,
        syncGroupService,
        segmentationService,
        cornerstoneViewportService,
        uiDialogService,
        uiModalService,
      } = servicesManager.services;

      _activatePanelTriggersSubscriptions.forEach(sub => sub.unsubscribe());
      _activatePanelTriggersSubscriptions = [];

      uiDialogService.hideAll();
      uiModalService.hide();
      toolGroupService.destroy();
      syncGroupService.destroy();
      segmentationService.destroy();
      cornerstoneViewportService.destroy();
    },
    validationTags: {
      study: [],
      series: [],
    },

    isValidMode: function ({ modalities }) {
      const modalities_list = modalities.split('\\');

      // Exclude non-image modalities
      return {
        valid: !!modalities_list.filter(modality => NON_IMAGE_MODALITIES.indexOf(modality) === -1)
          .length,
        description:
          'The mode does not support studies that ONLY include the following modalities: SM, ECG, SEG, RTSTRUCT',
      };
    },
    routes: [
      {
        path: 'longitudinal',
        /*init: ({ servicesManager, extensionManager }) => {
          //defaultViewerRouteInit
        },*/
        layoutTemplate: () => {
          return {
            id: ohif.layout,
            props: {
              leftPanels: [tracked.thumbnailList],
              leftPanelResizable: true,
              rightPanels: [cornerstone.segmentation, tracked.measurements],
              rightPanelClosed: true,
              rightPanelResizable: true,
              viewports: [
                {
                  namespace: tracked.viewport,
                  displaySetsToDisplay: [
                    ohif.sopClassHandler,
                    dicomvideo.sopClassHandler,
                    dicomsr.sopClassHandler3D,
                    ohif.wsiSopClassHandler,
                  ],
                },
                {
                  namespace: dicomsr.viewport,
                  displaySetsToDisplay: [dicomsr.sopClassHandler],
                },
                {
                  namespace: dicompdf.viewport,
                  displaySetsToDisplay: [dicompdf.sopClassHandler],
                },
                {
                  namespace: dicomSeg.viewport,
                  displaySetsToDisplay: [dicomSeg.sopClassHandler],
                },
                {
                  namespace: dicomPmap.viewport,
                  displaySetsToDisplay: [dicomPmap.sopClassHandler],
                },
                {
                  namespace: dicomRT.viewport,
                  displaySetsToDisplay: [dicomRT.sopClassHandler],
                },
              ],
            },
          };
        },
      },
    ],
    extensions: extensionDependencies,
    // Default protocol gets self-registered by default in the init
    // hangingProtocolService: {
    //   protocols: ['default', 'ct-chest', 'mri-brain'],
    //   defaultProtocol: 'default',
    //   autoProtocol: true,
    //   protocolMatchingRules: [
    //     {
    //       id: 'ct-chest',
    //       modality: 'CT',
    //       bodyPart: 'CHEST',
    //     },
    //     {
    //       id: 'mri-brain',
    //       modality: 'MR',
    //       bodyPart: 'BRAIN',
    //     },
    //   ],
    // },
    hangingProtocolService: {
      protocols: ['default', 'ct-chest', 'mri-brain'],
      defaultProtocol: 'default',
      autoProtocol: true,
      protocolMatchingRules: [
        {
          id: 'ct-chest',
          modality: 'CT',
          bodyPart: 'CHEST',
          stages: [
            {
              name: 'ct-chest-mpr',
              viewportStructure: {
                layoutType: 'grid',
                properties: {
                  rows: 1,
                  columns: 3,
                },
              },
              viewports: [
                {
                  viewportOptions: {
                    viewportType: 'volume',
                    orientation: 'axial',
                    toolGroupId: 'default',
                  },
                },
                {
                  viewportOptions: {
                    viewportType: 'volume',
                    orientation: 'sagittal',
                    toolGroupId: 'default',
                  },
                },
                {
                  viewportOptions: {
                    viewportType: 'volume',
                    orientation: 'coronal',
                    toolGroupId: 'default',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'mri-brain',
          modality: 'MR',
          bodyPart: 'BRAIN',
          stages: [
            {
              name: 'mri-brain-multisequence',
              viewportStructure: {
                layoutType: 'grid',
                properties: {
                  rows: 2,
                  columns: 2,
                },
              },
              viewports: [
                {
                  viewportOptions: {
                    viewportType: 'stack',
                    toolGroupId: 'default',
                  },
                  displaySets: [
                    {
                      seriesMatchingRules: [
                        { attribute: 'SeriesDescription', constraint: { contains: 'T1' } },
                      ],
                    },
                  ],
                },
                {
                  viewportOptions: {
                    viewportType: 'stack',
                    toolGroupId: 'default',
                  },
                  displaySets: [
                    {
                      seriesMatchingRules: [
                        { attribute: 'SeriesDescription', constraint: { contains: 'T2' } },
                      ],
                    },
                  ],
                },
                {
                  viewportOptions: {
                    viewportType: 'stack',
                    toolGroupId: 'default',
                  },
                  displaySets: [
                    {
                      seriesMatchingRules: [
                        { attribute: 'SeriesDescription', constraint: { contains: 'FLAIR' } },
                      ],
                    },
                  ],
                },
                // Fourth viewport intentionally left empty for 2x2 layout
                {
                  viewportOptions: {
                    viewportType: 'stack',
                    toolGroupId: 'default',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // Order is important in sop class handlers when two handlers both use
    // the same sop class under different situations.  In that case, the more
    // general handler needs to come last.  For this case, the dicomvideo must
    // come first to remove video transfer syntax before ohif uses images
    sopClassHandlers: [
      dicomvideo.sopClassHandler,
      dicomSeg.sopClassHandler,
      dicomPmap.sopClassHandler,
      ohif.sopClassHandler,
      ohif.wsiSopClassHandler,
      dicompdf.sopClassHandler,
      dicomsr.sopClassHandler3D,
      dicomsr.sopClassHandler,
      dicomRT.sopClassHandler,
    ],
    ...modeConfiguration,
  };
}

const mode = {
  id,
  modeFactory,
  extensionDependencies,
};

export default mode;
export { initToolGroups, toolbarButtons };
