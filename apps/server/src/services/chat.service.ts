import { Response } from 'express';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { attachmentRepository } from '../repositories/attachment.repository.js';
import { AIFactory } from '../modules/ai/ai.factory.js';
import { ProviderMessage, MessageContentPart } from '../modules/ai/interfaces/ai-provider.interface.js';
import { AgentEngine } from '../modules/agent/agent.engine.js';
import { AppError } from '../middlewares/error.middleware.js';
import { prisma } from '../database/prisma.service.js';

export class ChatService {
  public async streamChat(
    res: Response,
    params: {
      userId: string;
      conversationId?: string;
      message: string;
      model?: string;
      attachmentIds?: string[];
      systemPrompt?: string;
      temperature?: number;
      providerName?: string;
    },
  ) {
    // 1. Get or create Conversation
    let conversation;
    let isNewConversation = false;

    if (params.conversationId) {
      conversation = await conversationRepository.findById(params.conversationId, params.userId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
      }
    } else {
      isNewConversation = true;
      const initialTitle = params.message.slice(0, 40) || 'New Chat';
      conversation = await conversationRepository.create({
        user: { connect: { id: params.userId } },
        title: initialTitle,
        model: params.model || 'gemini-1.5-flash',
        systemPrompt: params.systemPrompt,
      });
    }

    // 2. Save User Message to Database
    const userMessage = await messageRepository.create({
      conversationId: conversation.id,
      role: 'USER',
      content: params.message,
      model: params.model || conversation.model,
    });

    if (params.attachmentIds && params.attachmentIds.length > 0) {
      await attachmentRepository.linkToMessage(params.attachmentIds, userMessage.id);
    }

    // 3. Setup SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // 4. Run Agent Engine Tool Evaluation
    const { stepsExecuted, augmentedPrompt } = await AgentEngine.evaluateAndExecuteTools(params.message, {
      userId: params.userId,
      conversationId: conversation.id,
      messageId: userMessage.id,
    });

    // Save PENDING Assistant Message
    const assistantMessage = await messageRepository.create({
      conversationId: conversation.id,
      role: 'ASSISTANT',
      content: '',
      model: conversation.model,
      status: 'STREAMING',
    });

    // Emit initial metadata event & tool execution steps
    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        conversationId: conversation.id,
        userMessageId: userMessage.id,
        assistantMessageId: assistantMessage.id,
        isNewConversation,
        toolSteps: stepsExecuted,
      })}\n\n`,
    );

    // 5. Prepare AI Messages History with Augmented Prompt
    const historyMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: { attachments: true },
    });

    const providerMessages: ProviderMessage[] = historyMessages.map((msg) => {
      const parts: MessageContentPart[] = [];
      if (msg.attachments) {
        for (const att of msg.attachments) {
          if (att.url.startsWith('data:')) {
            const [header, base64] = att.url.split(';base64,');
            const mimeType = header.replace('data:', '');
            parts.push({ mimeType, dataBase64: base64 });
          } else if (att.extractedText) {
            parts.push({ text: att.extractedText, mimeType: att.mimeType });
          }
        }
      }

      const content = msg.id === userMessage.id ? augmentedPrompt : msg.content;

      return {
        role: msg.role === 'USER' ? 'user' : 'model',
        content,
        attachments: parts.length > 0 ? parts : undefined,
      };
    });

    // 6. Invoke AI Provider Streaming
    const provider = AIFactory.getProvider(params.providerName || 'gemini');
    let fullResponseText = '';
    let totalTokens = 0;

    try {
      const stream = provider.generateStream({
        model: params.model || conversation.model,
        messages: providerMessages,
        systemPrompt: params.systemPrompt || conversation.systemPrompt || undefined,
        temperature: params.temperature,
      });

      for await (const chunk of stream) {
        if (chunk.deltaText) {
          fullResponseText += chunk.deltaText;
          res.write(
            `data: ${JSON.stringify({
              type: 'chunk',
              delta: chunk.deltaText,
              messageId: assistantMessage.id,
            })}\n\n`,
          );
        }
        if (chunk.tokensUsed) {
          totalTokens = chunk.tokensUsed;
        }
      }

      // 7. Update Assistant Message in Database
      await messageRepository.updateContent(assistantMessage.id, fullResponseText, 'COMPLETED', totalTokens);

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          conversationId: conversation.id,
          messageId: assistantMessage.id,
          fullContent: fullResponseText,
          tokensUsed: totalTokens,
        })}\n\n`,
      );
      res.end();
    } catch (err: any) {
      console.error('❌ Streaming Error:', err);
      await messageRepository.updateContent(
        assistantMessage.id,
        fullResponseText || 'Error generating AI response.',
        'FAILED',
      );

      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          messageId: assistantMessage.id,
          error: err.message || 'Stream failed',
        })}\n\n`,
      );
      res.end();
    }
  }

  public async regenerateMessage(res: Response, userId: string, messageId: string) {
    const assistantMessage = await messageRepository.findById(messageId);
    if (!assistantMessage || assistantMessage.role !== 'ASSISTANT') {
      throw new AppError('Assistant message not found', 404, 'MESSAGE_NOT_FOUND');
    }

    const conversation = await conversationRepository.findById(assistantMessage.conversationId, userId);
    if (!conversation) {
      throw new AppError('Conversation access denied', 403, 'FORBIDDEN');
    }

    const previousUserMsg = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        createdAt: { lt: assistantMessage.createdAt },
        role: 'USER',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!previousUserMsg) {
      throw new AppError('No previous user message found to regenerate', 400, 'NO_USER_MESSAGE');
    }

    return this.streamChat(res, {
      userId,
      conversationId: conversation.id,
      message: previousUserMsg.content,
      model: conversation.model,
    });
  }
}

export const chatService = new ChatService();
