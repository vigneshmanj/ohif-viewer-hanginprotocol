# OHIF Viewer Hanging Protocols Documentation

## Overview

This document details the implementation of customizable hanging protocols in the OHIF Viewer, enabling automatic organization and display of medical images according to predefined rules and layouts.

## Table of Contents

1. [Architecture](#architecture)
2. [Protocol Definitions](#protocol-definitions)
3. [Implementation Details](#implementation-details)
4. [Usage Guide](#usage-guide)
5. [Technical Specifications](#technical-specifications)

## Architecture

### Core Components

- **Protocol Service**: Manages protocol selection and application
- **Viewport Manager**: Controls viewport creation and layout
- **Matching Engine**: Handles DICOM metadata matching rules
- **Synchronization Service**: Manages viewport synchronization

### File Structure

```
extensions/
├── default/
│   ├── src
      ├── hangingProtocols
│         └── hpMRIBrain.ts # MRI Brain protocol definition
          └── hpCTChest.ts # CT Chest protocol definition
├── modes/
│   └── longitudinal
      └── src
        └──toolbarButton.ts
        └──index.ts


```

## Protocol Definitions

### CT Chest Protocol

- **ID**: `ctchest`
- **Layout**: 1x3 grid
- **Views**: Axial, Coronal, Sagittal
- **Matching Rules**:
  - Modality = CT (required)
  - StudyDescription contains "CHEST" or "THORAX"
- **Window Settings**:
  - Width: 1500
  - Center: -600

```typescript
{
  id: 'ctchest',
  viewportStructure: {
    layoutType: 'grid',
    properties: { rows: 1, columns: 3 }
  },
  // ... see ctChest.ts for full implementation
}
```

### MRI Brain Protocol

- **ID**: `mribrain`
- **Layout**: 2x2 grid
- **Views**: T1, T2, FLAIR + empty viewport
- **Matching Rules**:
  - Modality = MR (required)
  - StudyDescription contains "BRAIN"

```typescript
{
  id: 'mribrain',
  viewportStructure: {
    layoutType: 'grid',
    properties: { rows: 2, columns: 2 }
  },
  // ... see mriBrain.ts for full implementation
}
```

## Implementation Details

### Protocol Matching Engine

Protocols are matched using a weighted scoring system:
- Required rules must match (weight multiplier)
- Optional rules contribute to best match selection
- Series matching for specific viewport assignments

```typescript
protocolMatchingRules: [
  {
    attribute: 'Modality',
    constraint: { equals: { value: 'CT' } },
    required: true,
    weight: 2
  }
  // ... additional rules
]
```

### Viewport Synchronization

- Window/Level synchronization using `syncGroups`
- Camera position synchronization for MPR views
- Tool state synchronization across related viewports

```typescript
syncGroups: [
  {
    type: 'voi',
    id: 'ctWLSync',
    source: true,
    target: true
  }
]
```

### Display Set Selection

Series are matched to viewports using:
- DICOM attributes (SeriesDescription, ImageOrientation)
- Image characteristics (reconstructable, frame count)
- Specific protocol requirements

## Usage Guide

### Protocol Selection

1. **Automatic**: Based on study metadata
2. **Manual**: Via toolbar buttons
   - Default
   - CT Chest
   - MRI Brain

### Toolbar Integration

```typescript
const protocolButton = {
  id: 'ProtocolSelector',
  uiType: 'ohif.toolButton',
  props: {
    icon: 'tool-layout',
    label: 'Protocols'
    // ... configuration
  }
};
```

## Technical Specifications

### Requirements

- OHIF Viewer v3.0+
- React 18.3+
- TypeScript 5.5+

### Performance Considerations

- Lazy loading of protocol definitions
- Optimized matching algorithm
- Efficient viewport rendering

### Extension Points

1. **New Protocols**:
   - Create protocol definition file
   - Register in `getHangingProtocolModule`
   - Add toolbar button (optional)

2. **Custom Matching Rules**:
   - Extend `ProtocolMatchingRule` interface
   - Implement custom matching logic

### Error Handling

- Graceful fallback to default layout
- Comprehensive error logging
- User feedback for protocol application status

## Best Practices

1. **Protocol Design**:
   - Use meaningful IDs and names
   - Include comprehensive matching rules
   - Set appropriate default values

2. **Viewport Configuration**:
   - Configure appropriate tool groups
   - Set optimal window/level defaults
   - Enable relevant synchronization

3. **Maintenance**:
   - Document protocol changes
   - Version control protocol definitions
   - Test with various study types

## Security Considerations

- Protocol validation before application
- Sanitized user input handling
- Proper access control for protocol modification

## Future Enhancements

1. Protocol Templates
2. User-Specific Preferences
3. Protocol Import/Export

## References

- OHIF Documentation
- DICOM Standard
- Viewport API Documentation
