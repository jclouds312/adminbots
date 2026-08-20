import { GooglePickedFile } from '../types';

declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

/**
 * Initializes and displays the Google Picker modal dialog.
 * Scopes required: drive.file, drive.metadata.readonly
 */
export function openGooglePicker({
  accessToken,
  viewType = 'all',
  onPicked,
  onCancel,
  onError
}: {
  accessToken: string;
  viewType?: 'all' | 'spreadsheets' | 'docs' | 'images' | 'pdfs';
  onPicked: (files: GooglePickedFile[]) => void;
  onCancel?: () => void;
  onError?: (err: any) => void;
}): void {
  if (typeof window === 'undefined') {
    onError?.(new Error('Window no disponible'));
    return;
  }

  // Load Google Picker script via gapi if needed
  if (!window.gapi) {
    onError?.(new Error('Google API client (gapi) no está disponible en la página'));
    return;
  }

  window.gapi.load('picker', {
    callback: () => {
      try {
        if (!window.google?.picker) {
          throw new Error('Google Picker library failed to load');
        }

        // Calculate origin safely for iFrames as per workspace-integration skill
        const pickerOrigin =
          window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
            ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
            : window.location.origin;

        const builder = new window.google.picker.PickerBuilder()
          .setOAuthToken(accessToken)
          .setOrigin(pickerOrigin)
          .setCallback((data: any) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const pickedDocs = data[window.google.picker.Response.DOCUMENTS] || data.docs || [];
              const formattedFiles: GooglePickedFile[] = pickedDocs.map((doc: any) => {
                return {
                  id: doc.id || doc[window.google.picker.Document.ID],
                  name: doc.name || doc[window.google.picker.Document.NAME] || 'Archivo de Google Drive',
                  mimeType: doc.mimeType || doc[window.google.picker.Document.MIME_TYPE] || 'application/octet-stream',
                  url: doc.url || doc[window.google.picker.Document.URL] || `https://drive.google.com/file/d/${doc.id}/view`,
                  sizeBytes: doc.sizeBytes || doc[window.google.picker.Document.SIZE_BYTES],
                  lastEditedUtc: doc.lastEditedUtc || doc[window.google.picker.Document.LAST_EDITED_UTC],
                  iconUrl: doc.iconUrl || doc[window.google.picker.Document.ICON_URL],
                  description: doc.description || ''
                };
              });
              onPicked(formattedFiles);
            } else if (data.action === window.google.picker.Action.CANCEL) {
              onCancel?.();
            }
          });

        // Add views based on request
        if (viewType === 'spreadsheets') {
          builder.addView(window.google.picker.ViewId.SPREADSHEETS);
        } else if (viewType === 'docs') {
          builder.addView(window.google.picker.ViewId.DOCUMENTS);
        } else if (viewType === 'images') {
          builder.addView(window.google.picker.ViewId.IMAGE_SEARCH);
          builder.addView(window.google.picker.ViewId.PHOTOS);
        } else if (viewType === 'pdfs') {
          builder.addView(window.google.picker.ViewId.PDFS);
        } else {
          // All docs & spreadsheets
          builder.addView(window.google.picker.ViewId.DOCS);
          builder.addView(window.google.picker.ViewId.SPREADSHEETS);
          builder.addView(window.google.picker.ViewId.PDFS);
        }

        // Enable feature flags
        builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        builder.enableFeature(window.google.picker.Feature.SUPPORT_DRIVES);

        const picker = builder.build();
        picker.setVisible(true);
      } catch (err) {
        console.error('Failed to create Google Picker dialog:', err);
        onError?.(err);
      }
    }
  });
}

/**
 * Fallback preset files for instant local simulation or testing
 */
export const SAMPLE_GOOGLE_DRIVE_FILES: GooglePickedFile[] = [
  {
    id: '1g-spread-kardex-2026',
    name: '📊 RestoBot_Kardex_Insumos_Bogota_Miami.xlsx',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    url: 'https://docs.google.com/spreadsheets/d/1g-spread-kardex-2026/edit',
    sizeBytes: 1048576,
    iconUrl: 'https://ssl.gstatic.com/docs/doclist/images/icon_11_spreadsheet_list.png',
    description: 'Inventario maestro con costo unitario de carne, quesos y panadería.',
    category: 'spreadsheet_kardex'
  },
  {
    id: '1g-menu-pdf-gourmet',
    name: '📄 Carta_Menu_Gourmet_RestoBot_2026_AltaResolucion.pdf',
    mimeType: 'application/pdf',
    url: 'https://drive.google.com/file/d/1g-menu-pdf-gourmet/view',
    sizeBytes: 4500000,
    iconUrl: 'https://ssl.gstatic.com/docs/doclist/images/icon_11_pdf_list.png',
    description: 'Menú digital con QR listo para envío automático a clientes de WhatsApp.',
    category: 'menu_pdf'
  },
  {
    id: '1g-photo-burger-artisan',
    name: '🖼️ Foto_Combo_Hamburguesa_Angus_Brioche.png',
    mimeType: 'image/png',
    url: 'https://drive.google.com/file/d/1g-photo-burger-artisan/view',
    sizeBytes: 2100000,
    iconUrl: 'https://ssl.gstatic.com/docs/doclist/images/icon_11_image_list.png',
    description: 'Fotografía para catálogo WhatsApp Business y campañas de marketing.',
    category: 'food_photo'
  },
  {
    id: '1g-receipts-fiscal-dian',
    name: '📋 Resolucion_Facturacion_Electronica_DIAN_IRS.pdf',
    mimeType: 'application/pdf',
    url: 'https://drive.google.com/file/d/1g-receipts-fiscal-dian/view',
    sizeBytes: 850000,
    iconUrl: 'https://ssl.gstatic.com/docs/doclist/images/icon_11_pdf_list.png',
    description: 'Documento legal de resolución de facturación para la sede principal.',
    category: 'fiscal_receipt'
  }
];
