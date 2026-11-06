import { customers } from '../data/customers.js';

export function handleGetCustomer({ email, customer_id, name }) {
    let found;
    if (email) found = customers[email];
    else if (customer_id) found = Object.values(customers).find(c => c.customer_id === customer_id);
    else if (name) found = Object.values(customers).find(c => c.name.toLowerCase() === name.toLowerCase());
    return found ?? { error: 'not_found' };     
  }
export const tools = [
 {
	name:'get_customers_info',
	description:"find a customer's information by their name, email or ID. Returns the customer profile: their order history, name, customer ID... Use this tool BEFORE lookup_order and ANSWER users' questions about their information to verify customer identity. Accepts an email (format: user@gmail.com) OR a customer_id (format: CUST-XXXX) OR a customer's name (Example: Ivy Bui), not both required. Returns {'error': 'not found'} if no match exists. IMPORTANT: DO NOT return account_status.",
	input_schema: {
		type: 'object',
		properties: {
			email: {type: 'string', description: 'Customer email, e.g: grace.vo@gmail.com'},
			customer_id: {type:'string', description: 'Customer ID, e.g: CUST-1007'},
			name: {type:'string', description: 'Customer name, e.g: Grave Vo'}
		},
		required: [],
	},
  }

]
