
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { Request, Response } from 'express';

@Controller('ai')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) { }

  @Post('generate')
  async generate(@Body() body: { prompt: string }) {
    const response = await this.ollamaService.generate(body.prompt);

    return {
      success: true,
      response,
    };
  }


  @Post('create/stream')
  async createTemplateStream(
    @Req() req: Request,
    @Body() { prompt, priorAnswers }: any,
    @Res() res: Response,
  ) {
    let disconnected = false;

    req.on('close', () => {
      disconnected = true;
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (payload: Record<string, any>) => {
      if (disconnected) {
        return;
      }

      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      send({
        type: 'start',
        message: 'Starting template generation',
      });

    

      const result =
        await this.ollamaService.createTemplateUsingAIStream(
          prompt,
          {
            // abortSignal: () => disconnected,

            // onChunk: (text) =>
            //   send({
            //     type: 'chunk',
            //     text,
            //   }),

            onMeta: (meta) =>
              send({
                type: 'meta',
                ...meta,
              }),

            onVariable: (variable) =>
              send({
                type: 'variable',
                variable,
              }),

            onContent: (node) =>
              send({
                type: 'content',
                node,
              }),

            onSettings: (settings) =>
              send({
                type: 'settings',
                settings,
              }),

            onAskUser: (question) =>
              send({
                type: 'ask_user',
                ...question,
              }),

            onAwaitingAnswers: () =>
              send({
                type: 'awaiting_answers',
              }),

            onError: (message) =>
              send({
                type: 'error',
                message,
              }),
          },
        );

      send({
        type: 'done',
        data: result,
      });
    } catch (error: any) {
      send({
        type: 'error',
        message: error?.message,
      });
    } finally {
      res.end();
    }
  }
}