import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

import {
  captureBarklogError,
  queueBarklogEvent,
} from '@/features/observability';

type TextDocumentExportInput = {
  content: string;
  fileName: string;
  mimeType: string;
  title: string;
  uti?: string;
};

type PdfDocumentExportInput = {
  fileName: string;
  html: string;
  title: string;
};

type WritableExportFile = InstanceType<typeof File> & {
  create(options?: { overwrite?: boolean }): void;
  uri: string;
  write(content: string, options?: { encoding?: 'utf8' }): void;
};

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '');
}

function downloadTextOnWeb(input: TextDocumentExportInput) {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    return false;
  }

  const blob = new Blob([input.content], { type: input.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = sanitizeFileName(input.fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return true;
}

async function writeTextExportFile(input: TextDocumentExportInput) {
  const directory = Paths.cache ?? Paths.document;

  if (!directory) {
    return null;
  }

  const file = new File(
    directory,
    sanitizeFileName(input.fileName),
  ) as WritableExportFile;

  file.create({ overwrite: true });
  file.write(input.content, { encoding: 'utf8' });

  return file.uri;
}

export async function shareTextDocument(input: TextDocumentExportInput) {
  queueBarklogEvent('export_started', {
    export_type: input.mimeType,
    surface: 'text_document',
  });

  try {
    if (Platform.OS === 'web' && downloadTextOnWeb(input)) {
      queueBarklogEvent('export_completed', {
        export_type: input.mimeType,
        surface: 'text_document',
      });

      return `${input.fileName} generated.`;
    }

    const fileUri = await writeTextExportFile(input);

    if (fileUri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(fileUri, {
        UTI: input.uti,
        dialogTitle: input.title,
        mimeType: input.mimeType,
      });
    } else {
      await Share.share({
        message: input.content,
        title: input.title,
      });
    }

    queueBarklogEvent('export_completed', {
      export_type: input.mimeType,
      surface: 'text_document',
    });

    return `${input.title} ready to share.`;
  } catch (error) {
    queueBarklogEvent('export_failed', {
      export_type: input.mimeType,
      surface: 'text_document',
    });
    captureBarklogError(error, {
      source: 'share_text_document',
    });
    throw error;
  }
}

export async function sharePdfDocument(input: PdfDocumentExportInput) {
  queueBarklogEvent('export_started', {
    export_type: 'application/pdf',
    surface: 'pdf_document',
  });

  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html: input.html });
      queueBarklogEvent('export_completed', {
        export_type: 'application/pdf',
        surface: 'pdf_document',
      });

      return 'PDF print dialog opened.';
    }

    const result = await Print.printToFileAsync({
      html: input.html,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        UTI: 'com.adobe.pdf',
        dialogTitle: input.title,
        mimeType: 'application/pdf',
      });

      queueBarklogEvent('export_completed', {
        export_type: 'application/pdf',
        surface: 'pdf_document',
      });

      return `${input.fileName} ready to share.`;
    }

    await Share.share({
      message: input.title,
      title: input.title,
      url: result.uri,
    });

    queueBarklogEvent('export_completed', {
      export_type: 'application/pdf',
      surface: 'pdf_document',
    });

    return `${input.fileName} ready to share.`;
  } catch (error) {
    queueBarklogEvent('export_failed', {
      export_type: 'application/pdf',
      surface: 'pdf_document',
    });
    captureBarklogError(error, {
      source: 'share_pdf_document',
    });
    throw error;
  }
}

export async function printHtmlDocument(input: PdfDocumentExportInput) {
  try {
    await Print.printAsync({ html: input.html });
  } catch (error) {
    captureBarklogError(error, {
      source: 'print_html_document',
    });
    throw error;
  }

  return 'Print dialog opened.';
}
