/**
 * AI Chat API Route
 * 按照life-recorder项目的SSE流式响应实现
 */

import { openai } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { messages, model = 'gpt-4o-mini', stream = true } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    if (stream === false || stream === "false" || stream === 0) {
      const result = await generateText({
        model: openai(model),
        messages: messages,
        temperature: 0.7,
      });

      return new Response(result.text, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 使用AI SDK v5的streamText
    const result = await streamText({
      model: openai(model),
      messages: messages,
      temperature: 0.7,
    });

    // 转换为life-recorder的SSE格式
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            // 按照life-recorder的格式：data: {"content":"chunk"}
            const sseData = `data: {"content":"${chunk}"}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
          
          // 发送结束标记
          const endData = `data: [DONE]\n\n`;
          controller.enqueue(encoder.encode(endData));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: errorMessage
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

