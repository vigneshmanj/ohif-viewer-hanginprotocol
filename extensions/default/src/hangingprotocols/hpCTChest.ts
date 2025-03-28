const hpCTChest = {
  id: 'ctchest',
  locked: true,
  name: 'CT Chest',
  createdDate: '2024-03-25',
  modifiedDate: '2024-03-25',
  availableTo: {},
  editableBy: {},
  protocolMatchingRules: [
    {
      attribute: 'StudyDescription',
      constraint: {
        contains: 'CHEST',
      },
      required: false,
      weight: 1,
    },
    {
      attribute: 'Modality',
      constraint: {
        equals: 'CT',
      },
      required: true,
      weight: 2,
    },
    {
      attribute: 'BodyPartExamined',
      constraint: {
        contains: 'CHEST',
      },
      required: false,
      weight: 1,
    },
  ],
  stages: [
    {
      id: 'ctChestStage',
      name: 'CT Chest Stage',
      viewportStructure: {
        layoutType: 'grid',
        properties: {
          rows: 1,
          columns: 3,
        },
      },
      viewports: [
        // Axial Viewport
        {
          viewportOptions: {
            viewportId: 'ctAxial',
            viewportType: 'volume',
            orientation: 'axial',
            toolGroupId: 'ctToolGroup',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'cameraPosition',
                id: 'axialSync',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'axialDisplaySet',
            },
          ],
        },
        // Coronal Viewport
        {
          viewportOptions: {
            viewportId: 'ctCoronal',
            viewportType: 'volume',
            orientation: 'coronal',
            toolGroupId: 'ctToolGroup',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'cameraPosition',
                id: 'coronalSync',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'coronalDisplaySet',
            },
          ],
        },
        // Sagittal Viewport
        {
          viewportOptions: {
            viewportId: 'ctSagittal',
            viewportType: 'volume',
            orientation: 'sagittal',
            toolGroupId: 'ctToolGroup',
            initialImageOptions: {
              preset: 'middle',
            },
            syncGroups: [
              {
                type: 'cameraPosition',
                id: 'sagittalSync',
                source: true,
                target: true,
              },
            ],
          },
          displaySets: [
            {
              id: 'sagittalDisplaySet',
            },
          ],
        },
      ],
    },
  ],
  displaySetSelectors: {
    axialDisplaySet: {
      seriesMatchingRules: [
        {
          attribute: 'SeriesDescription',
          constraint: {
            contains: 'AXIAL',
          },
          required: false,
          weight: 1,
        },
        {
          attribute: 'ImageOrientationPatient',
          constraint: {
            equals: '1\\0\\0\\0\\1\\0',
          },
          required: false,
          weight: 1,
        },
      ],
    },
    coronalDisplaySet: {
      seriesMatchingRules: [
        {
          attribute: 'SeriesDescription',
          constraint: {
            contains: 'CORONAL',
          },
          required: false,
          weight: 1,
        },
        {
          attribute: 'ImageOrientationPatient',
          constraint: {
            equals: '1\\0\\0\\0\\0\\-1',
          },
          required: false,
          weight: 1,
        },
      ],
    },
    sagittalDisplaySet: {
      seriesMatchingRules: [
        {
          attribute: 'SeriesDescription',
          constraint: {
            contains: 'SAGITTAL',
          },
          required: false,
          weight: 1,
        },
        {
          attribute: 'ImageOrientationPatient',
          constraint: {
            equals: '0\\1\\0\\0\\0\\-1',
          },
          required: false,
          weight: 1,
        },
      ],
    },
  },
};

// Register the Hanging Protocol

export default hpCTChest;
