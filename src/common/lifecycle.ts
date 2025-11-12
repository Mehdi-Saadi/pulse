/**
 * An object that performs a cleanup operation when `.dispose()` is called.
 *
 * Some examples of how disposables are used:
 *
 * - An event listener that removes itself when `.dispose()` is called.
 * - A resource such as a file system watcher that cleans up the resource when `.dispose()` is called.
 * - The return value from registering a provider. When `.dispose()` is called, the provider is unregistered.
 */
export interface IDisposable {
  dispose: () => void
}

/**
 * Check if `thing` is {@link IDisposable disposable}.
 */
export function isDisposable<E>(thing: E): thing is E & IDisposable {
  return typeof thing === 'object' && thing !== null && typeof (<IDisposable><any>thing).dispose === 'function' && (<IDisposable><any>thing).dispose.length === 0
}

class FunctionDisposable implements IDisposable {
  private _isDisposed = false

  constructor(
    private readonly _fn: () => void,
  ) { }

  dispose(): void {
    if (this._isDisposed) {
      console.warn('Trying to dispose a disposed disposable. This is probably a bug.')
      return
    }
    if (!this._fn) {
      throw new Error(`Unbound disposable context: Need to use an arrow function to preserve the value of this`)
    }
    this._fn()
    this._isDisposed = true
  }
}

/**
 * Turn a function that implements dispose into an {@link IDisposable}.
 *
 * @param fn Clean up function, guaranteed to be called only **once**.
 */
export function toDisposable(fn: () => void): IDisposable {
  return new FunctionDisposable(fn)
}

export class DisposableStore implements IDisposable {
  private readonly _disposables = new Set<IDisposable>()
  private _disposed = false

  add<T extends IDisposable>(d: T): T {
    if ((d as unknown as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }

    if (this._disposed) {
      console.warn('Trying to add a disposable to a disposed store. This is probably a bug.')
      d.dispose()
    }
    else {
      this._disposables.add(d)
    }

    return d
  }

  dispose(): void {
    if (this._disposed) {
      console.warn('Trying to dispose a disposed store. This is probably a bug.')
      return
    }

    this._disposables.forEach(d => d.dispose())
    this._disposables.clear()
    this._disposed = true
  }
}

/**
 * Abstract base class for a {@link IDisposable disposable} object.
 *
 * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
 */
export abstract class Disposable implements IDisposable {
  protected readonly _store = new DisposableStore()

  dispose(): void {
    this._store.dispose()
  }

  /**
   * Adds `o` to the collection of disposables managed by this object.
   */
  protected _register<T extends IDisposable>(o: T): T {
    if ((o as unknown as Disposable) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }
    return this._store.add(o)
  }
}
