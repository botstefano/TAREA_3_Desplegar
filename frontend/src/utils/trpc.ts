import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    return '';
  }

  return 'http://localhost:4000';
};

export const api = createTRPCReact<any>() as any;

export const getTrpcClient = () =>
  api.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
      }),
    ],
  });

