/**
 * DownloadService.ts (Web)
 * 
 * Web-compatible download service for PDFs and QR codes.
 * Ported for parity with mobile/src/services/downloadNotification.service.ts
 */

export interface DownloadOptions {
  url: string;
  filename: string;
  mimeType?: string;
}

export interface DownloadResult {
  success: boolean;
  message?: string;
}

/**
 * Download a file via URL in the browser
 */
export async function downloadFile(opts: DownloadOptions): Promise<DownloadResult> {
  try {
    const response = await fetch(opts.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', opts.filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error: any) {
    console.error('Download failed:', error);
    return { success: false, message: error.message || 'Download failed' };
  }
}

/**
 * Save a base64 string as a file in the browser
 */
export async function saveBase64File(
  base64Data: string,
  filename: string,
  mimeType = 'application/pdf'
): Promise<DownloadResult> {
  try {
    // Strip data URI prefix if present
    const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const byteCharacters = atob(cleanData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error: any) {
    console.error('Save failed:', error);
    return { success: false, message: error.message || 'Save failed' };
  }
}
