// Adapted from https://github.com/shuding/liquid-glass

export interface Vec2 {
  x: number
  y: number
}

export interface ShaderOptions {
  width: number
  height: number
  effect: FragmentShaderType
  mousePosition?: Vec2
  time?: number
}

export type FragmentShaderType = keyof typeof fragmentShaders

export const fragmentShaders = {
  liquidGlass: 'liquidGlass',
  liquidGlass2: 'liquidGlass2',
  flowingLiquid: 'flowingLiquid',
  transparentIce: 'transparentIce',
  unevenGlass: 'unevenGlass',
  mosaicGlass: 'mosaicGlass',
} as const

export class ShaderDisplacementGenerator {
  private worker: Worker
  private startTime = Date.now()

  constructor(private options: ShaderOptions) {
    this.worker = new Worker(new URL('./workers/shader-worker.ts', import.meta.url), {
      type: 'module',
    })
  }

  updateShader(mousePosition?: Vec2): Promise<string> {
    const currentTime = (Date.now() - this.startTime) / 1000 // Time in seconds

    return new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        const { imageData } = e.data
        const canvas = document.createElement('canvas')
        canvas.width = this.options.width
        canvas.height = this.options.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.putImageData(imageData, 0, 0)
          resolve(canvas.toDataURL())
        }
      }

      this.worker.postMessage({
        width: this.options.width,
        height: this.options.height,
        effect: this.options.effect,
        mousePosition,
        time: currentTime,
      })
    })
  }

  destroy(): void {
    this.worker.terminate()
  }

  getCurrentTime(): number {
    return (Date.now() - this.startTime) / 1000
  }
}

