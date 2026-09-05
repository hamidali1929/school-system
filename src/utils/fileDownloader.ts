import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import type { jsPDF } from 'jspdf';

/**
 * Saves a jsPDF document and opens the native Android Share/Save sheet on Mobile,
 * or triggers a standard browser download on Web/Desktop.
 */
export async function saveAndSharePDF(pdf: jsPDF, fileName: string, title: string = 'Document') {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
        try {
            const dataUri = pdf.output('datauristring');
            const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

            // 1. Save to Cache directory first (always accessible and FileProvider mapped)
            const cacheFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
                recursive: true
            });

            // 2. Also attempt saving to Documents if possible
            try {
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });
            } catch (docErr) {
                console.warn('Documents save skipped or restricted:', docErr);
            }

            // 3. Open Native Android Share/Save sheet with files array
            await Share.share({
                title: title,
                text: `${title} (${fileName})`,
                files: [cacheFile.uri],
                dialogTitle: `Save / Open ${fileName}`
            });

            return { success: true, uri: cacheFile.uri };
        } catch (nativeErr) {
            console.warn('Native Cache save/share error, trying fallback:', nativeErr);
            try {
                const dataUri = pdf.output('datauristring');
                const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

                const docFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });

                await Share.share({
                    title: title,
                    text: `${title} (${fileName})`,
                    files: [docFile.uri],
                    dialogTitle: `Save / Open ${fileName}`
                });

                return { success: true, uri: docFile.uri };
            } catch (err) {
                console.error('Mobile PDF save error in both Documents and Cache:', err);
            }
        }
    }

    // Web / Desktop browser download fallback
    pdf.save(fileName);
    return { success: true };
}

/**
 * Saves a Base64 / Data URI string (image or PDF or spreadsheet) on mobile or web.
 */
export async function saveAndShareBase64(base64DataUrl: string, fileName: string, title: string = 'File') {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
        try {
            const base64Data = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;

            const cacheFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Cache,
                recursive: true
            });

            try {
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Documents,
                    recursive: true
                });
            } catch (docErr) {
                console.warn('Documents save skipped:', docErr);
            }

            await Share.share({
                title: title,
                text: `${title} (${fileName})`,
                files: [cacheFile.uri],
                dialogTitle: `Save / Open ${fileName}`
            });

            return { success: true, uri: cacheFile.uri };
        } catch (err) {
            console.warn('Native Base64 save error:', err);
        }
    }

    // Web fallback
    const link = document.createElement('a');
    link.href = base64DataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
}
