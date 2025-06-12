import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GlassFilter from '../GlassFilter.vue'
import { GlassMode, type GlassFilterProps } from '../../type'

describe('GlassFilter', () => {
  const defaultProps: GlassFilterProps = {
    id: 'test-filter',
    displacementScale: 10,
    aberrationIntensity: 0.5,
    width: 300,
    height: 200,
    mode: GlassMode.standard
  }

  describe('Component Rendering', () => {
    it('should render SVG element correctly', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('should apply correct styles', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const svg = wrapper.find('svg')
      const style = svg.attributes('style')
      
      expect(style).toContain('position: absolute')
      expect(style).toContain('width: 300px')
      expect(style).toContain('height: 200px')
    })

    it('should support string type width and height', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          width: '50%',
          height: '100vh'
        }
      })

      const svg = wrapper.find('svg')
      const style = svg.attributes('style')
      
      expect(style).toContain('width: 50%')
      expect(style).toContain('height: 100vh')
    })
  })

  describe('SVG Filter Structure', () => {
    it('should contain correct filter element', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const filter = wrapper.find('filter')
      expect(filter.exists()).toBe(true)
      expect(filter.attributes('id')).toBe(defaultProps.id)
      expect(filter.attributes('x')).toBe('-35%')
      expect(filter.attributes('y')).toBe('-35%')
      expect(filter.attributes('width')).toBe('170%')
      expect(filter.attributes('height')).toBe('170%')
    })

    it('should contain radial gradient definition', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const radialGradient = wrapper.find('radialGradient')
      expect(radialGradient.exists()).toBe(true)
      expect(radialGradient.attributes('id')).toBe(`${defaultProps.id}-edge-mask`)
      expect(radialGradient.attributes('cx')).toBe('50%')
      expect(radialGradient.attributes('cy')).toBe('50%')
      expect(radialGradient.attributes('r')).toBe('50%')
    })

    it('should contain feImage element', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const feImage = wrapper.find('feImage')
      expect(feImage.exists()).toBe(true)
      expect(feImage.attributes('id')).toBe('feimage')
      expect(feImage.attributes('result')).toBe('DISPLACEMENT_MAP')
    })

    it('should contain multiple displacement map elements', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const displacementMaps = wrapper.findAll('feDisplacementMap')
      expect(displacementMaps.length).toBe(3) // One for each RGB channel
    })

    it('should contain color matrix transformations', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const colorMatrices = wrapper.findAll('feColorMatrix')
      expect(colorMatrices.length).toBeGreaterThan(0)
    })
  })

  describe('Displacement Modes', () => {
    it('standard mode should use standard displacement map', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.standard
        }
      })

      const feImage = wrapper.find('feImage')
      expect(feImage.attributes('href')).toContain('data:image/jpeg;base64')
    })

    it('polar mode should use polar displacement map', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.polar
        }
      })

      const feImage = wrapper.find('feImage')
      expect(feImage.attributes('href')).toContain('data:image/jpeg;base64')
    })

    it('prominent mode should use prominent displacement map', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.prominent
        }
      })

      const feImage = wrapper.find('feImage')
      expect(feImage.attributes('href')).toContain('data:image/png;base64')
    })

    it('shader mode should use custom map URL', () => {
      const customUrl = 'https://example.com/custom-map.jpg'
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader,
          shaderMapUrl: customUrl
        }
      })

      const feImage = wrapper.find('feImage')
      expect(feImage.attributes('href')).toBe(customUrl)
    })

    it('shader mode should fallback to standard map when no URL provided', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader
          // No shaderMapUrl provided
        }
      })

      const feImage = wrapper.find('feImage')
      expect(feImage.attributes('href')).toContain('data:image/jpeg;base64')
    })
  })

  describe('Displacement Scale Calculation', () => {
    it('scale should be 1 in shader mode', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.shader
        }
      })

      // Check displacement map scale attribute
      const displacementMaps = wrapper.findAll('feDisplacementMap')
      const firstDisplacement = displacementMaps[0]
      expect(firstDisplacement.attributes('scale')).toBe('10') // displacementScale * 1
    })

    it('scale should be -1 in non-shader mode', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          mode: GlassMode.standard
        }
      })

      // Check displacement map scale attribute
      const displacementMaps = wrapper.findAll('feDisplacementMap')
      const firstDisplacement = displacementMaps[0]
      expect(firstDisplacement.attributes('scale')).toBe('-10') // displacementScale * -1
    })
  })

  describe('Chromatic Aberration Effect', () => {
    it('should adjust edge mask based on aberrationIntensity', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          aberrationIntensity: 2
        }
      })

      const stops = wrapper.findAll('stop')
      const secondStop = stops[1]
      const offset = parseFloat(secondStop.attributes('offset')?.replace('%', '') || '0')
      
      // Should be Math.max(30, 80 - aberrationIntensity * 2) = Math.max(30, 76) = 76
      expect(offset).toBe(76)
    })

    it('edge mask should have minimum value when aberrationIntensity is very large', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          aberrationIntensity: 50 // Very large value
        }
      })

      const stops = wrapper.findAll('stop')
      const secondStop = stops[1]
      const offset = parseFloat(secondStop.attributes('offset')?.replace('%', '') || '0')
      
      // Should be Math.max(30, 80 - 50 * 2) = Math.max(30, -20) = 30
      expect(offset).toBe(30)
    })

    it('should affect gaussian blur intensity', () => {
      const wrapper = mount(GlassFilter, {
        props: {
          ...defaultProps,
          aberrationIntensity: 1
        }
      })

      const gaussianBlur = wrapper.find('feGaussianBlur')
      const stdDeviation = parseFloat(gaussianBlur.attributes('stdDeviation') || '0')
      
      // Should be Math.max(0.1, 0.5 - 1 * 0.1) = Math.max(0.1, 0.4) = 0.4
      expect(stdDeviation).toBe(0.4)
    })
  })

  describe('RGB Channel Separation', () => {
    it('should create independent displacement maps for each color channel', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const displacementMaps = wrapper.findAll('feDisplacementMap')
      expect(displacementMaps.length).toBe(3)

      // Check result attributes for each channel
      expect(displacementMaps[0].attributes('result')).toBe('RED_DISPLACED')
      expect(displacementMaps[1].attributes('result')).toBe('GREEN_DISPLACED')
      expect(displacementMaps[2].attributes('result')).toBe('BLUE_DISPLACED')
    })

    it('should create independent color matrices for each color channel', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const colorMatrices = wrapper.findAll('feColorMatrix')
      
      // Find color matrices handling RGB channels
      const redChannel = colorMatrices.find(cm => cm.attributes('result') === 'RED_CHANNEL')
      const greenChannel = colorMatrices.find(cm => cm.attributes('result') === 'GREEN_CHANNEL')
      const blueChannel = colorMatrices.find(cm => cm.attributes('result') === 'BLUE_CHANNEL')

      expect(redChannel?.exists()).toBe(true)
      expect(greenChannel?.exists()).toBe(true)
      expect(blueChannel?.exists()).toBe(true)
    })

    it('should combine channels using screen blend mode', () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      const blends = wrapper.findAll('feBlend')
      expect(blends.length).toBeGreaterThanOrEqual(2)
      
      // Check blend modes
      const screenBlends = blends.filter(blend => blend.attributes('mode') === 'screen')
      expect(screenBlends.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      expect(() => {
        mount(GlassFilter, {
          props: defaultProps
        })
      }).not.toThrow()
    })

    it('should accept different types of dimension values', () => {
      const numericProps = { ...defaultProps, width: 100, height: 200 }
      const stringProps = { ...defaultProps, width: '50%', height: '100vh' }

      expect(() => {
        mount(GlassFilter, { props: numericProps })
      }).not.toThrow()

      expect(() => {
        mount(GlassFilter, { props: stringProps })
      }).not.toThrow()
    })

    it('should accept all valid mode values', () => {
      const modes: Array<GlassMode> = 
        [GlassMode.standard, GlassMode.polar, GlassMode.prominent, GlassMode.shader]

      modes.forEach(mode => {
        expect(() => {
          mount(GlassFilter, {
            props: { ...defaultProps, mode }
          })
        }).not.toThrow()
      })
    })
  })

  describe('Reactive Updates', () => {
    it('should update rendering when props change', async () => {
      const wrapper = mount(GlassFilter, {
        props: defaultProps
      })

      await wrapper.setProps({ width: 400 })
      
      const svg = wrapper.find('svg')
      const style = svg.attributes('style')
      expect(style).toContain('width: 400px')
    })

    it('should update displacement map when mode changes', async () => {
      const wrapper = mount(GlassFilter, {
        props: { ...defaultProps, mode: GlassMode.standard }
      })

      const initialHref = wrapper.find('feImage').attributes('href')

      await wrapper.setProps({ mode: GlassMode.polar })
      
      const updatedHref = wrapper.find('feImage').attributes('href')
      expect(updatedHref).not.toBe(initialHref)
    })

    it('should update effect when aberrationIntensity changes', async () => {
      const wrapper = mount(GlassFilter, {
        props: { ...defaultProps, aberrationIntensity: 1 }
      })

      const initialOffset = wrapper.findAll('stop')[1].attributes('offset')

      await wrapper.setProps({ aberrationIntensity: 3 })
      
      const updatedOffset = wrapper.findAll('stop')[1].attributes('offset')
      expect(updatedOffset).not.toBe(initialOffset)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small aberrationIntensity values', () => {
      expect(() => {
        mount(GlassFilter, {
          props: { ...defaultProps, aberrationIntensity: 0 }
        })
      }).not.toThrow()
    })

    it('should handle very large aberrationIntensity values', () => {
      expect(() => {
        mount(GlassFilter, {
          props: { ...defaultProps, aberrationIntensity: 100 }
        })
      }).not.toThrow()
    })

    it('should handle negative displacementScale values', () => {
      expect(() => {
        mount(GlassFilter, {
          props: { ...defaultProps, displacementScale: -10 }
        })
      }).not.toThrow()
    })

    it('should handle zero dimensions', () => {
      expect(() => {
        mount(GlassFilter, {
          props: { ...defaultProps, width: 0, height: 0 }
        })
      }).not.toThrow()
    })
  })
})