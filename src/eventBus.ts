import type { DisposableStore, IDisposable } from './lifecycle'

type ListenFn<Arguments extends any[]> = (...args: Arguments) => void

export class EventBus<Events extends Record<string, any[]>> implements IDisposable {
  private readonly _events = new Map<keyof Events, Set<ListenFn<any[]>>>()

  on<E extends keyof Events>(
    event: E,
    listener: ListenFn<Events[E]>,
  ): IDisposable {
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
    const listeners = this._events.get(event)
    listeners?.forEach(listener => listener(...args))
  }

  dispose(event?: keyof Events) {
    if (event)
      this._events.delete(event)
    else
      this._events.clear()
  }
}
