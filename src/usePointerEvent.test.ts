import { describe, it, expect } from 'vitest'
import type { MouseEvent, TouchEvent, MainThread } from '@lynx-js/types'
import usePointerEvent from './usePointerEvent'

function mockMouseEvent(button: number, buttons: number): MouseEvent {
  return {
    x: 10,
    y: 20,
    pageX: 110,
    pageY: 120,
    clientX: 210,
    clientY: 220,
    button,
    buttons,
  } as MouseEvent
}

function mockTouchEvent(detailX: number, detailY: number, touches: Array<{ identifier: number, x: number, y: number, pageX: number, pageY: number, clientX: number, clientY: number }>, changedTouches?: Array<{ identifier: number, x: number, y: number, pageX: number, pageY: number, clientX: number, clientY: number }>): TouchEvent {
  return {
    detail: { x: detailX, y: detailY },
    touches,
    changedTouches,
  } as unknown as TouchEvent
}

function mockMTMouseEvent(button: number, buttons: number): MainThread.MouseEvent {
  return {
    x: 5,
    y: 6,
    pageX: 105,
    pageY: 106,
    clientX: 205,
    clientY: 206,
    button,
    buttons,
    target: {} as MainThread.Element,
    currentTarget: {} as MainThread.Element,
  } as MainThread.MouseEvent
}

function mockMTTouchEvent(detailX: number, detailY: number, touches: Array<{ identifier: number, x: number, y: number, pageX: number, pageY: number, clientX: number, clientY: number }>, changedTouches?: Array<{ identifier: number, x: number, y: number, pageX: number, pageY: number, clientX: number, clientY: number }>): MainThread.TouchEvent {
  return {
    detail: { x: detailX, y: detailY },
    touches,
    changedTouches,
    target: {} as MainThread.Element,
    currentTarget: {} as MainThread.Element,
  } as unknown as MainThread.TouchEvent
}

describe('usePointerEvent mouse normalization', () => {
  it('maps button to web indices and passes buttons mask', () => {
    let received: any = null
    const handlers = usePointerEvent({ onPointerDown: (e) => { received = e } })
    expect(handlers.handleMouseDown).toBeTypeOf('function')
    expect(handlers.handleTouchStart).toBeTypeOf('function')
    const ev = mockMouseEvent(1, 3)
    handlers.handleMouseDown!(ev)
    expect(received.pointerType).toBe('mouse')
    expect(received.button).toBe(0)
    expect(received.buttons).toBe(3)
    expect(received.x).toBe(10)
    expect(received.clientX).toBe(210)
  })
})

describe('usePointerEvent touch normalization', () => {
  it('uses detail x/y and touch coordinates with pointerId and isPrimary', () => {
    let received: any = null
    const handlers = usePointerEvent({ onPointerDown: (e) => { received = e } })
    const te = mockTouchEvent(
      50,
      60,
      [{ identifier: 1, x: 51, y: 61, pageX: 151, pageY: 161, clientX: 251, clientY: 261 }],
    )
    handlers.handleTouchStart!(te)
    expect(received.pointerType).toBe('touch')
    expect(received.x).toBe(50)
    expect(received.y).toBe(60)
    expect(received.pointerId).toBe(1)
    expect(received.isPrimary).toBe(true)
    expect(received.pageX).toBe(151)
    expect(received.clientY).toBe(261)
  })

  // touchstart is normalized using the first touch as primary; changedTouches
  // are not used to select pointerId on start in this normalization.
})

describe('usePointerEvent MT handlers', () => {
  it('returns MT handler keys when MT callbacks provided', () => {
    let received: any = null
    const handlers = usePointerEvent({ onPointerDownMT: (e) => { received = e } })
    expect(handlers.handleMouseDownMT).toBeTruthy()
    expect(handlers.handleTouchStartMT).toBeTruthy()
    expect(handlers.handleMouseDown).toBeUndefined()
  })

  it('exposes MT touch handler keys for MT callbacks', () => {
    const handlers = usePointerEvent({ onPointerDownMT: () => {} })
    expect(handlers.handleTouchStartMT).toBeTruthy()
    expect(handlers.handleMouseDownMT).toBeTruthy()
  })
})
