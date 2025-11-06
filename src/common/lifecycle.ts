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

export class DisposableStore implements IDisposable {
  private readonly _disposables: Set<IDisposable> = new Set()
  private _disposed = false

  add<T extends IDisposable>(d: T): T {
    if ((d as unknown as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!')
    }

    if (this._disposed) {
      console.warn('Trying to add a disposable to a disposed store. This is probably a bug.')
      d.dispose()
      return d
    }

    this._disposables.add(d)

    return d
  }

  dispose() {
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

  dispose() {
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
