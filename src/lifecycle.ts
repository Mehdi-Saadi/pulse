export interface IDisposable {
  dispose: () => void
}

export class DisposableStore implements IDisposable {
  private readonly _disposables: Set<() => void> = new Set()
  private _disposed = false

  add(d: IDisposable | (() => void)) {
    d = typeof d === 'function' ? d : d.dispose

    if (this._disposed) {
      console.warn('Trying to add a disposable to a disposed store. This is probably a bug.')
      return d()
    }

    this._disposables.add(d)
  }

  dispose() {
    if (this._disposed) {
      console.warn('Trying to dispose a disposed store. This is probably a bug.')
      return
    }

    this._disposables.forEach(d => d())
    this._disposables.clear()
    this._disposed = true
  }
}
