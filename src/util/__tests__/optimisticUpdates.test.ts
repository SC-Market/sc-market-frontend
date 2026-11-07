import { describe, expect, it, vi } from "vitest"
import { makeStore } from "../../store/store"
import { browserNetworkEnv } from "../../store/browserNetworkEnv"
import { createOptimisticUpdate } from "../optimisticUpdates"

describe("createOptimisticUpdate", () => {
  const { dispatch } = makeStore({ networkEnv: browserNetworkEnv })

  it("keeps the patches when the request succeeds", async () => {
    const undo = vi.fn()
    await createOptimisticUpdate(
      () => ({ undo }),
      Promise.resolve({ data: "ok" }),
      dispatch,
    )
    expect(undo).not.toHaveBeenCalled()
  })

  it("rolls back on failure and resolves: onQueryStarted's promise is never handled", async () => {
    const undo = [vi.fn(), vi.fn()]
    // queryFulfilled rejects with RTK's { error } object, not an Error.
    const failed = Promise.reject({
      error: { status: "FETCH_ERROR", error: "TypeError: Load failed" },
      isUnhandledError: false,
    })
    await expect(
      createOptimisticUpdate(
        () => undo.map((fn) => ({ undo: fn })),
        failed,
        dispatch,
      ),
    ).resolves.toBeUndefined()
    expect(undo[0]).toHaveBeenCalledTimes(1)
    expect(undo[1]).toHaveBeenCalledTimes(1)
  })
})
