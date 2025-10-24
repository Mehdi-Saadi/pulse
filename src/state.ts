type UnlistenFn = () => void

type EventBusListenerPayload = Record<string, unknown>
type EventBusListener<P extends EventBusListenerPayload> = (payload?: P) => void

// global state
export class EventBus<E, P extends EventBusListenerPayload> {
  private _events = new Map<E, Set<EventBusListener<P>>>()

  on(event: E, fn: EventBusListener<P>): UnlistenFn {
    let listeners = this._events.get(event)

    if (!listeners) {
      listeners = new Set()
      this._events.set(event, listeners)
    }

    listeners.add(fn)

    return () => {
      listeners.delete(fn)
    }
  }

  emit(event: E, payload?: P) {
    const listeners = this._events.get(event)
    listeners?.forEach(listener => listener(payload))
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
