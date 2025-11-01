export interface IDisposable {
  dispose: () => void
}

export class DisposableCollection implements IDisposable {
  private _disposables: (() => void)[] = []
  private _disposed = false

  add(d: IDisposable | (() => void)) {
    d = typeof d === 'function' ? d : d.dispose

    if (this._disposed)
      return d()

    this._disposables.push(d)
  }

  dispose() {
    if (this._disposed)
      return
    this._disposed = true
    this._disposables.forEach(d => d())
    this._disposables = []
  }
}
