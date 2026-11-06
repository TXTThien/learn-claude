# Learn Claude — Cấu trúc project & Lộ trình thực chiến

Thực hành theo 5 chương đầu của hướng dẫn ôn thi **Claude Certified Architect — Foundations**
(https://github.com/paullarionov/claude-certified-architect), bằng Node.js.

## Cấu trúc thư mục đề xuất

```
support-agent-cli/
├── .env                      # ANTHROPIC_API_KEY=...
├── .mcp.json                 # (tùy chọn, Ch.4 — nếu làm MCP server riêng)
├── CLAUDE.md                 # Ch.5 — chuẩn code, convention cho project này
├── .claude/
│   └── rules/
│       └── testing.md        # Ch.5 — path-scoped rule, ví dụ paths: ["tests/**/*"]
├── data/
│   ├── customers.js          # mock data
│   └── orders.js
├── tools/
│   ├── definitions.js        # Ch.2 — JSON schema của 4 tool
│   └── handlers.js           # logic thật của get_customer, lookup_order, process_refund, escalate_to_human
├── agent/
│   ├── loop.js                # Ch.1+3 — vòng lặp agentic (check stop_reason)
│   ├── hooks.js                # Ch.3 — PreToolUse chặn refund > ngưỡng, PostToolUse chuẩn hóa data
│   └── errors.js                # Ch.4 — structured error (errorCategory, isRetryable)
├── cli.js                     # entrypoint, in hội thoại ra terminal
└── tests/
    └── test_agent.js          # test case tự viết để tự chấm
```

**Tình trạng hiện tại:** `milestone1_chat.js` đang gộp vai trò của `cli.js` + `agent/loop.js`;
`data/customers.js` và `tools/get-customer-info.js` là tiền thân của `data/customers.js` +
`tools/definitions.js` + `tools/handlers.js` (gộp chung 1 file, tách ra sau nếu phình to).

## 5 Milestone (bám theo 5 chương)

### Milestone 1 (Ch.1 — Claude API nền tảng)
Gọi được `client.messages.create()` đơn giản, không tool. Mục tiêu: hiểu rõ phải tự truyền lại
**toàn bộ `messages`** ở mỗi lượt (API stateless). Tự kiểm tra: tắt việc gửi lại history, hỏi
"tôi vừa nói gì?" — xác nhận model "quên" ngay.

### Milestone 2 (Ch.2 — tool_use + JSON Schema) ← đang ở đây
Định nghĩa đúng 4 tool, mô tả tool phải đủ chi tiết (input format, ví dụ, ranh giới dùng).
Tự kiểm tra: hỏi câu mơ hồ, xem model chọn đúng tool hay nhầm; nếu nhầm, sửa description
chứ không phải thêm code.

### Milestone 3 (Ch.3 — Agentic loop + hook)
Viết vòng lặp: gửi → check `stop_reason` (`tool_use` thì chạy tool rồi lặp lại, `end_turn` thì
dừng) — tổng quát hóa thành `while` thay vì gọi thủ công 2 lần. Thêm 1 "hook" dạng hàm chặn
cứng: `process_refund` chỉ chạy được sau khi `get_customer` đã xác thực, và chặn số tiền
> ngưỡng → escalation.

### Milestone 4 (Ch.4 — MCP-style error handling)
Mỗi tool khi fail trả về `{"isError": true, "errorCategory": "transient|validation|business",
"isRetryable": bool, "message": "..."}` thay vì string lỗi chung chung. Tự kiểm tra: giả lập
timeout cho `lookup_order`, xem agent loop có đọc được `isRetryable` để quyết định retry hay
escalate không.

### Milestone 5 (Ch.5 — Claude Code thật, không phải code Node)
Chạy ngay trong chính thư mục project này bằng Claude Code:
- Viết `CLAUDE.md` mô tả convention project
- Tạo `.claude/rules/testing.md` với `paths: ["tests/**/*"]`
- Thử `/plan` khi nhờ refactor lớn, so với thực thi trực tiếp khi sửa bug nhỏ
- Thử `claude -p "review code trong tools/get-customer-info.js"` mô phỏng CI
