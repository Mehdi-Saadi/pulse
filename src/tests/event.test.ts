import { describe, expect, it, vi } from 'vitest'
import { EventBus } from './../event'
import { DisposableStore } from './../lifecycle'

// Define event map for testing
// eslint-disable-next-line ts/consistent-type-definitions
type TestEvents = {
  foo: [number, string]
  bar: []
}

describe('eventBus', () => {
  it('should call listeners when event is emitted (sync)', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const listener = vi.fn()

    bus.on('foo', listener)
    bus.emit('foo', 1, 'a')

    expect(listener).toHaveBeenCalledWith(1, 'a')
  })

  it('should call listeners asynchronously by default', async () => {
    const bus = new EventBus<TestEvents>()
    const listener = vi.fn()

    bus.on('foo', listener)
    bus.emit('foo', 42, 'async')

    expect(listener).not.toHaveBeenCalled()
    await Promise.resolve() // wait microtask
    expect(listener).toHaveBeenCalledWith(42, 'async')
  })

  it('should support multiple listeners for the same event', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const a = vi.fn()
    const b = vi.fn()

    bus.on('foo', a)
    bus.on('foo', b)
    bus.emit('foo', 2, 'x')

    expect(a).toHaveBeenCalledWith(2, 'x')
    expect(b).toHaveBeenCalledWith(2, 'x')
  })

  it('should not call removed listeners', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const listener = vi.fn()

    const disposable = bus.on('foo', listener)
    disposable.dispose()

    bus.emit('foo', 1, 'ignored')
    expect(listener).not.toHaveBeenCalled()
  })

  it('should call once listeners only once', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const listener = vi.fn()

    bus.once('foo', listener)
    bus.emit('foo', 1, 'a')
    bus.emit('foo', 2, 'b')

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(1, 'a')
    expect(listener).not.toHaveBeenCalledWith(2, 'b')
  })

  it('should handle errors in listeners gracefully', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const error = new Error('test')
    const faulty = vi.fn(() => {
      throw error
    })
    const good = vi.fn()

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    bus.on('foo', faulty)
    bus.on('foo', good)

    expect(() => bus.emit('foo', 0, 'err')).not.toThrow()
    expect(good).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith(error)

    spy.mockRestore()
  })

  it('should warn on recursive emit', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    bus.on('foo', () => bus.emit('foo', 1, 'loop'))
    bus.emit('foo', 1, 'start')

    expect(warnSpy).toHaveBeenCalledWith('Recursive emit detected for event "foo"')
    warnSpy.mockRestore()
  })

  it('should dispose a specific event', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const fooListener = vi.fn()
    const barListener = vi.fn()

    bus.on('foo', fooListener)
    bus.on('bar', barListener)

    bus.dispose('foo')
    bus.emit('foo', 1, 'a')
    bus.emit('bar')

    expect(fooListener).not.toHaveBeenCalled()
    expect(barListener).toHaveBeenCalled()
  })

  it('should dispose all events', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const fooListener = vi.fn()

    bus.on('foo', fooListener)
    bus.dispose()

    expect(() => bus.emit('foo', 1, 'a')).toThrowError('EventBus has been disposed')
  })

  it('should throw when using after full dispose', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    bus.dispose()

    expect(() => bus.on('foo', vi.fn())).toThrowError('EventBus has been disposed')
    expect(() => bus.emit('foo', 1, 'x')).toThrowError('EventBus has been disposed')
  })

  it('should register scoped listeners into DisposableStore', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const scope = new DisposableStore()
    const listener = vi.fn()

    bus.scoped('foo', listener, scope)
    bus.emit('foo', 1, 'a')
    expect(listener).toHaveBeenCalled()

    // Dispose scope should remove listener
    scope.dispose()
    bus.emit('foo', 2, 'b')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should not fail when emitting event with no listeners', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    expect(() => bus.emit('foo', 1, 'no listeners')).not.toThrow()
  })

  it('should maintain consistent snapshot if listeners mutate', () => {
    const bus = new EventBus<TestEvents>({ sync: true })
    const first = vi.fn(() => {
      // eslint-disable-next-line ts/no-use-before-define
      dispose2.dispose()
    })
    const second = vi.fn()

    const dispose1 = bus.on('foo', first)
    const dispose2 = bus.on('foo', second)

    bus.emit('foo', 1, 'snapshot')

    expect(first).toHaveBeenCalled()
    expect(second).toHaveBeenCalled() // still called because snapshot captured before mutation
  })
})
