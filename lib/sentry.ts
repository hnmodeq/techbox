import * as Sentry from "@sentry/nextjs";

export function captureError(error: unknown, context?: Record<string, any>) {
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: context });
  } else {
    Sentry.captureMessage(String(error), { extra: context });
  }
}

export function captureApiError(
  error: unknown,
  endpoint: string,
  method: string,
  userId?: string
) {
  Sentry.withScope((scope) => {
    scope.setTag("endpoint", endpoint);
    scope.setTag("method", method);
    if (userId) scope.setUser({ id: userId });
    captureError(error, { type: "api_error" });
  });
}

export function captureUploadError(error: unknown, fileName?: string, userId?: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "upload");
    if (fileName) scope.setExtra("fileName", fileName);
    if (userId) scope.setUser({ id: userId });
    captureError(error);
  });
}

export function capturePrismaError(error: unknown, operation: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "prisma");
    scope.setTag("operation", operation);
    captureError(error);
  });
}

export function captureAuthError(error: unknown, event: string, userId?: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "auth");
    scope.setTag("auth_event", event);
    if (userId) scope.setUser({ id: userId });
    captureError(error);
  });
}

export { Sentry };
