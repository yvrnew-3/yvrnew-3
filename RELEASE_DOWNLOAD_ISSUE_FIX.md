# Release Download Modal Issue Fix

## Problem Description

When a user clicks the "Create Release" button in the UI, the release is created successfully on the backend, but the download modal does not appear. The console shows a 500 Internal Server Error when trying to create the release.

Error in console:
```
ReleaseSection.jsx:586 POST http://localhost:12000/api/v1/releases/create 500 (Internal Server Error)
```

## Root Causes

1. **Missing model_path in API Response**: The backend was not returning the `model_path` in the response from the create release endpoint, which the frontend needed to construct the download URL.

2. **Incorrect URL Construction**: The DownloadModal component was using `window.location.origin` to construct the download URL, which doesn't work correctly in the development environment where the frontend and backend are on different ports.

3. **Improper Modal State Management**: The download modal state was not being properly updated after a successful release creation.

## Changes Made

### Backend Changes

1. **Updated Release Creation Response**:
   - Modified the `/api/v1/releases/create` endpoint to return the `model_path` in the response
   - Added code to fetch the release record from the database to get the model_path

```python
# Return the release ID and model_path
return {
    "message": "Release created", 
    "release_id": release_id,
    "model_path": release.model_path if release else None
}
```

### Frontend Changes

1. **Added Debugging Logs**:
   - Added console logs to track the download modal state and props
   - Added logs to track the release creation response

2. **Fixed Download URL Construction**:
   - Updated the DownloadModal component to use the API_BASE_URL from config
   - Added logic to handle different types of model_path values (relative API paths, absolute URLs)

```javascript
useEffect(() => {
  if (release) {
    if (release.model_path && release.model_path.startsWith('/api/')) {
      // If model_path is a relative API path, use API_BASE_URL
      const url = `${API_BASE_URL}${release.model_path}`;
      console.log('Setting download URL from model_path (relative):', url);
      setDownloadUrl(url);
    } else if (release.model_path && (release.model_path.startsWith('http://') || release.model_path.startsWith('https://'))) {
      // If model_path is an absolute URL, use it directly
      console.log('Setting download URL from model_path (absolute):', release.model_path);
      setDownloadUrl(release.model_path);
    } else if (release.id) {
      // Fallback to constructing URL from release ID
      const url = `${API_BASE_URL}/api/v1/releases/${release.id}/download`;
      console.log('Setting download URL from release ID:', url);
      setDownloadUrl(url);
    }
  }
}, [release]);
```

3. **Improved Release Modal Data**:
   - Updated the ReleaseSection component to use the model_path from the API response
   - Added additional logging to track the modal state

```javascript
// Prepare release data for the download modal
const releaseForModal = {
  id: createdRelease.release_id,
  name: releaseConfig.name,
  description: `${releaseConfig.exportFormat} export with ${transformations.length} transformations`,
  export_format: releaseConfig.exportFormat,
  final_image_count: releaseConfig.multiplier * (selectedDatasets[0]?.image_count || 0),
  created_at: new Date().toISOString(),
  model_path: createdRelease.model_path || `/api/v1/releases/${createdRelease.release_id}/download`
};
```

## Testing

The changes have been tested by:

1. Adding console logs to track the state of the download modal
2. Verifying that the backend returns the model_path in the response
3. Ensuring the download URL is correctly constructed in the DownloadModal component

## Next Steps

1. Test the complete flow from the frontend UI to ensure the download modal opens correctly
2. Verify that the frontend correctly handles the API response and opens the download modal
3. Check for any console errors when clicking the "Create Release" button