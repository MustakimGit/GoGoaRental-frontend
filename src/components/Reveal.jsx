import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Fades and slides its children in the first time they scroll into view. `delay` is in ms, for staggering siblings. */
export default function Reveal({ as: Tag = 'div', delay = 0, className, style, children, ...props }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref} data-shown={shown} className={cn('reveal', className)} style={{ ...style, transitionDelay: `${delay}ms` }} {...props}>
      {children}
    </Tag>
  )
}
