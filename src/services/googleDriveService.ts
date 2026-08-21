import { FranchiseBrand, BranchSede, MenuItem, BotConfiguration } from '../types';

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
}

export interface DriveUploadResult {
  success: boolean;
  fileId: string;
  fileName: string;
  webViewLink: string;
  size?: string;
  mimeType: string;
  folderId?: string;
  folderName?: string;
  directGoogleDrive: boolean;
  message?: string;
}

/**
 * Upload any text/JSON file directly to Google Drive v3 API using user's access token,
 * or fallback to server endpoint if token is not available.
 */
export async function uploadFileToGoogleDrive({
  accessToken,
  fileName,
  fileContent,
  mimeType = 'application/json',
  folderId
}: {
  accessToken?: string | null;
  fileName: string;
  fileContent: string | object;
  mimeType?: string;
  folderId?: string;
}): Promise<DriveUploadResult> {
  const contentString = typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent, null, 2);
  const fileSizeKb = (new Blob([contentString]).size / 1024).toFixed(1) + ' KB';

  // If user has a valid Google OAuth Access Token, perform direct Google Drive API v3 upload
  if (accessToken) {
    try {
      const metadata: Record<string, any> = {
        name: fileName,
        mimeType: mimeType
      };
      if (folderId && folderId !== 'root' && !folderId.startsWith('folder_')) {
        metadata.parents = [folderId];
      }

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n` +
        contentString +
        closeDelimiter;

      const driveRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size,mimeType,parents',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        }
      );

      if (driveRes.ok) {
        const driveData = await driveRes.json();
        return {
          success: true,
          fileId: driveData.id,
          fileName: driveData.name || fileName,
          webViewLink: driveData.webViewLink || `https://drive.google.com/file/d/${driveData.id}/view`,
          size: fileSizeKb,
          mimeType: mimeType,
          folderId: folderId,
          directGoogleDrive: true,
          message: `Archivo subido directamente a tu cuenta de Google Drive con éxito.`
        };
      } else {
        const errJson = await driveRes.json().catch(() => ({}));
        console.warn('Direct Google Drive API failed, falling back to server workspace backup:', errJson);
      }
    } catch (err) {
      console.warn('Direct Google Drive upload threw error, using server fallback:', err);
    }
  }

  // Server Fallback endpoint
  const serverRes = await fetch('/api/drive/upload-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: fileName,
      mimeType,
      size: fileSizeKb,
      folderId: folderId || 'folder_backups',
      content: contentString
    })
  });

  if (!serverRes.ok) {
    throw new Error('Error al sincronizar archivo con el servicio de Google Drive.');
  }

  const result = await serverRes.json();
  return {
    success: true,
    fileId: result.file?.id || `drive_${Date.now()}`,
    fileName: result.file?.name || fileName,
    webViewLink: result.file?.webViewLink || `https://drive.google.com/file/d/demo_${Date.now()}/view`,
    size: fileSizeKb,
    mimeType: mimeType,
    folderId: folderId,
    directGoogleDrive: false,
    message: result.message || 'Archivo guardado en el Workspace de Google Drive.'
  };
}

/**
 * Creates a dedicated Folder in Google Drive
 */
export async function createGoogleDriveFolder({
  accessToken,
  folderName,
  parentFolderId
}: {
  accessToken?: string | null;
  folderName: string;
  parentFolderId?: string;
}): Promise<DriveFolderInfo> {
  if (accessToken) {
    try {
      const metadata: Record<string, any> = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };
      if (parentFolderId && parentFolderId !== 'root' && !parentFolderId.startsWith('folder_')) {
        metadata.parents = [parentFolderId];
      }

      const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink,createdTime', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (res.ok) {
        const folder = await res.json();
        return {
          id: folder.id,
          name: folder.name,
          webViewLink: folder.webViewLink,
          createdTime: folder.createdTime
        };
      }
    } catch (e) {
      console.warn('Error creating folder in Drive API directly, using server backup:', e);
    }
  }

  // Fallback server creation
  const serverRes = await fetch('/api/drive/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: folderName,
      type: 'custom',
      description: `Carpeta creada en Google Drive para ${folderName}`
    })
  });

  const data = await serverRes.json();
  return {
    id: data.folder?.id || `folder_${Date.now()}`,
    name: data.folder?.name || folderName,
    webViewLink: `https://drive.google.com/drive/folders/${data.folder?.driveFolderId || Date.now()}`,
    createdTime: new Date().toISOString()
  };
}

