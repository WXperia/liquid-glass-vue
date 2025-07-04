
export function autoPx(val: number | string) {
  if (typeof val === 'string') {
    const num = Number(val)
    return isNaN(num) ? val : num + 'px'
  }
  return val + 'px'
}

// 传入两个对象，比较对象的所有key是否相等
export function isObjectEqual(obj1: Object, obj2: Object | undefined | null): boolean {
  if (!obj1 || !obj2) return true
  if (obj1 === obj2) return true
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null)
    return false
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) return false
  return keys1.every((key) => obj1[key] === obj2[key])
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
/**
 * Check if OffscreenCanvas is supported in the current environment
 */
export class BlobUrlCache {
  private cache = new Map<string, string>()
  private maxSize: number

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize
  }

  set(key: string, blobUrl: string): void {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (!firstKey) return
      const oldUrl = this.cache.get(firstKey)
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl)
      }
      this.cache.delete(firstKey)
    }

    this.cache.set(key, blobUrl)
  }

  get(key: string): string | undefined {
    return this.cache.get(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    // Clean up all blob URLs
    this.cache.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    this.cache.clear()
  }

  delete(key: string): boolean {
    const url = this.cache.get(key)
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
    return this.cache.delete(key)
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * Create a cache key for shader configurations
 */
export function createShaderCacheKey(
  width: number,
  height: number,
  effect: string,
  mousePosition?: { x: number; y: number },
  time?: number,
): string {
  const timeRounded = time ? Math.floor(time * 10) / 10 : 0 // Round to 0.1s precision
  const mouse = mousePosition
    ? `_${Math.floor(mousePosition.x)}_${Math.floor(mousePosition.y)}`
    : ''
  return `${width}x${height}_${effect}_${timeRounded}${mouse}`
}

export const isFirefox = window.navigator.userAgent.toLowerCase().includes('firefox')
/**
 * Debounce a function
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @param immediate - Whether to execute the function immediately on the first call
 * @returns The debounced function with cancel method
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
  immediate = false
) => {
  let timer: number | null = null
  let result: ReturnType<T>

  const debounced = (...args: Parameters<T>): ReturnType<T> | undefined => {
    const callNow = immediate && !timer

    if (timer) {
      clearTimeout(timer)
    }

    timer = window.setTimeout(() => {
      timer = null
      if (!immediate) {
        result = fn(...args) as ReturnType<T>
      }
    }, delay)

    if (callNow) {
      result = fn(...args) as ReturnType<T>
    }

    return result
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  debounced.flush = (...args: Parameters<T>): ReturnType<T> => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    return fn(...args) as ReturnType<T>
  }

  return debounced
}

export const FilterMapCache = new BlobUrlCache(50)
export const componentCount = {
  count: 0,
  add: () => {
    componentCount.count++
  },
  remove: () => {
    componentCount.count--
  }
}

