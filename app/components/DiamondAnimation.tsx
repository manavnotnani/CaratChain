"use client"

import { useEffect, useRef } from "react"

export default function DiamondAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const drawDiamond = (x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      ctx.moveTo(0, -size / 2)
      ctx.lineTo(size / 2, 0)
      ctx.lineTo(0, size / 2)
      ctx.lineTo(-size / 2, 0)
      ctx.closePath()
      ctx.fillStyle = "rgba(59, 130, 246, 0.6)"
      ctx.fill()
      ctx.strokeStyle = "rgb(37, 99, 235)"
      ctx.stroke()
      ctx.restore()
    }

    const diamonds: { x: number; y: number; size: number; rotation: number; speed: number }[] = []

    for (let i = 0; i < 20; i++) {
      diamonds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      diamonds.forEach((diamond) => {
        diamond.rotation += diamond.speed
        drawDiamond(diamond.x, diamond.y, diamond.size, diamond.rotation)
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} width={500} height={500} className="w-full max-w-lg" />
}

