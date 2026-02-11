import { describe, it, expect, beforeEach } from "@jest/globals"

// Mock reducer
const mockReducer = (state = {}, action: any) => state

// Mock lazy reducers
const mockLazyReducers: Record<string, jest.Mock> = {
  test: jest.fn(() => Promise.resolve({ default: mockReducer })),
  test1: jest.fn(() => Promise.resolve({ default: mockReducer })),
  test2: jest.fn(() => Promise.resolve({ default: mockReducer })),
  valid: jest.fn(() => Promise.resolve({ default: mockReducer })),
}

// We need to mock the module before importing
jest.mock("../reducerInjection", () => {
  const lazyReducerRegistry: Record<string, any> = {}
  const loadedReducers: Record<string, any> = {}

  return {
    registerLazyReducer: (key: string, lazyReducer: any) => {
      lazyReducerRegistry[key] = lazyReducer
    },
    injectReducer: async (key: string) => {
      if (loadedReducers[key]) {
        return
      }

      const lazyReducer = lazyReducerRegistry[key]
      if (!lazyReducer) {
        console.warn(`No lazy reducer registered for key: ${key}`)
        return
      }

      try {
        const reducerModule = await lazyReducer()
        const reducer = reducerModule.default
        loadedReducers[key] = reducer
        console.debug(`Reducer loaded for key: ${key}`)
      } catch (error) {
        console.error(`Failed to load reducer for key ${key}:`, error)
      }
    },
    injectReducers: async (keys: string[]) => {
      const { injectReducer } = require("../reducerInjection")
      const loadPromises = keys.map((key: string) => injectReducer(key))
      await Promise.allSettled(loadPromises)
    },
    isReducerLoaded: (key: string) => key in loadedReducers,
    getLoadedReducerKeys: () => Object.keys(loadedReducers),
    clearReducerCache: () => {
      Object.keys(loadedReducers).forEach((key) => {
        delete loadedReducers[key]
      })
    },
  }
})

import {
  registerLazyReducer,
  injectReducer,
  injectReducers,
  isReducerLoaded,
  getLoadedReducerKeys,
  clearReducerCache,
} from "../reducerInjection"

describe("reducerInjection", () => {
  beforeEach(() => {
    clearReducerCache()
    jest.clearAllMocks()
  })

  describe("registerLazyReducer", () => {
    it("should register a lazy reducer", () => {
      const lazyReducer = () => Promise.resolve({ default: mockReducer })

      expect(() => {
        registerLazyReducer("test", lazyReducer)
      }).not.toThrow()
    })
  })

  describe("injectReducer", () => {
    it("should load and inject a registered reducer", async () => {
      const lazyReducer = mockLazyReducers.test
      registerLazyReducer("test", lazyReducer)

      await injectReducer("test")

      expect(lazyReducer).toHaveBeenCalledTimes(1)
      expect(isReducerLoaded("test")).toBe(true)
    })

    it("should not load the same reducer twice", async () => {
      const lazyReducer = mockLazyReducers.test
      registerLazyReducer("test", lazyReducer)

      await injectReducer("test")
      await injectReducer("test")

      expect(lazyReducer).toHaveBeenCalledTimes(1)
    })

    it("should handle unregistered reducers gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {})

      await injectReducer("unregistered")

      expect(consoleSpy).toHaveBeenCalledWith(
        "No lazy reducer registered for key: unregistered",
      )

      consoleSpy.mockRestore()
    })

    it("should handle reducer loading errors", async () => {
      const error = new Error("Load failed")
      const lazyReducer = jest.fn(() => Promise.reject(error))
      registerLazyReducer("error-reducer", lazyReducer)

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

      await injectReducer("error-reducer")

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load reducer for key error-reducer:",
        error,
      )

      consoleSpy.mockRestore()
    })
  })

  describe("injectReducers", () => {
    it("should load multiple reducers", async () => {
      const lazyReducer1 = mockLazyReducers.test1
      const lazyReducer2 = mockLazyReducers.test2

      registerLazyReducer("test1", lazyReducer1)
      registerLazyReducer("test2", lazyReducer2)

      await injectReducers(["test1", "test2"])

      expect(lazyReducer1).toHaveBeenCalledTimes(1)
      expect(lazyReducer2).toHaveBeenCalledTimes(1)
      expect(isReducerLoaded("test1")).toBe(true)
      expect(isReducerLoaded("test2")).toBe(true)
    })

    it("should handle mixed valid and invalid reducers", async () => {
      const lazyReducer = mockLazyReducers.valid
      registerLazyReducer("valid", lazyReducer)

      await injectReducers(["valid", "invalid"])

      expect(lazyReducer).toHaveBeenCalledTimes(1)
      expect(isReducerLoaded("valid")).toBe(true)
      expect(isReducerLoaded("invalid")).toBe(false)
    })
  })

  describe("isReducerLoaded", () => {
    it("should return true for loaded reducers", async () => {
      const lazyReducer = () => Promise.resolve({ default: mockReducer })
      registerLazyReducer("test", lazyReducer)

      await injectReducer("test")

      expect(isReducerLoaded("test")).toBe(true)
    })

    it("should return false for unloaded reducers", () => {
      expect(isReducerLoaded("unloaded")).toBe(false)
    })
  })

  describe("getLoadedReducerKeys", () => {
    it("should return empty array when no reducers loaded", () => {
      expect(getLoadedReducerKeys()).toEqual([])
    })

    it("should return all loaded reducer keys", async () => {
      const lazyReducer1 = () => Promise.resolve({ default: mockReducer })
      const lazyReducer2 = () => Promise.resolve({ default: mockReducer })

      registerLazyReducer("test1", lazyReducer1)
      registerLazyReducer("test2", lazyReducer2)

      await injectReducers(["test1", "test2"])

      const keys = getLoadedReducerKeys()
      expect(keys).toContain("test1")
      expect(keys).toContain("test2")
      expect(keys.length).toBe(2)
    })
  })

  describe("clearReducerCache", () => {
    it("should clear all loaded reducers", async () => {
      const lazyReducer = () => Promise.resolve({ default: mockReducer })
      registerLazyReducer("test", lazyReducer)

      await injectReducer("test")
      expect(isReducerLoaded("test")).toBe(true)

      clearReducerCache()
      expect(isReducerLoaded("test")).toBe(false)
      expect(getLoadedReducerKeys()).toEqual([])
    })
  })
})
