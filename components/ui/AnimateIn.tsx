'use client'

import { useEffect, useRef, ReactNode, CSSProperties } from 'react'

export type AnimationType =
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'fadeIn'
  | 'scaleUp'
  | 'flipUp'

interface AnimateInProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  threshold?: number
  className?: string
  style?: CSSProperties
}

const INITIAL: Record<AnimationType, string> = {
  slideUp:    'opacity:0;transform:translateY(48px)',
  slideDown:  'opacity:0;transform:translateY(-40px)',
  slideLeft:  'opacity:0;transform:translateX(-56px)',
  slideRight: 'opacity:0;transform:translateX(56px)',
  fadeIn:     'opacity:0',
  scaleUp:    'opacity:0;transform:scale(0.85)',
  flipUp:     'opacity:0;transform:perspective(600px) rotateX(20deg) translateY(32px)',
}

export default function AnimateIn({
  children,
  animation = 'slideUp',
  delay = 0,
  duration = 600,
  threshold = 0.12,
  className = '',
  style = {},
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Parse and apply initial CSS
    const initial = INITIAL[animation]
    initial.split(';').forEach((rule) => {
      const colonIdx = rule.indexOf(':')
      if (colonIdx === -1) return
      const prop = rule.slice(0, colonIdx).trim()
      const val = rule.slice(colonIdx + 1).trim()
      if (prop && val) el.style.setProperty(prop, val)
    })
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'none'
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    const timer = setTimeout(() => observer.observe(el), 50)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [animation, delay, duration, threshold])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
