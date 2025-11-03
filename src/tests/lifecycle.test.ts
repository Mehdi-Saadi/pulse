import { describe, expect, it, vi } from 'vitest'
import { DisposableStore } from './../lifecycle'

describe('disposable store', () => {
  it('should call dispose() on all registered disposables when disposed', () => {
    const dispose1 = vi.fn()
    const dispose2 = vi.fn()
    const store = new DisposableStore()

    store.add({ dispose: dispose1 })
    store.add({ dispose: dispose2 })

    store.dispose()

    expect(dispose1).toHaveBeenCalledTimes(1)
    expect(dispose2).toHaveBeenCalledTimes(1)
  })

  it('should call added function immediately if already disposed', () => {
    const dispose = vi.fn()
    const store = new DisposableStore()
    store.dispose()

    store.add({ dispose })
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('should call function-style disposable directly on dispose()', () => {
    const fn = vi.fn()
    const store = new DisposableStore()

    store.add(fn)
    store.dispose()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should clear disposables after dispose()', () => {
    const fn = vi.fn()
    const store = new DisposableStore()

    store.add(fn)
    store.dispose()

    // Clear is internal, but we can check behavior by re-disposing
    store.dispose()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call dispose multiple times for the same disposable', () => {
    const fn = vi.fn()
    const store = new DisposableStore()

    store.add(fn)
    store.dispose()
    store.dispose()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should add multiple disposables and dispose them all', () => {
    const fns = [vi.fn(), vi.fn(), vi.fn()]
    const store = new DisposableStore()

    fns.forEach(fn => store.add(fn))
    store.dispose()

    fns.forEach(fn => expect(fn).toHaveBeenCalledTimes(1))
  })
})
