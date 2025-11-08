type UnlistenFn = () => void
type StateListener<V> = (value: V) => void

// local state
export class State<V> {
  private _listeners = new Set<StateListener<V>>()

  constructor(
    private _value: V,
  ) { }

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
