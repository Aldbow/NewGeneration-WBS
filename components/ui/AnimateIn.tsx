'use client'

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react'

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

const INITIAL: Record<AnimationType, CSSProperties> = {
  slideUp:    { opacity: 0, transform: 'translateY(48px)' },
  slideDown:  { opacity: 0, transform: 'translateY(-40px)' },
  slideLeft:  { opacity: 0, transform: 'translateX(-56px)' },
  slideRight: { opacity: 0, transform: 'translateX(56px)' },
  fadeIn:     { opacity: 0 },
  scaleUp:    { opacity: 0, transform: 'scale(0.85)' },
  flipUp:     { opacity: 0, transform: 'perspective(600px) rotateX(20deg) translateY(32px)' },
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const initialStyle = INITIAL[animation]
  
  const currentStyle: CSSProperties = {
    ...style,
    ...(isVisible ? { opacity: 1, transform: 'none' } : initialStyle),
    transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`
  }

  return (
    <div ref={ref} className={className} style={currentStyle}>
      {children}
    </div>
  )
}
