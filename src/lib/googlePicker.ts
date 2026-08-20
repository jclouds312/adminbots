/**
 * Google Picker API Client Integration
 * Implements the standard Google Picker Builder pattern:
 * - Uses google.picker.PickerBuilder()
 * - Sets origin dynamically from ancestorOrigins / window.location.origin
 * - Supports DocsView, DocsUploadView, SpreadsheetsView
 * - Resolves selected files into standard format
 */

export interface GooglePickedDoc {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  description?: string;
  sizeBytes?: number;
  lastEditedUtc?: string;
  iconUrl?: string;
}

export type PickerViewMode = 'all' | 'documents' | 'spreadsheets' | 'presentations' | 'pdfs' | 'images' | 'folders';

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

let isGapiLoaded = false;
let isPickerLoaded = false;

/**
 * Loads the Google API client script and 'picker' module
 */
export async function loadGooglePickerApi(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.google?.picker) {
      isPickerLoaded = true;
      resolve(true);
      return;
    }

    // Function to load picker after gapi is ready
    const loadPickerModule = () => {
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => {
            isPickerLoaded = true;
            resolve(true);
          },
          onerror: () => {
            console.warn('Error loading gapi.picker module');
            resolve(false);
          },
          timeout: 5000,
          ontimeout: () => {
            console.warn('Timeout loading gapi.picker module');
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    };

    if (window.gapi) {
      loadPickerModule();
    } else {
      // If gapi script is not loaded yet, inject it
      const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          isGapiLoaded = true;
          loadPickerModule();
        };
        script.onerror = () => {
          console.warn('Failed to load Google API script');
          resolve(false);
        };
        document.head.appendChild(script);
      } else {
        // Script tag exists, wait for gapi
        let checkCount = 0;
        const interval = setInterval(() => {
          checkCount++;
          if (window.gapi) {
            clearInterval(interval);
            loadPickerModule();
          } else if (checkCount > 20) {
            clearInterval(interval);
            resolve(false);
          }
        }, 150);
      }
    }
  });
}

/**
 * Opens Google Picker window with specified token and callback
 */
export function showGooglePicker({
  accessToken,
  viewMode = 'all',
  allowUpload = true,
  multiselect = true,
  onPick,
  onCancel,
}: {
  accessToken?: string | null;
  viewMode?: PickerViewMode;
  allowUpload?: boolean;
  multiselect?: boolean;
  onPick: (docs: GooglePickedDoc[]) => void;
  onCancel?: () => void;
}): boolean {
  if (!window.google?.picker) {
    console.warn('Google Picker API is not ready in window.google.picker');
    return false;
  }

  try {
    const pickerOrigin =
      window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    const builder = new window.google.picker.PickerBuilder();

    // Configure Views
    if (viewMode === 'spreadsheets') {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS);
      view.setIncludeFolders(true);
      builder.addView(view);
    } else if (viewMode === 'documents') {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
      view.setIncludeFolders(true);
      builder.addView(view);
    } else if (viewMode === 'pdfs') {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
      view.setMimeTypes('application/pdf');
      view.setIncludeFolders(true);
      builder.addView(view);
    } else {
      // Default: All Docs view
      const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
      docsView.setIncludeFolders(true);
      builder.addView(docsView);
      
      const sheetsView = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS);
      sheetsView.setIncludeFolders(true);
      builder.addView(sheetsView);
    }

    if (allowUpload) {
      builder.addView(new window.google.picker.DocsUploadView());
    }

    if (multiselect) {
      builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
    }

    if (accessToken) {
      builder.setOAuthToken(accessToken);
    }

    builder.setOrigin(pickerOrigin);
    builder.setTitle('RestoBot IA – Seleccionar Archivo de Google Drive');

    builder.setCallback((data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const rawDocs = data[window.google.picker.Response.DOCUMENTS] || [];
        const formattedDocs: GooglePickedDoc[] = rawDocs.map((doc: any) => ({
          id: doc[window.google.picker.Document.ID] || doc.id || `file_${Date.now()}`,
          name: doc[window.google.picker.Document.NAME] || doc.name || 'Archivo de Drive',
          mimeType: doc[window.google.picker.Document.MIME_TYPE] || doc.mimeType || 'application/octet-stream',
          url: doc[window.google.picker.Document.URL] || doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
          description: doc[window.google.picker.Document.DESCRIPTION] || '',
          sizeBytes: doc[window.google.picker.Document.SIZE_BYTES] || 0,
          lastEditedUtc: doc[window.google.picker.Document.LAST_EDITED_UTC] || new Date().toISOString(),
          iconUrl: doc[window.google.picker.Document.ICON_URL] || '',
        }));
        onPick(formattedDocs);
      } else if (data.action === window.google.picker.Action.CANCEL) {
        if (onCancel) onCancel();
      }
    });

    const picker = builder.build();
    picker.setVisible(true);
    return true;
  } catch (error) {
    console.error('Failed to instantiate Google Picker:', error);
    return false;
  }
}
