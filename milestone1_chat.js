import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { tools, handleGetCustomer } from './tools/get-customer-info.js';

const client = new Anthropic();
const rl = createInterface({ input: stdin, output: stdout });

const SYSTEM = "You are a helpful customer support assistant.";
const MODEL = 'claude-sonnet-4-6';
const messages = [];

while (true) {
    const userInput = await rl.question('You: ');
    messages.push({ role: 'user', content: userInput });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages,                 // <-- LUÔN gửi full history, không phải chỉ tin nhắn mới
      tools,
      tool_choice: {type: 'auto'},
    });
    console.log(JSON.stringify(response.content, null, 2));
    console.log('stop_reason:', response.stop_reason);  // quan sát field này mỗi lượt

    messages.push({ role: 'assistant', content: response.content });
    if (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');

    const toolResults = toolUseBlocks.map(block => {
      let result;
      if (block.name === 'get_customers_info') {
        result = handleGetCustomer(block.input);
      }
      return {
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      };
    });

    messages.push({ role: 'user', content: toolResults });

    const followUp = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages,
      tools,
    });
  messages.push({ role: 'assistant', content: followUp.content });
    console.log('Claude:', followUp.content.find(b => b.type === 'text')?.text ?? '');
  } else {
    console.log('Claude:', response.content.find(b => b.type === 'text')?.text ?? '');
  }

  }
