const hpMRIBrain = {
  id: 'mribrain',
  name: 'MRI Brain Protocol',
  locked: false,
  createdDate: '2024-03-26',
  modifiedDate: '2024-03-26',
  availableTo: {},
  editableBy: {},

  protocolMatchingRules: [
    {
      attribute: 'StudyDescription',
      constraint: {
        contains: 'BRAIN',
      },
      required: false,
      weight: 1,
    },
    {
      attribute: 'Modality',
      constraint: {
        equals: 'MR',
      },
      required: true,
      weight: 2,
    },
  ],

  stages: [
    {
      id: 'mriBrainStage',
      name: 'MRI Brain Stage',
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
            viewportId: 'mriT1Axial',
            viewportType: 'stack',
            toolGroupId: 'mriToolGroup',
            initialImageOptions: {
              preset: 'first',
              angle: 10, // Slight tilt for better anatomical view
            },
          },
          displaySets: [
            {
              id: 't1AxialDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            viewportId: 'mriT2Axial',
            viewportType: 'stack',
            toolGroupId: 'mriToolGroup',
            initialImageOptions: {
              preset: 'first',
              angle: 5, // Small adjustment to align with T1
            },
          },
          displaySets: [
            {
              id: 't2AxialDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            viewportId: 'mriFLAIRAxial',
            viewportType: 'stack',
            toolGroupId: 'mriToolGroup',
            initialImageOptions: {
              preset: 'first',
              angle: 0, // Standard orientation for lesion visualization
            },
          },
          displaySets: [
            {
              id: 'flairAxialDisplaySet',
            },
          ],
        },
        {
          viewportOptions: {
            viewportId: 'emptyViewport',
            viewportType: 'none',
          },
          displaySets: [],
        },
      ],
    },
  ],

  displaySetSelectors: {
    t1AxialDisplaySet: {
      seriesMatchingRules: [
        {
          attribute: 'SeriesDescription',
          constraint: {
            contains: 'T1',
          },
          required: false,
          weight: 1,
        },
      ],
    },
    t2AxialDisplaySet: {
      seriesMatchingRules: [
        {
          attribute: 'SeriesDescription',
          constraint: {
            contains: 'T2',
          },
          required: false,
          weight: 1,
        },
      ],
    },
    flairAxialDisplaySet: {
      seriesMatchingRules: [
        {
          attribute: 'SeriesDescription',
          constraint: {
            contains: 'FLAIR',
          },
          required: false,
          weight: 1,
        },
      ],
    },
  },
};

export default hpMRIBrain;
