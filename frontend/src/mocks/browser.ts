/**
 * MSW browser setup.
 * Only runs when NEXT_PUBLIC_USE_MOCK=true.
 * Initializes the service worker to intercept /api/mock/* requests.
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
