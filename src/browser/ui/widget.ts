import { Disposable } from '../../common/lifecycle'
import * as dom from '../dom'

export abstract class Widget extends Disposable {
  protected onclick(domNode: HTMLElement, listener: (e: MouseEvent) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.CLICK, listener))
  }

  protected onmousedown(domNode: HTMLElement, listener: (e: MouseEvent) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_DOWN, listener))
  }

  protected onmouseover(domNode: HTMLElement, listener: (e: MouseEvent) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_OVER, listener))
  }

  protected onmouseleave(domNode: HTMLElement, listener: (e: MouseEvent) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_LEAVE, listener))
  }

  protected onkeydown(domNode: HTMLElement, listener: (e: KeyboardEvent) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, listener))
  }

  protected onkeyup(domNode: HTMLElement, listener: (e: KeyboardEvent) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.KEY_UP, listener))
  }

  protected oninput(domNode: HTMLElement, listener: (e: Event) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.INPUT, listener))
  }

  protected onblur(domNode: HTMLElement, listener: (e: Event) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.BLUR, listener))
  }

  protected onfocus(domNode: HTMLElement, listener: (e: Event) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.FOCUS, listener))
  }

  protected onchange(domNode: HTMLElement, listener: (e: Event) => void): void {
    this._register(dom.addDisposableListener(domNode, dom.EventType.CHANGE, listener))
  }
}
