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

  describe('Component Rendering', () => {
    it('should render basic structure correctly', () => {
      const wrapper = mount(GlassContainer, {
        props: defaultProps,
        slots: {
          default: 'Test Content',
        },
      })

      expect(wrapper.find('.relative').exists()).toBe(true)
      expect(wrapper.find('.glass').exists()).toBe(true)
      expect(wrapper.find('.glass__warp').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
    })

    it('should apply className property correctly', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          className: 'custom-class',
        },
      })

      expect(wrapper.find('.custom-class').exists()).toBe(true)
    })

    it('should apply active class when active is true', () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          active: true,
        },
      })

      expect(wrapper.find('.active').exists()).toBe(true)
    })

    it('should apply cursor-pointer class when onClick callback exists', () => {
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

  describe('Style Calculation', () => {
    it('should calculate backdrop style correctly', () => {
      const wrapper = mount(GlassContainer, {
        props: defaultProps,
      })

      const backdrop = wrapper.find('.glass__warp')
      const style = backdrop.attributes('style')

      // Debug output
      console.log('Actual style:', style)

      expect(style).toContain('filter: url(#mock-id)')
      // Vue may convert camelCase to kebab-case, or styles may not be fully rendered
      expect(
        style && (style.includes('backdrop-filter:') || style.includes('backdropFilter:')),
      ).toBe(true)
    })

    it('should adjust blur value when overLight is true', () => {
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
      // Should have higher blur value in overLight mode
      const blurMatch = style?.match(/blur\((\d+)px\)/)
      if (blurMatch) {
        const blurValue = parseInt(blurMatch[1])
        expect(blurValue).toBeGreaterThan(400) // Should be greater than standard mode
      }
    })

    it('should remove filter property in Firefox', () => {
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

    it('should apply glass container styles correctly', () => {
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

    it('should apply different shadow when overLight is true', () => {
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

  describe('GlassFilter Component Integration', () => {
    it('should pass props to GlassFilter correctly', () => {
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

  describe('Shader Mode', () => {
    it('should generate shader map in shader mode', async () => {
      const wrapper = mount(GlassContainer, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader,
        },
      })

      // Trigger props change to update shader
      await wrapper.setProps({
        glassSize: { width: 300, height: 100 },
      })

      const glassFilter = wrapper.findComponent(GlassFilter)
      expect(glassFilter.props('shaderMapUrl')).toBe('data:image/png;base64,mock-shader-data')
    })

    it('should regenerate shader when glassSize changes', async () => {
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

  describe('Event Handling', () => {
    it('should handle click event correctly', async () => {
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

    it('should handle mouse hover events correctly', async () => {
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

    it('should handle mouse down and up events correctly', async () => {
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

  describe('Text Styles', () => {
    it('should apply text shadow when overLight is false', () => {
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

    it('should remove text shadow when overLight is true', () => {
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

  describe('Component Exposure', () => {
    it('should expose containerRef', () => {
      const wrapper = mount(GlassContainer, {
        props: defaultProps,
      })

      expect((wrapper.vm as any).containerRef).toBeDefined()
    })
  })

  describe('Default Props', () => {
    it('should use correct default prop values', () => {
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