/**
 * Backs up a complete Bot Configuration (Instructions, Model, Voice Tone, Gateways, Sedes)
 * directly into the User's Google Drive.
 */
export async function uploadBotConfigBackupToDrive({
  accessToken,
  brand,
  sede,
  botConfig,
  folderId
}: {
  accessToken?: string | null;
  brand: FranchiseBrand | any;
  sede: BranchSede | any;
  botConfig?: Partial<BotConfiguration>;
  folderId?: string;
}): Promise<DriveUploadResult> {
  const timestamp = new Date().toISOString();
  const dateSlug = timestamp.slice(0, 10);
  const brandSlug = (brand?.name || 'Restaurante').replace(/[^a-zA-Z0-9]/g, '_');
  const sedeSlug = (sede?.nombre_sede || 'Sede').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Backup_Bot_${brandSlug}_${sedeSlug}_${dateSlug}.json`;

  const backupPayload = {
    restoBotBackupVersion: '3.0.0-enterprise',
    backupType: 'BOT_CONFIGURATION_FULL',
    exportedAt: timestamp,
    brand: {
      id: brand?.id,
      name: brand?.name,
      country: brand?.country,
      currency: brand?.currency,
      cuisineType: brand?.cuisineType,
      contactPhone: brand?.contactPhone,
      contactEmail: brand?.contactEmail
    },
    sede: {
      sede_id: sede?.sede_id,
      nombre_sede: sede?.nombre_sede,
      ciudad: sede?.ciudad,
      direccion: sede?.direccion,
      telefono_whatsapp: sede?.telefono_whatsapp,
      costo_domicilio: sede?.costo_domicilio,
      tiempo_estimado: sede?.tiempo_estimado_entrega,
      moneda: sede?.moneda
    },
    aiBotConfig: {
      aiModel: botConfig?.aiModel || sede?.aiModel || 'gemini-2.5-flash',
      tone: botConfig?.tone || sede?.botTone || 'friendly_warm',
      systemPrompt: botConfig?.systemPrompt || sede?.botCustomPrompt,
      welcomeMessage: botConfig?.welcomeMessage || sede?.botWelcomeMessage,
      paymentGateways: botConfig?.activePaymentMethods || {
        wompi: true,
        stripe: true,
        zelle: true,
        cashOnDelivery: true
      }
    },
    menuItemsCount: (sede?.menu || []).length,
    menuCatalog: sede?.menu || []
  };

  return uploadFileToGoogleDrive({
    accessToken,
    fileName,
    fileContent: backupPayload,
    mimeType: 'application/json',
    folderId
  });
}

/**
 * Backs up and uploads a Restaurant's Digital Menu (Carta Gastronómica)
 * to Google Drive as both structured JSON and rich text format.
 */
export async function uploadDigitalMenuToDrive({
  accessToken,
  brand,
  sede,
  menuItems,
  folderId
}: {
  accessToken?: string | null;
  brand: FranchiseBrand | any;
  sede: BranchSede | any;
  menuItems: MenuItem[];
  folderId?: string;
}): Promise<DriveUploadResult> {
  const timestamp = new Date().toISOString();
  const dateSlug = timestamp.slice(0, 10);
  const brandSlug = (brand?.name || 'Restaurante').replace(/[^a-zA-Z0-9]/g, '_');
  const sedeSlug = (sede?.nombre_sede || 'Sede').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Menu_Digital_${brandSlug}_${sedeSlug}_${dateSlug}.json`;

  const currency = sede?.moneda || brand?.currency || 'USD';

  const menuPayload = {
    restoBotMenuVersion: '3.0.0-pro',
    exportType: 'DIGITAL_MENU_CATALOG',
    updatedAt: timestamp,
    restaurant: {
      brandName: brand?.name,
      sedeName: sede?.nombre_sede,
      city: sede?.ciudad,
      address: sede?.direccion,
      whatsappOrders: sede?.telefono_whatsapp,
      currency: currency,
      deliveryCost: sede?.costo_domicilio,
      avgDeliveryTime: sede?.tiempo_estimado_entrega
    },
    categories: Array.from(new Set(menuItems.map(m => m.category || 'Generales'))),
    totalDishes: menuItems.length,
    dishes: menuItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      currencyFormatted: currency === 'USD' ? `$${item.price.toFixed(2)} USD` : `$${item.price.toLocaleString()} COP`,
      description: item.description,
      available: item.available,
      image: item.image,
      badge: item.badge || null
    }))
  };

  return uploadFileToGoogleDrive({
    accessToken,
    fileName,
    fileContent: menuPayload,
    mimeType: 'application/json',
    folderId
  });
}
