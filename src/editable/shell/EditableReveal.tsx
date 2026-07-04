'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type EditableRevealProps = {
  children: ReactNode
  /** Stagger index — later items reveal with a longer delay. */
  index?: number
  /** Per-item delay in ms. Ignored if `delayMs` is passed. */
  step?: number
  /** Direct delay override in ms. */
  delayMs?: number
  /** Tag to render as. Defaults to div. */
  as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'footer' | 'aside' | 'span'
  className?: string
  style?: CSSProperties
}

/*
  IntersectionObserver-driven fade+slide-up.

  - The `.editable-reveal` hidden state is only applied AFTER mount, so JS-off
    visitors and the initial SSR paint show content immediately (no FOUC, no
    blank sections for crawlers).
  - Once visible, the observer disconnects to avoid re-triggering.
  - Per-item transitionDelay via inline style makes staggering trivial.
  - `prefers-reduced-motion` handled entirely in CSS.
*/
export function EditableReveal({
  children,
  index = 0,
  step = 70,
  delayMs,
  as: Tag = 'div',
  className,
  style,
}: EditableRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const delay = typeof delayMs === 'number' ? delayMs : Math.max(0, index) * step
  const classes = ['editable-reveal']
  if (visible) classes.push('is-visible')
  if (className) classes.push(className)

  const inlineStyle: CSSProperties = { ...(style || {}), transitionDelay: `${delay}ms` }

  const finalClass = mounted ? classes.join(' ') : className || undefined

  return (
    <Tag ref={ref as never} className={finalClass} style={inlineStyle}>
      {children}
    </Tag>
  )
}

export default EditableReveal
