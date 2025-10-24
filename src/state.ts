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
