import type { DisposableStore, IDisposable } from './lifecycle'
import { toDisposable } from './lifecycle'

/**
 * Represents a generic listener function for an event.
 * Each event type defines its argument tuple via the generic type `Args`.
 */
type ListenFn<Args extends any[]> = (...args: Args) => void

/**
 * A lightweight, type-safe, and memory-efficient event bus implementation.
 *
 * The `EventBus` provides:
 * - **Type-safe event definitions:** via generic `Events` mapping keys to argument lists.
 * - **Disposable listeners:** via the {@link IDisposable} interface for easy cleanup.
 * - **Automatic disposal scopes:** through integration with {@link DisposableStore}.
 * - **Recursive emission prevention:** by tracking events currently being fired.
 * - **Synchronous or microtask-based asynchronous delivery** (configurable via constructor).
 *
 * Example usage:
 * ```ts
 * type MyEvents = {
 *   data: [string, number]
 *   close: []
 * }
 *
 * const bus = new EventBus<MyEvents>()
 * const listener = bus.on('data', (msg, count) => console.log(msg, count))
 * bus.emit('data', 'Hello', 42)
 * listener.dispose() // stop listening
 * ```
 */
export class EventBus<Events extends Record<string, any[]>> implements IDisposable {
  /** Stores registered listeners per event type. */
  private readonly _events = new Map<keyof Events, Set<ListenFn<any[]>>>()

  /** Keeps track of currently firing events to detect recursive emissions. */
  private readonly _firing = new Set<keyof Events>()

  /** Indicates whether the event bus has been disposed. */
  private _disposed = false

  /** Controls synchronous (`true`) or asynchronous (`false`) event dispatching. */
  private _sync: boolean

  /**
   * Creates a new `EventBus`.
   *
   * @param options.sync - If `true`, listeners are invoked synchronously.
   *                       If `false` (default), events are queued as microtasks.
   */
  constructor(options = { sync: false }) {
    this._sync = options.sync
  }

  /**
   * Subscribes to a specific event type.
   *
   * @param event - The event key to listen for.
   * @param listener - The function to be invoked when the event is emitted.
   * @returns An {@link IDisposable} handle that can be used to remove the listener.
   *
   * Example:
   * ```ts
   * const sub = bus.on('message', msg => console.log(msg))
   * sub.dispose() // stop listening
   * ```
   */
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

    return toDisposable(() => listeners.delete(listener))
  }

  /**
   * Subscribes to an event for a single invocation only.
   * The listener is automatically removed after being called once.
   *
   * @param event - The event key to listen for.
   * @param listener - The function to be invoked once when the event is emitted.
   * @returns An {@link IDisposable} to manually cancel the one-time listener before it's called.
   */
  once<E extends keyof Events>(
    event: E,
    listener: ListenFn<Events[E]>,
  ): IDisposable {
    const disposable = this.on(event, wrapper)

    function wrapper(...args: Events[E]) {
      listener(...args)
      disposable.dispose()
    }

    return disposable
  }

  /**
   * Subscribes to an event and automatically registers the subscription
   * into a {@link DisposableStore} for lifecycle management.
   *
   * @param event - The event key to listen for.
   * @param listener - The event listener function.
   * @param scope - The {@link DisposableStore} that manages the listener’s disposal.
   */
  scoped<E extends keyof Events>(
    event: E,
    listener: ListenFn<Events[E]>,
    scope: DisposableStore,
  ): void {
    scope.add(this.on(event, listener))
  }

  /**
   * Emits an event to all subscribed listeners.
   *
   * @param event - The event key to emit.
   * @param args - Arguments to pass to each listener.
   *
   * Notes:
   * - If an event is already being fired, recursive emissions are detected and logged as warnings.
   * - Listeners are called in insertion order.
   * - Errors thrown by individual listeners are caught and logged, ensuring others still run.
   */
  emit<E extends keyof Events>(event: E, ...args: Events[E]): void {
    this._checkDisposed()

    if (this._firing.has(event)) {
      console.warn(`Recursive emit detected for event "${String(event)}"`)
      return
    }

    const listeners = this._events.get(event)
    if (!listeners || listeners.size === 0)
      return

    // Take a snapshot to ensure consistent iteration
    // even if listeners are added/removed during emit
    const snapshot = Array.from(listeners)

    const invoke = () => {
      this._firing.add(event)
      try {
        for (const listener of snapshot) {
          try {
            listener(...args)
          }
          catch (error) {
            console.error(error)
          }
        }
      }
      finally {
        this._firing.delete(event)
      }
    }

    if (this._sync)
      invoke()
    else
      queueMicrotask(invoke)
  }

  /**
   * Disposes the event bus or clears a specific event’s listeners.
   *
   * @param event - Optional event key. If provided, only that event’s listeners are removed.
   *                Otherwise, all listeners are cleared and the bus is permanently disposed.
   */
  dispose(event?: keyof Events): void {
    this._checkDisposed()

    if (event) {
      this._events.delete(event)
    }
    else {
      this._events.clear()
      this._disposed = true
    }
  }

  /**
   * Ensures the event bus has not been disposed before performing operations.
   * Throws an error if already disposed.
   */
  private _checkDisposed(): void {
    if (this._disposed) {
      throw new Error('EventBus has been disposed')
    }
  }
}
