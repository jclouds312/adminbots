import { DriveFileRecord } from '../types';

const CLIENT_ID = '880656371189-fklfaepbqte1hp70bld31ik4neij1f56.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive';

let tokenClient: any = null;

export function initDriveTokenClient(onTokenReceived: (token: string) => void, onError?: (err: any) => void) {
  if (typeof window === 'undefined') return;
  if ((window as any).google?.accounts?.oauth2) {
    try {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp: any) => {
          if (resp.error) {
            console.error('Google Auth Error:', resp);
            onError?.(resp);
            return;
          }
          if (resp.access_token) {
            onTokenReceived(resp.access_token);
          }
        }
      });
    } catch (e) {
      console.error('Error initializing Google token client:', e);
    }
  }
}

export function requestDriveLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not available'));
    }
    if (!(window as any).google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services no está cargado aún'));
    }
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
          } else if (resp.access_token) {
            resolve(resp.access_token);
          } else {
            reject(new Error('No se recibió token de acceso'));
          }
        }
      });
      client.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
      reject(e);
    }
  });
}

export async function fetchGoogleProfile(accessToken: string): Promise<{ email: string; name: string; picture?: string }> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('No se pudo obtener información del perfil');
    const data = await res.json();
    return {
      email: data.email || 'panaderialaceja@gmail.com',
      name: data.name || 'Restaurante Admin',
      picture: data.picture
    };
  } catch (err) {
    return {
      email: 'panaderialaceja@gmail.com',
      name: 'RestoBot Admin'
    };
  }
}

export async function findOrCreateDriveFolder(accessToken: string, folderName = 'RestoBot_Restaurante_Backups'): Promise<string> {
  try {
    // Check if folder exists
    const q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create new folder
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Carpeta de respaldos automáticos, comprobantes de pago y reportes de RestoBot IA'
      })
    });

    if (!createRes.ok) {
      throw new Error(`Error al crear carpeta: ${createRes.statusText}`);
    }
    const created = await createRes.json();
    return created.id;
  } catch (error) {
    console.warn('Fallback or Drive folder error:', error);
    return 'root';
  }
}

export async function uploadContentToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  content: string,
  extraMeta?: { fileType: string; sede_id?: string; sede_nombre?: string; order_id?: string }
): Promise<DriveFileRecord> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: folderId && folderId !== 'root' ? [folderId] : undefined,
    description: `Generado por RestoBot IA el ${new Date().toLocaleString()}`
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,createdTime';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Fallo subida a Google Drive: ${errorText}`);
  }

  const uploaded = await res.json();
  const fileRecord: DriveFileRecord = {
    id: uploaded.id,
    name: uploaded.name || fileName,
    mimeType: uploaded.mimeType || mimeType,
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
    size: uploaded.size ? `${(parseInt(uploaded.size) / 1024).toFixed(1)} KB` : `${(content.length / 1024).toFixed(1)} KB`,
    createdTime: uploaded.createdTime || new Date().toISOString(),
    fileType: (extraMeta?.fileType as any) || 'reporte_diario',
    sede_id: extraMeta?.sede_id,
    sede_nombre: extraMeta?.sede_nombre,
    order_id: extraMeta?.order_id
  };

  // Register in backend database
  try {
    await fetch('/api/drive/save-backup-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileRecord)
    });
  } catch (err) {
    console.error('Error recording backup on server:', err);
  }

  return fileRecord;
}

export async function listFolderFilesFromDrive(accessToken: string, folderId: string): Promise<DriveFileRecord[]> {
  try {
    const q = `'${folderId}' in parents and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,size,createdTime)&orderBy=createdTime desc`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error('Error listando archivos de Drive');
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
      size: f.size ? `${(parseInt(f.size) / 1024).toFixed(1)} KB` : '1.2 KB',
      createdTime: f.createdTime || new Date().toISOString(),
      fileType: f.name.includes('Factura') ? 'ticket_pedido' : f.name.includes('Menu') ? 'catalogo_menu' : 'reporte_diario'
    }));
  } catch (err) {
    console.error('Error loading Google Drive files:', err);
    return [];
  }
}
