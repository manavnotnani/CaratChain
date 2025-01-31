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

      // Create gradient for diamond face
      const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)')
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.7)')

      // Draw main diamond shape
      ctx.beginPath()
      ctx.moveTo(0, -size/1.5) // Top point
      ctx.lineTo(size/2, 0)    // Right point
      ctx.lineTo(0, size/1.5)  // Bottom point
      ctx.lineTo(-size/2, 0)   // Left point
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw facets
      ctx.beginPath()
      ctx.moveTo(0, -size/1.5)
      ctx.lineTo(size/4, -size/4)
      ctx.lineTo(-size/4, -size/4)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.fill()

      // Bottom facet
      ctx.beginPath()
      ctx.moveTo(0, size/1.5)
      ctx.lineTo(size/4, size/4)
      ctx.lineTo(-size/4, size/4)
      ctx.closePath()
      ctx.fillStyle = 'rgba(67, 67, 255, 0.4)' // Made more purple
      ctx.fill()

      // Add shine effect
      ctx.beginPath()
      ctx.moveTo(-size/6, -size/6)
      ctx.lineTo(size/6, -size/6)
      ctx.lineTo(0, 0)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fill()

      // Outline
      ctx.strokeStyle = 'rgba(67, 67, 255, 0.8)' // Made more purple
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    }

    // Helper function to check if a position is too close to existing diamonds
    const isTooClose = (x: number, y: number, existingDiamonds: any[], minDistance: number) => {
      return existingDiamonds.some(diamond => {
        const dx = x - diamond.x
        const dy = y - diamond.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < minDistance
      })
    }

    const diamonds: {
      x: number
      y: number
      size: number
      rotation: number
      speed: number
      yOffset: number
      ySpeed: number
    }[] = []

    // Create diamonds with better spacing
    const minDistance = 100 // Minimum distance between diamonds
    const attempts = 50     // Maximum attempts to place each diamond
    const numDiamonds = 10  // Reduced number of diamonds

    for (let i = 0; i < numDiamonds; i++) {
      let placed = false
      let attempts_count = 0

      while (!placed && attempts_count < attempts) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        
        if (!isTooClose(x, y, diamonds, minDistance)) {
          diamonds.push({
            x,
            y,
            size: Math.random() * 50 + 20, // Increased size variation
            rotation: Math.random() * Math.PI * 2,
            speed: (Math.random() * 0.008 + 0.003) * (Math.random() < 0.5 ? 1 : -1),
            yOffset: 0,
            ySpeed: Math.random() * 0.3 + 0.1 // Slowed down floating effect
          })
          placed = true
        }
        attempts_count++
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      diamonds.forEach((diamond) => {
        // Update rotation
        diamond.rotation += diamond.speed

        // Add floating effect
        diamond.yOffset = Math.sin(Date.now() * 0.001 * diamond.ySpeed) * 15

        // Draw diamond with updated position
        drawDiamond(
          diamond.x,
          diamond.y + diamond.yOffset,
          diamond.size,
          diamond.rotation
        )
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={500} 
      className="w-full max-w-lg"
    />
  )
}