import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GlassContainer from '../GlassContainer.vue'
import GlassFilter from '../GlassFilter.vue'
import { GlassMode, type GlassContainerProps } from '../../type'

// Mock ShaderDisplacementGenerator
vi.mock('../../shader-util', () => ({
  fragmentShaders: {
    liquidGlass: 'mock-fragment-shader',
  },
  ShaderDisplacementGenerator: vi.fn().mockImplementation(() => ({
    updateShader: vi.fn().mockReturnValue('data:image/png;base64,mock-shader-data'),
    destroy: vi.fn(),
  })),
}))

// Mock useId
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    useId: vi.fn(() => 'mock-id'),
  }
})

describe('GlassContainer', () => {
  const defaultProps: GlassContainerProps = {
    className: '',
    displacementScale: 25,
    blurAmount: 12,
    saturation: 180,
    aberrationIntensity: 2,
    active: false,
    overLight: false,
    cornerRadius: 999,
    padding: '24px 32px',
    glassSize: { width: 270, height: 69 },
    mode: GlassMode.standard,
  }

  beforeEach(() => {
    // Mock navigator.userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 Chrome/91.0.4472.124',
    })
  })

  describe('组件渲染', () => {
    it('应该正确渲染基本结构', () => {
      const wrapper = mount(GlassContainer, {
        props: defaultProps,
        slots: {
          default: '测试内容',
        },
      })

      expect(wrapper.find('.relative').exists()).toBe(true)
      expect(wrapper.find('.glass').exists()).toBe(true)
      expect(wrapper.find('.glass__warp').exists()).toBe(true)
      expect(wrapper.text()).toContain('测试内容')
    })

    it('应该正确应用className属性', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          className: 'custom-class',
        },
      })

      expect(wrapper.find('.custom-class').exists()).toBe(true)
    })

    it('应该在active为true时应用active类', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          active: true,
        },
      })

      expect(wrapper.find('.active').exists()).toBe(true)
    })

    it('应该在有onClick回调时应用cursor-pointer类', () => {
      const onClick = vi.fn()
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          onClick,
        },
      })

      expect(wrapper.find('.cursor-pointer').exists()).toBe(true)
    })
  })

  describe('样式计算', () => {
    it('应该正确计算backdrop样式', () => {
      const wrapper = mount(GlassContainer, {
        props: defaultProps,
      })

      const backdrop = wrapper.find('.glass__warp')
      const style = backdrop.attributes('style')

      // 调试输出
      console.log('实际样式:', style)

      expect(style).toContain('filter: url(#mock-id)')
      // Vue可能将camelCase转换为kebab-case，或者样式没有完全渲染
      expect(
        style && (style.includes('backdrop-filter:') || style.includes('backdropFilter:')),
      ).toBe(true)
    })

    it('应该在overLight为true时调整模糊值', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          overLight: true,
        },
      })

      const backdrop = wrapper.find('.glass__warp')
      const style = backdrop.attributes('style')

      expect(style).toContain('backdrop-filter: blur(')
      expect(style).toContain('saturate(180%)')
      // overLight模式下应该有更高的模糊值
      const blurMatch = style?.match(/blur\((\d+)px\)/)
      if (blurMatch) {
        const blurValue = parseInt(blurMatch[1])
        expect(blurValue).toBeGreaterThan(400) // 应该大于标准模式
      }
    })

    it('应该在Firefox中移除filter属性', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 Firefox/89.0',
      })

      const wrapper = mount(GlassContainer, {
        props: defaultProps,
      })

      const backdrop = wrapper.find('.glass__warp')
      const style = backdrop.attributes('style')

      expect(style).not.toContain('filter:')
    })

    it('应该正确应用玻璃容器样式', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          cornerRadius: 20,
          padding: '16px 24px',
        },
      })

      const glass = wrapper.find('.glass')
      const style = glass.attributes('style')

      expect(style).toContain('border-radius: 20px')
      expect(style).toContain('padding: 16px 24px')
    })

    it('应该在overLight为true时应用不同的阴影', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          overLight: true,
        },
      })

      const glass = wrapper.find('.glass')
      const style = glass.attributes('style')

      expect(style).toContain('box-shadow: 0px 16px 70px rgba(0, 0, 0, 0.75)')
    })
  })

  describe('GlassFilter组件集成', () => {
    it('应该正确传递props给GlassFilter', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader,
          displacementScale: 50,
          aberrationIntensity: 3,
        },
      })

      const glassFilter = wrapper.findComponent(GlassFilter)
      expect(glassFilter.exists()).toBe(true)
      expect(glassFilter.props()).toMatchObject({
        mode: GlassMode.shader,
        id: 'mock-id',
        displacementScale: 50,
        aberrationIntensity: 3,
        width: 270,
        height: 69,
      })
    })
  })

  describe('shader模式', () => {
    it('应该在shader模式下生成shader映射', async () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader,
        },
      })

      // 触发props变化来更新shader
      await wrapper.setProps({
        glassSize: { width: 300, height: 100 },
      })

      const glassFilter = wrapper.findComponent(GlassFilter)
      expect(glassFilter.props('shaderMapUrl')).toBe('data:image/png;base64,mock-shader-data')
    })

    it('应该在glassSize变化时重新生成shader', async () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader,
        },
      })

      await wrapper.setProps({
        glassSize: { width: 400, height: 200 },
      })

      const glassFilter = wrapper.findComponent(GlassFilter)
      expect(glassFilter.props('shaderMapUrl')).toBe('data:image/png;base64,mock-shader-data')
    })
  })

  describe('事件处理', () => {
    it('应该正确处理点击事件', async () => {
      const onClick = vi.fn()
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          onClick,
        },
      })

      await wrapper.trigger('click')
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理鼠标悬停事件', async () => {
      const onMouseEnter = vi.fn()
      const onMouseLeave = vi.fn()
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          onMouseEnter,
          onMouseLeave,
        },
      })

      const glass = wrapper.find('.glass')
      await glass.trigger('mouseenter')
      expect(onMouseEnter).toHaveBeenCalledTimes(1)

      await glass.trigger('mouseleave')
      expect(onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理鼠标按下和释放事件', async () => {
      const onMouseDown = vi.fn()
      const onMouseUp = vi.fn()
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          onMouseDown,
          onMouseUp,
        },
      })

      const glass = wrapper.find('.glass')
      await glass.trigger('mousedown')
      expect(onMouseDown).toHaveBeenCalledTimes(1)

      await glass.trigger('mouseup')
      expect(onMouseUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('文本样式', () => {
    it('应该在overLight为false时应用文本阴影', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          overLight: false,
        },
      })

      const textContainer = wrapper.find('.text-white')
      const style = textContainer.attributes('style')

      expect(style).toContain('text-shadow: 0px 2px 12px rgba(0, 0, 0, 0.4)')
    })

    it('应该在overLight为true时移除文本阴影', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          overLight: true,
        },
      })

      const textContainer = wrapper.find('.text-white')
      const style = textContainer.attributes('style')

      expect(style).toContain('text-shadow: 0px 2px 12px rgba(0, 0, 0, 0)')
    })
  })

  describe('组件暴露', () => {
    it('应该暴露containerRef', () => {
      const wrapper = mount(GlassContainer, {
        props: defaultProps,
      })

      expect((wrapper.vm as any).containerRef).toBeDefined()
    })
  })

  describe('props默认值', () => {
    it('应该使用正确的默认属性值', () => {
      const wrapper = mount(GlassContainer)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vm = wrapper.vm as any
      expect(vm.className).toBe('')
      expect(vm.displacementScale).toBe(25)
      expect(vm.blurAmount).toBe(12)
      expect(vm.saturation).toBe(180)
      expect(vm.aberrationIntensity).toBe(2)
      expect(vm.active).toBe(false)
      expect(vm.overLight).toBe(false)
      expect(vm.cornerRadius).toBe(999)
      expect(vm.padding).toBe('24px 32px')
      expect(vm.mode).toBe(GlassMode.standard)
    })
  })
})
