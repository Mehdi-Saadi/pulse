type Fn = () => void
type UnlistenFn = () => void

export class EventBus<T> {
  private _events = new Map<T, Set<Fn>>()

  on(event: T, fn: Fn): UnlistenFn {
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

  emit(event: T) {
    const listeners = this._events.get(event)
    listeners?.forEach(listener => listener())
  }
}
