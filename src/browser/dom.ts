import type { IDisposable } from '../common/lifecycle'

class DomListener implements IDisposable {
  constructor(
    private _node: EventTarget,
    private readonly _type: string,
    private _handler: (e: any) => void,
    private readonly _options: boolean | AddEventListenerOptions = false,
  ) {
    this._node.addEventListener(this._type, this._handler, this._options)
  }

  dispose(): void {
    if (!this._handler) {
      // Already disposed
      return
    }

    this._node.removeEventListener(this._type, this._handler, this._options)

    // Prevent leakers from holding on to the dom or handler func
    this._node = null!
    this._handler = null!
  }
}

export function addDisposableListener<K extends keyof GlobalEventHandlersEventMap>(node: EventTarget, type: K, handler: (event: GlobalEventHandlersEventMap[K]) => void, useCapture?: boolean): IDisposable
export function addDisposableListener(node: EventTarget, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable
export function addDisposableListener(node: EventTarget, type: string, handler: (event: any) => void, options: AddEventListenerOptions): IDisposable
export function addDisposableListener(node: EventTarget, type: string, handler: (event: any) => void, useCaptureOrOptions?: boolean | AddEventListenerOptions): IDisposable {
  return new DomListener(node, type, handler, useCaptureOrOptions)
}
