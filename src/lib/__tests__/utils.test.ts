import { describe, it, expect } from 'vitest'
import { autoPx, displacementMap, polarDisplacementMap, prominentDisplacementMap } from '../utils'

describe('Utils', () => {
  describe('autoPx function', () => {
    it('should convert numbers to strings with px units', () => {
      expect(autoPx(100)).toBe('100px')
      expect(autoPx(0)).toBe('0px')
      expect(autoPx(-50)).toBe('-50px')
      expect(autoPx(3.14)).toBe('3.14px')
    })

    it('should return string values directly', () => {
      expect(autoPx('50%')).toBe('50%')
      expect(autoPx('100vh')).toBe('100vh')
      expect(autoPx('auto')).toBe('auto')
      expect(autoPx('calc(100% - 20px)')).toBe('calc(100% - 20px)')
    })

    it('should handle empty strings', () => {
      expect(autoPx('')).toBe('')
    })
  })

  describe('Displacement map constants', () => {
    it('displacementMap should be valid base64 JPEG data', () => {
      expect(displacementMap).toMatch(/^data:image\/jpeg;base64,/)
      expect(displacementMap.length).toBeGreaterThan(100)
    })

    it('polarDisplacementMap should be valid base64 JPEG data', () => {
      expect(polarDisplacementMap).toMatch(/^data:image\/jpeg;base64,/)
      expect(polarDisplacementMap.length).toBeGreaterThan(100)
    })

    it('prominentDisplacementMap should be valid base64 PNG data', () => {
      expect(prominentDisplacementMap).toMatch(/^data:image\/png;base64,/)
      expect(prominentDisplacementMap.length).toBeGreaterThan(100)
    })

    it('all displacement maps should be different', () => {
      expect(displacementMap).not.toBe(polarDisplacementMap)
      expect(displacementMap).not.toBe(prominentDisplacementMap)
      expect(polarDisplacementMap).not.toBe(prominentDisplacementMap)
    })

    it('all displacement maps should contain valid base64 encoded data', () => {
      // Test base64 encoding validity
      const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
      
      const displacementBase64 = displacementMap.replace('data:image/jpeg;base64,', '')
      const polarBase64 = polarDisplacementMap.replace('data:image/jpeg;base64,', '')
      const prominentBase64 = prominentDisplacementMap.replace('data:image/png;base64,', '')

      expect(base64Pattern.test(displacementBase64)).toBe(true)
      expect(base64Pattern.test(polarBase64)).toBe(true)
      expect(base64Pattern.test(prominentBase64)).toBe(true)
    })
  })

  describe('Type safety', () => {
    it('autoPx should handle number type correctly', () => {
      const numValue: number = 42
      const result = autoPx(numValue)
      expect(typeof result).toBe('string')
      expect(result).toBe('42px')
    })

    it('autoPx should handle string type correctly', () => {
      const strValue: string = '50%'
      const result = autoPx(strValue)
      expect(typeof result).toBe('string')
      expect(result).toBe('50%')
    })

    it('autoPx should handle union type correctly', () => {
      const mixedValue: number | string = Math.random() > 0.5 ? 100 : '50%'
      const result = autoPx(mixedValue)
      expect(typeof result).toBe('string')
      
      if (typeof mixedValue === 'number') {
        expect(result).toBe(`${mixedValue}px`)
      } else {
        expect(result).toBe(mixedValue)
      }
    })
  })
})