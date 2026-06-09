import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export const ollamaChat = async (
  content: string,
  systemPrompt: string | false = false,
  assistant?: string,
  httpService?: HttpService,
) => {
  const messages: any[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  if (assistant) {
    messages.push({
      role: 'assistant',
      content: assistant,
    });
  }

  messages.push({
    role: 'user',
    content,
  });

  const response = await firstValueFrom<
    AxiosResponse<OllamaChatResponse>
  >(
    httpService.post<OllamaChatResponse>(
      'http://localhost:11434/api/chat',
      {
        model: 'qwen2.5-coder:7b',
        messages,
        stream: false,
      },
    ),
  );

  return response.data.message.content;
};