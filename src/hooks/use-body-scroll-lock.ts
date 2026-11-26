import { useLayoutEffect } from 'react'

let lockCount = 0
let savedScrollY = 0

function applyLock() {
  if (lockCount !== 1) return
  const pane = document.querySelector('.stocks-page-body')
  savedScrollY = pane instanceof HTMLElement ? pane.scrollTop : window.scrollY
  document.documentElement.classList.add('scroll-lock')
  document.body.classList.add('scroll-lock')
}

function releaseLock() {
  if (lockCount !== 0) return
  document.documentElement.classList.remove('scroll-lock')
  document.body.classList.remove('scroll-lock')
  const pane = document.querySelector('.stocks-page-body')
  if (pane instanceof HTMLElement) pane.scrollTop = savedScrollY
  else window.scrollTo(0, savedScrollY)
}

/** Prevent page / main shell scroll while a modal is open. Ref-counted for stacked modals. */
export function useBodyScrollLock(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return
    lockCount += 1
    applyLock()
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      releaseLock()
    }
  }, [locked])
}