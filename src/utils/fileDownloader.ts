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

            // Attempt saving to Android Documents directory
            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true
            });

            // Open native Android save / share sheet
            await Share.share({
                title: title,
                text: `${title} (${fileName})`,
                url: savedFile.uri,
                dialogTitle: `Save / Open ${fileName}`
            });

            return { success: true, uri: savedFile.uri };
        } catch (nativeErr) {
            console.warn('Native Documents save error, trying Cache directory fallback:', nativeErr);
            try {
                const dataUri = pdf.output('datauristring');
                const base64Data = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

                const cacheFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                    recursive: true
                });

                await Share.share({
                    title: title,
                    text: `${title} (${fileName})`,
                    url: cacheFile.uri,
                    dialogTitle: `Save / Open ${fileName}`
                });

                return { success: true, uri: cacheFile.uri };
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

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
                recursive: true
            });

            await Share.share({
                title: title,
                text: `${title} (${fileName})`,
                url: savedFile.uri,
                dialogTitle: `Save / Open ${fileName}`
            });

            return { success: true, uri: savedFile.uri };
        } catch (err) {
            console.warn('Native Base64 save error, trying Cache:', err);
            try {
                const base64Data = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;

                const cacheFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache,
                    recursive: true
                });

                await Share.share({
                    title: title,
                    url: cacheFile.uri,
                    dialogTitle: `Save / Open ${fileName}`
                });

                return { success: true, uri: cacheFile.uri };
            } catch (e) {
                console.error('Failed to save base64 file on mobile:', e);
            }
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
