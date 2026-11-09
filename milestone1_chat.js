import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { tools as customerTools, handleGetCustomer } from './tools/get-customer-info.js';
import { processRefundTool, handleProcessRefund } from './tools/process-refund.js';
import { escalateTool, handleEscalate } from './tools/escalate.js';

const client = new Anthropic();
const rl = createInterface({ input: stdin, output: stdout });

const SYSTEM = "You are a helpful customer support assistant.";
const MODEL = 'claude-haiku-5-5';

const allTools = [...customerTools, processRefundTool, escalateTool];

let verifiedCustomer = null;
const REFUND_LIMIT = 500;

function toResult(block, result) {
  return { type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) };
}

function executeTool(block) {
  if (block.name === 'get_customers_info') {
    const result = handleGetCustomer(block.input);
    if (!result.isError) verifiedCustomer = result;
    return toResult(block, result);
  }

  if (block.name === 'process_refund') {
    if (!verifiedCustomer) {
      return toResult(block, toolError('business', false, 'Customer not verified yet. Call get_customers_info first.'));
    }
    if (!verifiedCustomer.order_history.includes(block.input.order_id)) {
      return toResult(block, toolError('validation', false, `Order ${block.input.order_id} does not belong to this customer.`));
    }
    if (block.input.amount > REFUND_LIMIT) {
      return toResult(block, toolError('business', false, `Amount exceeds auto-approval limit of $${REFUND_LIMIT}. Escalate to human.`));
    }
    return toResult(block, handleProcessRefund(block.input));
  }

  if (block.name === 'escalate_to_human') {
    return toResult(block, handleEscalate(block.input));
  }

  return toResult(block, { error: 'unknown_tool', tool_name: block.name });
}

async function runUntilDone(messages) {
  while (true) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages,
      tools: allTools,
    });
    messages.push({ role: 'assistant', content: response.content });

    console.log(JSON.stringify(response.content, null, 2));
    console.log('stop_reason:', response.stop_reason);

    if (response.stop_reason !== 'tool_use') {
      return response; // end_turn -> dừng, trả response cuối cùng ra ngoài
    }

    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    const toolResults = toolUseBlocks.map(executeTool);
    messages.push({ role: 'user', content: toolResults });
    // không return ở đây -> quay lại đầu while, gọi API tiếp
  }
}

const messages = [];

while (true) {
  const userInput = await rl.question('You: ');
  messages.push({ role: 'user', content: userInput });

  const finalResponse = await runUntilDone(messages);
  console.log('Claude:', finalResponse.content.find(b => b.type === 'text')?.text ?? '');
}
