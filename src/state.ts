import type { IDisposable } from './disposable'

type UnlistenFn = () => void

export class EventBus<Events extends Record<string, any[]>> implements IDisposable {
  private _events = new Map<keyof Events, Set<(...args: any[]) => void>>()

  on<E extends keyof Events>(event: E, listener: (...args: Events[E]) => void): IDisposable {
    let listeners = this._events.get(event)

    if (!listeners) {
      listeners = new Set()
      this._events.set(event, listeners)
    }

    listeners.add(listener)

    return { dispose: () => listeners.delete(listener) }
  }

  once<E extends keyof Events>(event: E, listener: (...args: Events[E]) => void): IDisposable {
    const dispose = this.on(event, wrapper).dispose

    function wrapper(...args: Events[E]) {
      listener(...args)
      dispose()
    }

    return { dispose }
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

type StateListener<V> = (value: V) => void

// local state
export class State<V> {
  private _value: V
  private _listeners = new Set<StateListener<V>>()

  constructor(initialValue: V) {
    this._value = initialValue
  }

  getValue(): Readonly<V> {
    return this._value
  }

  setValue(newValue: V) {
    if (this._value === newValue)
      return
    this._value = newValue
    this._listeners.forEach(listener => listener(newValue))
  }

  listen(listener: StateListener<V>): UnlistenFn {
    this._listeners.add(listener)
    listener(this._value)
    return () => {
      this._listeners.delete(listener)
    }
  }
}
