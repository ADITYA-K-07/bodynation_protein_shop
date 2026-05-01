/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface CloudinaryUploadWidgetResultInfo {
  secure_url?: string;
}

interface CloudinaryUploadWidgetResult {
  event?: string;
  info?: CloudinaryUploadWidgetResultInfo;
}

interface CloudinaryWidget {
  open: () => void;
}

interface Window {
  cloudinary?: {
    createUploadWidget: (
      options: Record<string, unknown>,
      callback: (error: unknown, result: CloudinaryUploadWidgetResult) => void,
    ) => CloudinaryWidget;
  };
}
