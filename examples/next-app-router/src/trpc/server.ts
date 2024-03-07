import 'server-only';
import { QueryClient } from '@tanstack/react-query';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { inferRouterOutputs } from '@trpc/server';
import { auth } from '~/lib/auth';
import { createCallerFactory, createTRPCContext } from '~/trpc/init';
import { appRouter } from '~/trpc/routers/_app';
import { headers } from 'next/headers';
import { cache } from 'react';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const _headers = new Headers(headers());
  _headers.set('x-trpc-source', 'rsc');

  return createTRPCContext({
    headers: _headers,
    session: await auth(),
  });
});

const getQueryClient = cache(() => new QueryClient());
const caller = createCallerFactory(appRouter)(createContext);

export const { trpc, HydrateClient, PrefetchQuery } = createHydrationHelpers<
  typeof appRouter
>(caller, getQueryClient);

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;