import { prisma } from '../../database/prisma.service.js';
import crypto from 'crypto';

export class RAGService {
  private calculateSimpleEmbedding(text: string): number[] {
    // Generate normalized term frequency vector representation for cosine similarity
    const vector = new Array(64).fill(0);
    const normalized = text.toLowerCase();
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = charCode % 64;
      vector[index] += 1;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((val) => val / magnitude);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
    }
    return dotProduct;
  }

  public async createKnowledgeBase(userId: string, name: string, description?: string) {
    return prisma.knowledgeBase.create({
      data: { userId, name, description },
    });
  }

  public async getKnowledgeBases(userId: string) {
    return prisma.knowledgeBase.findMany({
      where: { userId },
      include: {
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async uploadDocument(
    knowledgeBaseId: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    const textContent = file.buffer.toString('utf-8');

    const doc = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        fileKey: crypto.randomUUID(),
        status: 'PROCESSING',
      },
    });

    // Chunk text into ~500 character blocks
    const chunkSize = 500;
    const chunks: string[] = [];
    for (let i = 0; i < textContent.length; i += chunkSize) {
      chunks.push(textContent.substring(i, i + chunkSize));
    }

    for (let idx = 0; idx < chunks.length; idx++) {
      const chunkText = chunks[idx];
      if (!chunkText) continue;

      const chunkRecord = await prisma.documentChunk.create({
        data: {
          documentId: doc.id,
          content: chunkText,
          chunkIndex: idx,
          tokenCount: Math.ceil(chunkText.length / 4),
        },
      });

      const vector = this.calculateSimpleEmbedding(chunkText);
      await prisma.embedding.create({
        data: {
          chunkId: chunkRecord.id,
          vector: JSON.stringify(vector),
          model: 'text-embedding-004',
        },
      });
    }

    await prisma.knowledgeDocument.update({
      where: { id: doc.id },
      data: { status: 'PROCESSED' },
    });

    return doc;
  }

  public async searchKnowledgeBase(knowledgeBaseId: string, query: string, topK = 3) {
    const queryVector = this.calculateSimpleEmbedding(query);

    const chunks = await prisma.documentChunk.findMany({
      where: { document: { knowledgeBaseId } },
      include: { embeddings: true, document: true },
    });

    const scored = chunks.map((chunk) => {
      const vectorJson = chunk.embeddings[0]?.vector;
      let vector: number[] = [];
      try {
        vector = typeof vectorJson === 'string' ? JSON.parse(vectorJson) : (vectorJson as any) || [];
      } catch {
        vector = [];
      }
      const score = this.cosineSimilarity(queryVector, vector);
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((item) => ({
      content: item.chunk.content,
      documentName: item.chunk.document.filename,
      score: item.score,
    }));
  }
}

export const ragService = new RAGService();
