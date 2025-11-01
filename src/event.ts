import type { DisposableStore, IDisposable } from './lifecycle'

type ListenFn<Arguments extends any[]> = (...args: Arguments) => void

export class EventBus<Events extends Record<string, any[]>> implements IDisposable {
  private readonly _events = new Map<keyof Events, Set<ListenFn<any[]>>>()
  private _disposed = false

  on<E extends keyof Events>(
    event: E,
    listener: ListenFn<Events[E]>,
  ): IDisposable {
    this._checkDisposed()

    let listeners = this._events.get(event)

    if (!listeners) {
      listeners = new Set()
      this._events.set(event, listeners)
    }

    listeners.add(listener)

    return { dispose: () => listeners.delete(listener) }
  }

  once<E extends keyof Events>(
    event: E,
    listener: ListenFn<Events[E]>,
  ): IDisposable {
    const dispose = this.on(event, wrapper).dispose

    function wrapper(...args: Events[E]) {
      listener(...args)
      dispose()
    }

    return { dispose }
  }

  /**
   * Attaches a listener and automatically registers it
   * into a {@link DisposableStore} scope.
   */
  scoped<E extends keyof Events>(
    event: E,
    listener: ListenFn<Events[E]>,
    scope: DisposableStore,
  ) {
    scope.add(this.on(event, listener))
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]) {
    this._checkDisposed()

    const listeners = this._events.get(event)
    if (!listeners || listeners.size === 0)
      return

    // Snapshot listeners to guarantee consistent iteration
    // event if listeners mutate the set
    const snapshot = Array.from(listeners)
    for (const listener of snapshot) {
      try {
        listener(...args)
      }
      catch (error) {
        console.error(error)
      }
    }
  }

  dispose(event?: keyof Events) {
    this._checkDisposed()

    if (event) {
      this._events.delete(event)
    }
    else {
      this._events.clear()
      this._disposed = true
    }
  }

  private _checkDisposed() {
    if (this._disposed) {
      throw new Error('EventBus has been disposed')
    }
  }
}
