export function handleEscalate({ reason, summary }) {
    return { status: 'escalated', reason, summary };
}

export const escalateTool = {
	name: 'escalate_to_human',
	description: 'Hands off the conversation to a human agent. Use when policy does not cover the request, the customer explicitly asks for a human, or a refund exceeds the auto-approval limit.',
	input_schema: {
		type: 'object',
		properties: {
			reason: { type: 'string', description: 'Reason why this tool is used, e.g. "Customer asked to talk with a human agent about order ORD-2001"' },
			summary: { type: 'string', description: 'Structured summary of the case for the human agent' },
		},
		required: ['reason', 'summary'],
	},
};
