export interface IDisposable {
  dispose: () => void
}

export class DisposableStore implements IDisposable {
  private readonly _disposables: Set<() => void> = new Set()
  private _disposed = false

  add(d: IDisposable | (() => void)) {
    d = typeof d === 'function' ? d : d.dispose

    if (this._disposed)
      return d()

    this._disposables.add(d)
  }

  dispose() {
    if (this._disposed)
      return
    this._disposed = true
    this._disposables.forEach(d => d())
    this._disposables.clear()
  }
}
