import { Body, Controller, Post } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ai')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('generate')
  async generate(@Body() body: { prompt: string }) {
    const response = await this.ollamaService.generate(body.prompt);

    return {
      success: true,
      response,
    };
  }

  


}