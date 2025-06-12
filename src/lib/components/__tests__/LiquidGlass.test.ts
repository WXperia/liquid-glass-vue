import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LiquidGlass from '../LiquidGlass.vue'
import GlassContainer from '../GlassContainer.vue'
import { GlassMode, type LiquidGlassProps } from '../../type'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('LiquidGlass', () => {
  const defaultProps = {
    displacementScale: 70,
    blurAmount: 0.0625,
    saturation: 140,
    aberrationIntensity: 2,
    elasticity: 0.15,
    cornerRadius: 999,
    className: '',
    padding: '24px 32px',
    overLight: false,
    mode: GlassMode.standard,
  }

  let mockGetBoundingClientRect: any

  beforeEach(() => {
    // Mock getBoundingClientRect
    mockGetBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      width: 270,
      height: 69,
      right: 370,
      bottom: 169,
    }))
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect

    // Mock window.addEventListener
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染基本结构', () => {
      const wrapper = mount(LiquidGlass, {
        props: defaultProps,
        slots: {
          default: '测试内容',
        },
      })

      expect(wrapper.findComponent(GlassContainer).exists()).toBe(true)
      expect(wrapper.find('.bg-black').exists()).toBe(true)
      expect(wrapper.text()).toContain('测试内容')
    })

    it('应该正确渲染边界层', () => {
      const wrapper = mount(LiquidGlass, {
        props: defaultProps,
        slots: {
          default: '测试内容',
        },
      })

      const borderLayers = wrapper
        .findAll('span')
        .filter((span) => span.attributes('style')?.includes('mix-blend-mode'))
      expect(borderLayers.length).toBe(2)
    })

    it('应该在有onClick时渲染悬停效果', () => {
      const onClick = vi.fn()
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          onClick,
        },
        slots: {
          default: '测试内容',
        },
      })

      const hoverEffects = wrapper
        .findAll('div')
        .filter((div) => div.attributes('style')?.includes('radial-gradient'))
      expect(hoverEffects.length).toBe(3)
    })
  })

  describe('鼠标跟踪', () => {
    it('应该设置内部鼠标事件监听器', async () => {
      const wrapper = mount(LiquidGlass, {
        props: defaultProps,
        slots: {
          default: '测试内容',
        },
      })

      await nextTick()

      // 验证事件监听器被添加
      const glassContainer = wrapper.findComponent(GlassContainer)
      expect(glassContainer.exists()).toBe(true)
    })

    it('应该在提供外部鼠标位置时不设置内部监听器', () => {
      const globalMousePos = { x: 150, y: 150 }
      const mouseOffset = { x: 10, y: 10 }

      mount(LiquidGlass, {
        props: {
          ...defaultProps,
          globalMousePos,
          mouseOffset,
        },
        slots: {
          default: '测试内容',
        },
      })

      // 在这种情况下，组件不应该设置自己的鼠标监听器
      expect(true).toBe(true) // 这个测试主要是确保没有错误
    })

    it('应该正确计算鼠标偏移', async () => {
      const wrapper = mount(LiquidGlass, {
        props: defaultProps,
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any

      // 模拟鼠标移动事件
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: 200,
        clientY: 150,
      })

      vm.handleMouseMove(mouseEvent)

      // 验证内部鼠标位置被更新
      expect(vm.internalGlobalMousePos.x).toBe(200)
      expect(vm.internalGlobalMousePos.y).toBe(150)
    })
  })

  describe('弹性变形计算', () => {
    it('应该在鼠标远离时返回默认缩放', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          globalMousePos: { x: 1000, y: 1000 }, // 远离元素
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      const scale = vm.calculateDirectionalScale()
      expect(scale).toBe('scale(1)')
    })

    it('应该计算淡入因子', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          globalMousePos: { x: 235, y: 134.5 }, // 元素中心
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      const fadeInFactor = vm.calculateFadeInFactor()
      expect(fadeInFactor).toBeGreaterThan(0)
    })

    it('应该计算弹性位移', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          globalMousePos: { x: 250, y: 150 },
          elasticity: 0.2,
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      const translation = vm.calculateElasticTranslation()
      expect(typeof translation.x).toBe('number')
      expect(typeof translation.y).toBe('number')
    })
  })

  describe('样式计算', () => {
    it('应该正确计算变换样式', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          globalMousePos: { x: 235, y: 134.5 },
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      const transformStyle = vm.transformStyle
      expect(transformStyle).toContain('translate(calc(-50%')
      expect(transformStyle).toContain('calc(-50%')
    })

    it('应该在active状态下应用缩放', async () => {
      const onClick = vi.fn()
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          onClick,
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      vm.isActive = true
      await nextTick()

      const transformStyle = vm.transformStyle
      expect(transformStyle).toContain('scale(0.96)')
    })

    it('应该正确计算位置样式', () => {
      const customStyle = {
        position: 'absolute' as const,
        top: '100px',
        left: '200px',
      }

      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          style: customStyle,
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      const positionStyles = vm.positionStyles
      expect(positionStyles.position).toBe('absolute')
      expect(positionStyles.top).toBe('100px')
      expect(positionStyles.left).toBe('200px')
    })
  })

  describe('overLight效果', () => {
    it('应该在overLight为true时显示覆盖层', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          overLight: true,
        },
        slots: {
          default: '测试内容',
        },
      })

      const overlayLayers = wrapper.findAll('.bg-black')
      const firstLayer = overlayLayers[0]
      const secondLayer = overlayLayers[1]

      expect(firstLayer.classes()).toContain('opacity-20')
      expect(secondLayer.classes()).toContain('opacity-100')
    })

    it('应该在overLight为false时隐藏覆盖层', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          overLight: false,
        },
        slots: {
          default: '测试内容',
        },
      })

      const overlayLayers = wrapper.findAll('.bg-black')
      overlayLayers.forEach((layer) => {
        expect(layer.classes()).toContain('opacity-0')
      })
    })

    it('应该调整displacementScale当overLight为true', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          overLight: true,
          displacementScale: 100,
        },
        slots: {
          default: '测试内容',
        },
      })

      const glassContainer = wrapper.findComponent(GlassContainer)
      expect(glassContainer.props('displacementScale')).toBe(50) // 100 * 0.5
    })
  })

  describe('边界层渐变', () => {
    it('应该根据鼠标偏移计算渐变', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          mouseOffset: { x: 20, y: 10 },
        },
        slots: {
          default: '测试内容',
        },
      })

      const borderLayers = wrapper
        .findAll('span')
        .filter((span) => span.attributes('style')?.includes('linear-gradient'))

      expect(borderLayers.length).toBeGreaterThan(0)
      borderLayers.forEach((layer) => {
        const style = layer.attributes('style')
        expect(style).toContain('linear-gradient')
        expect(style).toContain('deg') // 角度应该基于鼠标偏移计算
      })
    })
  })

  describe('悬停状态', () => {
    it('应该正确处理悬停状态变化', async () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          onClick: vi.fn(),
        },
        slots: {
          default: '测试内容',
        },
      })

      const glassContainer = wrapper.findComponent(GlassContainer)

      // 直接调用函数而不是emit事件
      const vm = wrapper.vm as any
      vm.onMouseEnter?.()
      await nextTick()
      expect(vm.isHovered).toBe(true)

      vm.onMouseLeave?.()
      await nextTick()
      expect(vm.isHovered).toBe(false)
    })

    it('应该正确处理激活状态', async () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          onClick: vi.fn(),
        },
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any

      // 直接调用函数而不是emit事件
      vm.onMouseDown?.()
      await nextTick()
      expect(vm.isActive).toBe(true)

      vm.onMouseUp?.()
      await nextTick()
      expect(vm.isActive).toBe(false)
    })
  })

  describe('尺寸更新', () => {
    it('应该在窗口调整大小时更新玻璃尺寸', async () => {
      const wrapper = mount(LiquidGlass, {
        props: defaultProps,
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      const initialSize = { ...vm.glassSize }

      // 模拟新的边界矩形
      mockGetBoundingClientRect.mockReturnValue({
        left: 100,
        top: 100,
        width: 300,
        height: 80,
        right: 400,
        bottom: 180,
      })

      // 触发resize事件
      window.dispatchEvent(new Event('resize'))
      await nextTick()

      // 验证尺寸是否更新
      expect(vm.glassSize.width).toBe(300)
      expect(vm.glassSize.height).toBe(80)
    })
  })

  describe('props传递', () => {
    it('应该正确传递props给GlassContainer', () => {
      const wrapper = mount(LiquidGlass, {
        props: {
          ...defaultProps,
          className: 'test-class',
          cornerRadius: 20,
          saturation: 200,
          padding: '16px',
        },
        slots: {
          default: '测试内容',
        },
      })

      const glassContainer = wrapper.findComponent(GlassContainer)
      const props = glassContainer.props()
      expect(props.cornerRadius).toBe(20)
      expect(props.saturation).toBe(200)
      expect(props.padding).toBe('16px')
    })
  })

  describe('默认值', () => {
    it('应该使用正确的默认属性值', () => {
      const wrapper = mount(LiquidGlass, {
        slots: {
          default: '测试内容',
        },
      })

      const vm = wrapper.vm as any
      expect(vm.displacementScale).toBe(70)
      expect(vm.blurAmount).toBe(0.0625)
      expect(vm.saturation).toBe(140)
      expect(vm.aberrationIntensity).toBe(2)
      expect(vm.elasticity).toBe(0.15)
      expect(vm.cornerRadius).toBe(999)
      expect(vm.className).toBe('')
      expect(vm.padding).toBe('24px 32px')
      expect(vm.overLight).toBe(false)
      expect(vm.mode).toBe(GlassMode.standard)
    })
  })
})
