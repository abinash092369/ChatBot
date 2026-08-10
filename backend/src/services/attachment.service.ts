import { attachmentRepository } from '../repositories/attachment.repository.js';
import crypto from 'crypto';

export class AttachmentService {
  public async processUpload(
    userId: string,
    conversationId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    let extractedText: string | undefined = undefined;

    // Handle text files & JSON
    if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json' || file.mimetype === 'text/csv') {
      try {
        extractedText = file.buffer.toString('utf-8');
      } catch {
        // Ignore
      }
    } else if (file.mimetype === 'application/pdf') {
      // Basic text extraction simulation / ASCII string extraction for PDF
      try {
        const str = file.buffer.toString('utf-8');
        extractedText = str.replace(/[^\x20-\x7E\n\r]/g, ' ').substring(0, 5000);
      } catch {
        extractedText = '[PDF Document attached]';
      }
    }

    // Convert file to Base64 Data URL for inline storage / Gemini Vision
    const base64Data = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

    const attachment = await attachmentRepository.create({
      conversationId,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: dataUrl,
      fileKey: crypto.randomUUID(),
      extractedText,
    });

    return attachment;
  }
}

export const attachmentService = new AttachmentService();
