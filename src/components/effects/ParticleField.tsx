import { useEffect, useRef } from "react"
import { useTheme } from "@mui/material/styles"

/**
 * Animated particle field background — floating dots with connecting lines.
 * Reads primary color and background from the current MUI theme.
 * Renders as a fixed canvas behind all content.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme()
  const primaryRef = useRef(theme.palette.primary.main)
  const bgRef = useRef(theme.palette.background.default)
  const isDarkRef = useRef(theme.palette.mode === "dark")

  // Keep colors in sync with theme changes
  useEffect(() => {
    primaryRef.current = theme.palette.primary.main
    bgRef.current = theme.palette.background.default
    isDarkRef.current = theme.palette.mode === "dark"
  }, [theme.palette.primary.main, theme.palette.background.default, theme.palette.mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    setSize()

    const hexToRgb = (hex: string) => {
      const h = hex.replace("#", "")
      return { r: parseInt(h.slice(0, 2), 16) || 0, g: parseInt(h.slice(2, 4), 16) || 0, b: parseInt(h.slice(4, 6), 16) || 0 }
    }

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
      })
    }

    let animId: number
    let paused = false

    const animate = () => {
      if (paused) { animId = requestAnimationFrame(animate); return }
      const c = hexToRgb(primaryRef.current)
      const bg = hexToRgb(bgRef.current)
      const dim = isDarkRef.current ? 1 : 0.35
      ctx.fillStyle = `rgba(${bg.r},${bg.g},${bg.b},0.12)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${0.5 * dim})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x, dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${0.15 * dim * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    // Pause when tab is hidden
    const onVisibility = () => { paused = document.hidden }
    document.addEventListener("visibilitychange", onVisibility)

    window.addEventListener("resize", setSize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", setSize); document.removeEventListener("visibilitychange", onVisibility) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}
