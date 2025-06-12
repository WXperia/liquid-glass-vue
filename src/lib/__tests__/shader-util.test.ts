import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fragmentShaders, ShaderDisplacementGenerator } from '../shader-util'
import type { Vec2, ShaderOptions, FragmentShaderType } from '../shader-util'

// Mock canvas and context
class MockCanvasRenderingContext2D {
  createImageData = vi.fn((width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4),
    width,
    height,
  }))
  putImageData = vi.fn()
}

class MockHTMLCanvasElement {
  width = 0
  height = 0
  style = { display: '' }

  getContext = vi.fn(() => new MockCanvasRenderingContext2D())
  toDataURL = vi.fn(() => 'data:image/png;base64,mock-base64-data')
  remove = vi.fn()
}

// Mock document.createElement
const originalCreateElement = global.document?.createElement
beforeEach(() => {
  global.document = {
    ...global.document,
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return new MockHTMLCanvasElement() as any
      }
      return originalCreateElement?.call(document, tagName)
    }),
  } as any
})

afterEach(() => {
  if (originalCreateElement) {
    global.document.createElement = originalCreateElement
  }
  vi.clearAllMocks()
})

// Global test options
const mockOptions: ShaderOptions = {
  width: 100,
  height: 100,
  fragment: fragmentShaders.liquidGlass,
}

