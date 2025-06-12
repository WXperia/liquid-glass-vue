// Adapted from https://github.com/shuding/liquid-glass

export interface Vec2 {
  x: number
  y: number
}

export interface ShaderOptions {
  width: number
  height: number
  fragment: (uv: Vec2, mouse?: Vec2, time?: number) => Vec2
  mousePosition?: Vec2
  time?: number
}

function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y)
}

function roundedRectSDF(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): number {
  const qx = Math.abs(x) - width + radius
  const qy = Math.abs(y) - height + radius
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius
}

function texture(x: number, y: number): Vec2 {
  return { x, y }
}

// Enhanced noise functions for more realistic effects
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return (n - Math.floor(n)) * 2 - 1
}

function fbm(x: number, y: number, octaves: number = 4): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency)
    amplitude *= 0.5
    frequency *= 2
  }

  return value
}

function refract(incident: Vec2, normal: Vec2, eta: number): Vec2 {
  const dot = incident.x * normal.x + incident.y * normal.y
  const k = 1 - eta * eta * (1 - dot * dot)

  if (k < 0) {
    // Total internal reflection
    return {
      x: incident.x - 2 * dot * normal.x,
      y: incident.y - 2 * dot * normal.y,
    }
  }

  const factor = eta * dot + Math.sqrt(k)
  return {
    x: eta * incident.x - factor * normal.x,
    y: eta * incident.y - factor * normal.y,
  }
}

// Shader fragment functions for different effects
export const fragmentShaders = {
  liquidGlass: (uv: Vec2): Vec2 => {
    const ix = uv.x - 0.5
    const iy = uv.y - 0.5
    const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6)
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15)
    const scaled = smoothStep(0, 1, displacement)
    return texture(ix * scaled + 0.5, iy * scaled + 0.5)
  },
  flowingLiquid: (uv: Vec2): Vec2 => {
    const ix = uv.x - 0.5
    const iy = uv.y - 0.5
    const distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 1)
    const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15)
    const scaled = smoothStep(0, 1, displacement)
    return texture(ix * scaled + 0.5, iy * scaled + 0.5)
  },
  transparentIce: (uv: Vec2): Vec2 => {
    const ix = uv.x - 0.5
    const iy = uv.y - 0.5

    // Create crystalline structure with multi-octave noise
    const crystalNoise = fbm(uv.x * 8, uv.y * 8, 3) * 0.05
    const fineDetail = noise(uv.x * 20, uv.y * 20) * 0.02

    // Ice-like distortion with less smoothing for sharper edges
    const distanceToEdge = roundedRectSDF(ix, iy, 0.35, 0.25, 0.3)
    const iceMask = smoothStep(0.5, -0.2, distanceToEdge)

    // Add internal cracks and imperfections
    const crackPattern = Math.sin(uv.x * 15 + crystalNoise * 10) * Math.cos(uv.y * 12) * 0.03

    // Combine effects with ice-like refraction
    const distortionX = ix + (crystalNoise + fineDetail + crackPattern) * iceMask
    const distortionY = iy + (crystalNoise * 0.8 + fineDetail) * iceMask

    // Add slight edge brightening effect typical of ice
    const edgeEffect = smoothStep(0, 0.1, distanceToEdge) * 0.1

    return texture(distortionX * (1 - edgeEffect) + 0.5, distortionY * (1 - edgeEffect) + 0.5)
  },
  unevenGlass: (uv: Vec2): Vec2 => {
    const ix = uv.x - 0.5
    const iy = uv.y - 0.5

    // Create smooth but uneven surface using low-frequency noise
    const surfaceWarp = fbm(uv.x * 3, uv.y * 3, 2) * 0.08
    const surfaceDetail = noise(uv.x * 6 + surfaceWarp, uv.y * 6) * 0.04

    // Glass boundary with organic variations
    const warpedX = ix + surfaceWarp * 0.3
    const warpedY = iy + surfaceWarp * 0.3
    const distanceToEdge = roundedRectSDF(warpedX, warpedY, 0.32, 0.22, 0.4)

    // Smooth glass-like transition
    const glassMask = smoothStep(0.6, -0.1, distanceToEdge)

    // Add subtle ripples across the surface
    const ripples = Math.sin(uv.x * 8 + surfaceWarp * 5) * Math.sin(uv.y * 8) * 0.02

    // Calculate final distortion
    const distortionStrength = glassMask * (1 + surfaceDetail * 0.5)
    const finalX = ix + (surfaceWarp + ripples) * distortionStrength
    const finalY = iy + (surfaceWarp * 0.9 + surfaceDetail + ripples * 0.7) * distortionStrength

    return texture(finalX + 0.5, finalY + 0.5)
  },
  mosaicGlass: (uv: Vec2): Vec2 => {
    const ix = uv.x - 0.5
    const iy = uv.y - 0.5

    // Create regular mosaic tile pattern
    const tileSize = 0.05 // Smaller tiles for more mosaic effect
    const tileX = Math.floor(uv.x / tileSize)
    const tileY = Math.floor(uv.y / tileSize)

    // Generate pseudo-random properties for each tile
    const tileSeed = Math.sin(tileX * 12.9898 + tileY * 78.233) * 43758.5453
    const tileRandom = tileSeed - Math.floor(tileSeed)

    // Each tile has its own refraction direction
    const tileAngle = tileRandom * Math.PI * 2
    const refractionX = Math.cos(tileAngle) * 0.03
    const refractionY = Math.sin(tileAngle) * 0.03

    // Glass boundary
    const distanceToEdge = roundedRectSDF(ix, iy, 0.35, 0.25, 0.05)
    const glassMask = smoothStep(0.4, -0.1, distanceToEdge)

    // Create tile boundaries (grout lines)
    const localX = (uv.x % tileSize) / tileSize
    const localY = (uv.y % tileSize) / tileSize
    const groutThickness = 0.1
    const isGroutLine =
      localX < groutThickness ||
      localX > 1 - groutThickness ||
      localY < groutThickness ||
      localY > 1 - groutThickness

    // Tile surface variation
    const surfaceNoise = noise(tileX * 3.7, tileY * 3.7) * 0.02
    const tileVariation = (tileRandom - 0.5) * 0.04

    // Apply different distortion based on whether we're on grout or tile
    let finalDistortionX, finalDistortionY

    if (isGroutLine) {
      // Grout areas have minimal distortion
      finalDistortionX = surfaceNoise * 0.2
      finalDistortionY = surfaceNoise * 0.2
    } else {
      // Each tile has its own refraction direction
      const tileDistortion = 1 + tileVariation
      finalDistortionX = (refractionX + surfaceNoise) * tileDistortion
      finalDistortionY = (refractionY + surfaceNoise) * tileDistortion
    }

    // Apply glass mask and calculate final coordinates
    const maskedDistortionX = finalDistortionX * glassMask
    const maskedDistortionY = finalDistortionY * glassMask

    return texture(ix + maskedDistortionX + 0.5, iy + maskedDistortionY + 0.5)
  },
}

