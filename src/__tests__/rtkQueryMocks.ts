/**
 * Typed helpers for stubbing generated RTK Query hooks in tests.
 *
 * Tests stub hooks with `vi.spyOn(api.endpoints.foo, "useQuery")`. The value
 * handed to `mockReturnValue` has to look like a real RTK Query hook result,
 * which is a discriminated union with a dozen bookkeeping fields. These
 * factories build complete, valid members of that union so the `data` a test
 * supplies is still checked against the endpoint's *generated* response type —
 * if the OpenAPI contract drifts, the stub stops compiling.
 */
import { vi } from "vitest"
import type { Mock } from "vitest"
import { QueryStatus } from "@reduxjs/toolkit/query/react"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import type { SerializedError } from "@reduxjs/toolkit"

/**
 * A generated `api.endpoints.foo` query endpoint.
 *
 * Typing the factories against the endpoint object — rather than restating a
 * base query — makes the produced value *exactly* the type
 * `vi.spyOn(endpoint, "useQuery").mockReturnValue()` demands, tag types and
 * retry options included.
 */
export type AnyQueryEndpoint = {
  useQuery: (...args: never[]) => unknown
  Types: { ResultType: unknown; QueryArg: unknown }
}

/** A generated `api.endpoints.foo` mutation endpoint. */
export type AnyMutationEndpoint = {
  useMutation: (...args: never[]) => unknown
  Types: { ResultType: unknown; QueryArg: unknown }
}

/**
 * The generated response type a query endpoint resolves to.
 *
 * RTK Query attaches a phantom `Types` property to every endpoint carrying its
 * declaration types, which is the precise source for the endpoint's OpenAPI
 * response type.
 */
export type QueryDataOf<E extends AnyQueryEndpoint> = E["Types"]["ResultType"]

/** The query-argument type a query endpoint accepts. */
export type QueryArgOf<E extends AnyQueryEndpoint> = E["Types"]["QueryArg"]

/** The hook result type of a generated query endpoint. */
export type QueryResultOf<E extends AnyQueryEndpoint> = ReturnType<
  E["useQuery"]
>

/** The generated response type a mutation endpoint resolves to. */
export type MutationDataOf<E extends AnyMutationEndpoint> =
  E["Types"]["ResultType"]

/** The `[trigger, state]` tuple type of a generated mutation endpoint. */
export type MutationResultOf<E extends AnyMutationEndpoint> = ReturnType<
  E["useMutation"]
>

/** The trigger half of a generated mutation endpoint's hook tuple. */
export type MutationTriggerOf<E extends AnyMutationEndpoint> =
  MutationResultOf<E> extends readonly [infer T, unknown] ? T : never

/** The state half of a generated mutation endpoint's hook tuple. */
export type MutationStateOf<E extends AnyMutationEndpoint> =
  MutationResultOf<E> extends readonly [unknown, infer S] ? S : never

/** The RTK Query error shape a hook can surface. */
export type MockQueryError = FetchBaseQueryError | SerializedError

/** The `refetch` member of a query hook result. */
type AnyRefetch<E extends AnyQueryEndpoint> = QueryResultOf<E> extends {
  refetch: infer R
}
  ? R
  : never

const BASE_TIMESTAMP = 1700000000000

/**
 * Real `refetch` returns a branded `SafePromise` carrying the entire
 * query-thunk API (abort/unsubscribe/queryCacheKey/...). No test inspects that
 * return value — they only assert refetch was called — so the spy is narrowed
 * here, once, instead of at every call site.
 */
function asRefetch<E extends AnyQueryEndpoint>(
  spy: () => void,
): AnyRefetch<E> {
  return spy as unknown as AnyRefetch<E>
}

/**
 * A settled, successful query result carrying `data`.
 *
 * Pass the endpoint as the type argument —
 * `querySuccess<typeof marketV2Api.endpoints.getWishlist>(data)` — and `data`
 * is checked against that endpoint's *generated* response type while the
 * returned object matches exactly what `mockReturnValue` expects.
 */
export function querySuccess<E extends AnyQueryEndpoint>(
  data: QueryDataOf<E>,
  refetch: () => void = vi.fn(),
): QueryResultOf<E> {
  return {
    data,
    currentData: data,
    error: undefined,
    status: QueryStatus.fulfilled,
    isUninitialized: false,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    fulfilledTimeStamp: BASE_TIMESTAMP,
    refetch: asRefetch<E>(refetch),
  } as unknown as QueryResultOf<E>
}

/** A successful result that is refetching in the background. */
export function queryRefetching<E extends AnyQueryEndpoint>(
  data: QueryDataOf<E>,
  refetch: () => void = vi.fn(),
): QueryResultOf<E> {
  return {
    data,
    currentData: data,
    error: undefined,
    status: QueryStatus.pending,
    isUninitialized: false,
    isLoading: false,
    isFetching: true,
    isSuccess: true,
    isError: false,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    fulfilledTimeStamp: BASE_TIMESTAMP,
    refetch: asRefetch<E>(refetch),
  } as unknown as QueryResultOf<E>
}