describe('shader-util', () => {
  describe('Vec2 interface', () => {
    it('应该定义正确的Vec2类型', () => {
      const vec: Vec2 = { x: 1, y: 2 }
      expect(vec.x).toBe(1)
      expect(vec.y).toBe(2)
    })
  })

  describe('fragmentShaders', () => {
    describe('liquidGlass shader', () => {
      it('应该返回有效的UV坐标', () => {
        const uv: Vec2 = { x: 0.5, y: 0.5 }
        const result = fragmentShaders.liquidGlass(uv)

        expect(result).toHaveProperty('x')
        expect(result).toHaveProperty('y')
        expect(typeof result.x).toBe('number')
        expect(typeof result.y).toBe('number')
      })

      it('应该正确处理中心位置的UV坐标', () => {
        const centerUV: Vec2 = { x: 0.5, y: 0.5 }
        const result = fragmentShaders.liquidGlass(centerUV)

        // 中心位置应该返回接近原始坐标的值
        expect(result.x).toBeCloseTo(0.5, 1)
        expect(result.y).toBeCloseTo(0.5, 1)
      })

      it('应该正确处理边缘位置的UV坐标', () => {
        const edgeUV: Vec2 = { x: 0, y: 0 }
        const result = fragmentShaders.liquidGlass(edgeUV)

        expect(result.x).toBeGreaterThanOrEqual(0)
        expect(result.x).toBeLessThanOrEqual(1)
        expect(result.y).toBeGreaterThanOrEqual(0)
        expect(result.y).toBeLessThanOrEqual(1)
      })

      it('应该处理各种UV坐标输入', () => {
        const testCases: Vec2[] = [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 0.25, y: 0.75 },
          { x: 0.75, y: 0.25 },
        ]

        testCases.forEach((uv) => {
          const result = fragmentShaders.liquidGlass(uv)
          expect(result.x).toBeGreaterThanOrEqual(0)
          expect(result.x).toBeLessThanOrEqual(1)
          expect(result.y).toBeGreaterThanOrEqual(0)
          expect(result.y).toBeLessThanOrEqual(1)
        })
      })
    })
  })

  describe('ShaderDisplacementGenerator', () => {
    let generator: ShaderDisplacementGenerator

    beforeEach(() => {
      generator = new ShaderDisplacementGenerator(mockOptions)
    })

    afterEach(() => {
      generator.destroy()
    })

    describe('构造函数', () => {
      it('应该创建ShaderDisplacementGenerator实例', () => {
        expect(generator).toBeInstanceOf(ShaderDisplacementGenerator)
      })

      it('应该设置正确的canvas尺寸', () => {
        new ShaderDisplacementGenerator(mockOptions)
        // 验证createElement被调用
        expect(document.createElement).toHaveBeenCalledWith('canvas')
      })

      it('应该在无法获取2D context时抛出错误', () => {
        const mockElement = {
          width: 0,
          height: 0,
          style: { display: '' },
          getContext: vi.fn(() => null),
        }

        vi.mocked(document.createElement).mockReturnValue(mockElement as any)

        expect(() => {
          new ShaderDisplacementGenerator(mockOptions)
        }).toThrow('Could not get 2D context')
      })
    })

    describe('updateShader方法', () => {
      it('应该返回有效的data URL', () => {
        const result = generator.updateShader()
        expect(result).toBe('data:image/png;base64,mock-base64-data')
      })

      it('应该处理鼠标位置参数', () => {
        const mousePosition: Vec2 = { x: 0.5, y: 0.5 }
        const result = generator.updateShader(mousePosition)
        expect(result).toBe('data:image/png;base64,mock-base64-data')
      })

      it('应该调用createImageData和putImageData', () => {
        const mockContext = new MockCanvasRenderingContext2D()
        vi.mocked(document.createElement).mockReturnValue({
          width: 0,
          height: 0,
          style: { display: '' },
          getContext: vi.fn(() => mockContext),
          toDataURL: vi.fn(() => 'data:image/png;base64,test'),
          remove: vi.fn(),
        } as any)

        const testGenerator = new ShaderDisplacementGenerator(mockOptions)
        testGenerator.updateShader()

        expect(mockContext.createImageData).toHaveBeenCalledWith(100, 100)
        expect(mockContext.putImageData).toHaveBeenCalled()
      })
    })

    describe('getScale方法', () => {
      it('应该返回正确的DPI缩放', () => {
        const scale = generator.getScale()
        expect(scale).toBe(1)
      })
    })

    describe('destroy方法', () => {
      it('应该调用canvas的remove方法', () => {
        const mockCanvas = {
          width: 0,
          height: 0,
          style: { display: '' },
          getContext: vi.fn(() => new MockCanvasRenderingContext2D()),
          toDataURL: vi.fn(),
          remove: vi.fn(),
        }

        vi.mocked(document.createElement).mockReturnValue(mockCanvas as any)

        const testGenerator = new ShaderDisplacementGenerator(mockOptions)
        testGenerator.destroy()

        expect(mockCanvas.remove).toHaveBeenCalled()
      })
    })
  })

  describe('类型定义', () => {
    it('FragmentShaderType应该包含正确的键', () => {
      const validKey: FragmentShaderType = 'liquidGlass'
      expect(fragmentShaders[validKey]).toBeDefined()
    })

    it('ShaderOptions应该有正确的属性类型', () => {
      const options: ShaderOptions = {
        width: 200,
        height: 150,
        fragment: fragmentShaders.liquidGlass,
        mousePosition: { x: 0.5, y: 0.5 },
      }

      expect(typeof options.width).toBe('number')
      expect(typeof options.height).toBe('number')
      expect(typeof options.fragment).toBe('function')
      expect(options.mousePosition).toHaveProperty('x')
      expect(options.mousePosition).toHaveProperty('y')
    })
  })

  describe('边界情况', () => {
    it('应该处理零尺寸canvas', () => {
      const zeroOptions: ShaderOptions = {
        width: 0,
        height: 0,
        fragment: fragmentShaders.liquidGlass,
      }

      expect(() => {
        const zeroGenerator = new ShaderDisplacementGenerator(zeroOptions)
        zeroGenerator.updateShader()
        zeroGenerator.destroy()
      }).not.toThrow()
    })

    it('应该处理非常大的canvas尺寸', () => {
      const largeOptions: ShaderOptions = {
        width: 1000,
        height: 1000,
        fragment: fragmentShaders.liquidGlass,
      }

      expect(() => {
        const largeGenerator = new ShaderDisplacementGenerator(largeOptions)
        largeGenerator.destroy()
      }).not.toThrow()
    })

    it('应该处理极端的鼠标位置', () => {
      const extremeMousePositions = [
        { x: -1, y: -1 },
        { x: 2, y: 2 },
        { x: Number.MAX_VALUE, y: Number.MAX_VALUE },
        { x: Number.MIN_VALUE, y: Number.MIN_VALUE },
      ]

      extremeMousePositions.forEach((mousePos) => {
        expect(() => {
          const testGenerator = new ShaderDisplacementGenerator(mockOptions)
          testGenerator.updateShader(mousePos)
          testGenerator.destroy()
        }).not.toThrow()
      })
    })
  })
})
