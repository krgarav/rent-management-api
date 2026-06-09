// ollama.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiTemplateStreamQuestion, TEMPLATE_GENERATOR_STREAM_PROMPT } from './helper';
import { ollamaChat } from './helper/api.helper';

@Injectable()
export class OllamaService {
  constructor(private readonly httpService: HttpService) { 
    
  }


  
  async generate(prompt: string) {
    const updatedPrompt = prompt + TEMPLATE_GENERATOR_STREAM_PROMPT
    const { data } = await firstValueFrom(
      this.httpService.post('http://localhost:11434/api/generate', {
        model: 'qwen2.5-coder:7b',
        prompt: updatedPrompt,
        stream: false,
      }),
    );
    // return JSON.parse(data.response);
    try {
      return JSON.parse(data.response);
    } catch {
      return data.response;
    }
  }

async createTemplateUsingAIStream(
    prompt: string,
    handlers?: {
      onMeta?: (meta: { name: string }) => void;
      onVariable?: (variable: Record<string, any>) => void;
      onContent?: (node: Record<string, any>) => void;
      onSettings?: (settings: Record<string, any>) => void;
      onAskUser?: (question: AiTemplateStreamQuestion) => void;
      onAwaitingAnswers?: () => void;
      onError?: (message: string) => void;
    },
  ) {
    const content = await ollamaChat(
      prompt,
      TEMPLATE_GENERATOR_STREAM_PROMPT,
      undefined,
      this.httpService,
    );

    let templateName = 'Untitled Template';
    let messageType: string | undefined;
    let replyMessage = '';
    let settings: Record<string, any> | undefined;

    const variables: Record<string, any>[] = [];
    const contentNodes: Record<string, any>[] = [];
    const questions: AiTemplateStreamQuestion[] = [];

    let awaitingAnswers = false;
    let skipped = 0;

    const handleLine = (line: string) => {
      const trimmed = line.trim();

      if (!trimmed) return;
      if (trimmed.startsWith('```')) return;

      let obj: any;

      try {
        obj = JSON.parse(trimmed);
      } catch {
        skipped++;
        return;
      }

      if (obj.type === 'meta') {
        templateName =obj.name;

        handlers?.onMeta?.({
          name: templateName,
        });

        return;
      }

      if (obj.type === 'settings') {
        settings = obj.settings;

        handlers?.onSettings?.(settings);

        return;
      }

      if (obj.type === 'variable') {
        const variable = obj.variable;

        variables.push(variable);

        handlers?.onVariable?.(variable);

        return;
      }

      if (obj.type === 'content') {
        const node = obj.node;

        contentNodes.push(node);

        handlers?.onContent?.(node);

        return;
      }

      if (obj.type === 'user_generic') {
        messageType = 'user_generic';
        replyMessage = String(obj.reply_message || '');
        return;
      }

      if (obj.type === 'ask_user') {
        const question: AiTemplateStreamQuestion = {
          id: String(obj.id),
          question: String(obj.question),
          options: obj.options || [],
          multiSelect: !!obj.multiSelect,
          allowCustom: obj.allowCustom !== false,
        };

        questions.push(question);

        handlers?.onAskUser?.(question);

        return;
      }

      if (obj.type === 'awaiting_answers') {
        awaitingAnswers = true;

        handlers?.onAwaitingAnswers?.();

        return;
      }
    };

    const lines = content.split('\n');

    for (const line of lines) {
      handleLine(line);
    }

    if (messageType === 'user_generic') {
      return {
        message_type: messageType,
        reply_message: replyMessage,
        tokenUsage: {
          model: 'qwen2.5-coder:7b',
        },
      };
    }

    if (awaitingAnswers || questions.length) {
      return {
        awaitingAnswers: true,
        questions,
        tokenUsage: {
          model: 'qwen2.5-coder:7b',
        },
      };
    }

    const response = [variables];

    return {
      ...response,
      tokenUsage: {
        model: 'qwen2.5-coder:7b',
      },
    };
  }
}