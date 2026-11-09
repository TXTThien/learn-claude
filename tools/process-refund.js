import { toolError } from './errors.js';

export function handleProcessRefund({ order_id, amount }) {
    if (Math.random() < 0.3) {   // 30% giả lập timeout
      return toolError('transient', true, 'Payment gateway timeout, please retry.');
    }
    return { status: 'refunded', order_id, amount };
}

export const processRefundTool = {
	name: 'process_refund',
	description: 'Processes a refund for a given order. Requires order_id and amount in USD. Only call this AFTER the customer identity has been verified via get_customers_info.',
	input_schema: {
		type: 'object',
		properties: {
			order_id: { type: 'string', description: 'Order ID e.g. ORD-2001' },
			amount: { type: 'number', description: 'Refund amount in USD, e.g. 100' },
		},
		required: ['order_id', 'amount'],
	},
};