/** A first-load query result with no data yet. */
export function queryLoading<E extends AnyQueryEndpoint>(
  refetch: () => void = vi.fn(),
): QueryResultOf<E> {
  return {
    data: undefined,
    currentData: undefined,
    error: undefined,
    status: QueryStatus.pending,
    isUninitialized: false,
    isLoading: true,
    isFetching: true,
    isSuccess: false,
    isError: false,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    fulfilledTimeStamp: undefined,
    refetch: asRefetch<E>(refetch),
  } as unknown as QueryResultOf<E>
}

/** A failed query result. */
export function queryError<E extends AnyQueryEndpoint>(
  error: MockQueryError,
  refetch: () => void = vi.fn(),
): QueryResultOf<E> {
  return {
    data: undefined,
    currentData: undefined,
    error,
    status: QueryStatus.rejected,
    isUninitialized: false,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: true,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    fulfilledTimeStamp: undefined,
    refetch: asRefetch<E>(refetch),
  } as unknown as QueryResultOf<E>
}

/** A query result that has not been started (e.g. `skip: true`). */
export function queryUninitialized<E extends AnyQueryEndpoint>(
  refetch: () => void = vi.fn(),
): QueryResultOf<E> {
  return {
    data: undefined,
    currentData: undefined,
    error: undefined,
    status: QueryStatus.uninitialized,
    isUninitialized: true,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    refetch: asRefetch<E>(refetch),
  } as unknown as QueryResultOf<E>
}

/**
 * A `vi.fn()` standing in for a mutation trigger.
 *
 * The real trigger returns a `MutationActionCreatorResult` — a branded
 * `SafePromise` with `arg`/`requestId`/`abort`/`unwrap`/`reset` attached. Tests
 * only ever call `.unwrap()` on it or assert the trigger's arguments, so the
 * spy is narrowed here rather than at every call site. Pass `unwrapResult` to
 * control what `.unwrap()` resolves to; it is checked against the endpoint's
 * generated response type.
 */
export function mockMutationTrigger<E extends AnyMutationEndpoint>(
  unwrapResult?: MutationDataOf<E>,
): MutationTriggerOf<E> & Mock {
  const trigger = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue(unwrapResult),
    reset: vi.fn(),
    abort: vi.fn(),
  }))
  return trigger as unknown as MutationTriggerOf<E> & Mock
}

/** The idle state half of a `[trigger, state]` mutation hook tuple. */
export function mutationIdle<E extends AnyMutationEndpoint>(): MutationStateOf<E> {
  return {
    data: undefined,
    error: undefined,
    status: QueryStatus.uninitialized,
    isUninitialized: true,
    isLoading: false,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
  } as unknown as MutationStateOf<E>
}

/** The in-flight state half of a `[trigger, state]` mutation hook tuple. */
export function mutationLoading<E extends AnyMutationEndpoint>(): MutationStateOf<E> {
  return {
    data: undefined,
    error: undefined,
    status: QueryStatus.pending,
    isUninitialized: false,
    isLoading: true,
    isSuccess: false,
    isError: false,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    reset: vi.fn(),
  } as unknown as MutationStateOf<E>
}

/** The settled-success state half of a mutation hook tuple. */
export function mutationSuccess<E extends AnyMutationEndpoint>(
  data: MutationDataOf<E>,
): MutationStateOf<E> {
  return {
    data,
    error: undefined,
    status: QueryStatus.fulfilled,
    isUninitialized: false,
    isLoading: false,
    isSuccess: true,
    isError: false,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    fulfilledTimeStamp: BASE_TIMESTAMP,
    reset: vi.fn(),
  } as unknown as MutationStateOf<E>
}

/** The settled-error state half of a mutation hook tuple. */
export function mutationError<E extends AnyMutationEndpoint>(
  error: MockQueryError,
): MutationStateOf<E> {
  return {
    data: undefined,
    error,
    status: QueryStatus.rejected,
    isUninitialized: false,
    isLoading: false,
    isSuccess: false,
    isError: true,
    requestId: "mock-request-id",
    endpointName: "mockEndpoint",
    startedTimeStamp: BASE_TIMESTAMP,
    reset: vi.fn(),
  } as unknown as MutationStateOf<E>
}

/** A full `[trigger, state]` tuple as returned by a `useMutation` hook. */
export function mockMutationHook<E extends AnyMutationEndpoint>(
  unwrapResult?: MutationDataOf<E>,
): MutationResultOf<E> {
  return [
    mockMutationTrigger<E>(unwrapResult),
    mutationIdle<E>(),
  ] as unknown as MutationResultOf<E>
}
