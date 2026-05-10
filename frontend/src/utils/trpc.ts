import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

export const api = createTRPCReact<any>();

export function getTrpcClient() {
  return api.createClient({
    links: [
      httpBatchLink({
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/trpc',
      }),
    ],
  });
}

