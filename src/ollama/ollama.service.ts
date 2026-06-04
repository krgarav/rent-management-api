// ollama.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TEMPLATE_GENERATOR_STREAM_PROMPT } from './helper';

@Injectable()
export class OllamaService {
  constructor(private readonly httpService: HttpService) {}

  async generate(prompt: string) {
    const updatedPrompt = prompt + TEMPLATE_GENERATOR_STREAM_PROMPT
    const { data } = await firstValueFrom(
      this.httpService.post('http://localhost:11434/api/generate', {
        model: 'qwen2.5-coder:7b',
        prompt:updatedPrompt ,
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
}