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
