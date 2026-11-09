export function toolError(category, isRetryable, message, extra = {}) {
    return { isError: true, errorCategory: category, isRetryable, message, ...extra };
}