export type FragmentShaderType = keyof typeof fragmentShaders

export class ShaderDisplacementGenerator {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private canvasDPI = 1
  private startTime = Date.now()

  constructor(private options: ShaderOptions) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = options.width * this.canvasDPI
    this.canvas.height = options.height * this.canvasDPI
    this.canvas.style.display = 'none'

    const context = this.canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context')
    }
    this.context = context
  }

  updateShader(mousePosition?: Vec2): string {
    const w = this.options.width * this.canvasDPI
    const h = this.options.height * this.canvasDPI
    const currentTime = (Date.now() - this.startTime) / 1000 // Time in seconds

    let maxScale = 0
    const rawValues: number[] = []

    // Calculate displacement values
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const uv: Vec2 = { x: x / w, y: y / h }

        const pos = this.options.fragment(uv, mousePosition, currentTime)
        const dx = pos.x * w - x
        const dy = pos.y * h - y

        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
        rawValues.push(dx, dy)
      }
    }

    // Improved normalization to prevent artifacts while maintaining intensity
    if (maxScale > 0) {
      maxScale = Math.max(maxScale, 1) // Ensure minimum scale to prevent over-normalization
    } else {
      maxScale = 1
    }

    // Create ImageData and fill it
    const imageData = this.context.createImageData(w, h)
    const data = imageData.data

    // Convert to image data with smoother normalization
    let rawIndex = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = rawValues[rawIndex++]
        const dy = rawValues[rawIndex++]

        // Smooth the displacement values at edges to prevent hard transitions
        const edgeDistance = Math.min(x, y, w - x - 1, h - y - 1)
        const edgeFactor = Math.min(1, edgeDistance / 2) // Smooth within 2 pixels of edge

        const smoothedDx = dx * edgeFactor
        const smoothedDy = dy * edgeFactor

        const r = smoothedDx / maxScale + 0.5
        const g = smoothedDy / maxScale + 0.5

        const pixelIndex = (y * w + x) * 4
        data[pixelIndex] = Math.max(0, Math.min(255, r * 255)) // Red channel (X displacement)
        data[pixelIndex + 1] = Math.max(0, Math.min(255, g * 255)) // Green channel (Y displacement)
        data[pixelIndex + 2] = Math.max(0, Math.min(255, g * 255)) // Blue channel (Y displacement for SVG filter compatibility)
        data[pixelIndex + 3] = 255 // Alpha channel
      }
    }

    this.context.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL()
  }

  destroy(): void {
    this.canvas.remove()
  }

  getScale(): number {
    return this.canvasDPI
  }

  // Method to get current time for external use
  getCurrentTime(): number {
    return (Date.now() - this.startTime) / 1000
  }
}
