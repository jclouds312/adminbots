import React from 'react';
import { X, FolderOpen, FileText, FileSpreadsheet, Check, Download, ExternalLink } from 'lucide-react';

interface GooglePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile?: (file: any) => void;
}

export const GooglePickerModal: React.FC<GooglePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectFile
}) => {
  if (!isOpen) return null;

  const mockGoogleDriveFiles = [
    {
      id: 'gdrive-01',
      name: 'Menu_Oficial_Verano_2026_Precios_USD.pdf',
      type: 'pdf',
      size: '2.4 MB',
      lastModified: 'Ayer, 04:30 PM',
      icon: FileText
    },
    {
      id: 'gdrive-02',
      name: 'Kardex_Recetas_Costeo_Insumos_Miami_v4.xlsx',
      type: 'spreadsheet',
      size: '1.8 MB',
      lastModified: 'Hace 3 días',
      icon: FileSpreadsheet
    },
    {
      id: 'gdrive-03',
      name: 'Cierre_Caja_Consolidado_Semanal_Agosto.xlsx',
      type: 'spreadsheet',
      size: '940 KB',
      lastModified: 'Hoy, 09:15 AM',
      icon: FileSpreadsheet
    },
    {
      id: 'gdrive-04',
      name: 'Manual_Operativo_Cocina_KDS_Estandares.pdf',
      type: 'pdf',
      size: '4.1 MB',
      lastModified: '10 de Agosto',
      icon: FileText
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Google Drive Picker API
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Workspace Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona archivos de tu unidad Google Drive para alimentar menús o recetas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Files List */}
        <div className="py-4 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {mockGoogleDriveFiles.map((file) => {
            const Icon = file.icon;
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-amber-400 group-hover:text-amber-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{file.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {file.size} • Modificado: {file.lastModified}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onSelectFile) onSelectFile(file);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Vincular</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Cuenta: <strong>drive.sync@restobot.ai</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
