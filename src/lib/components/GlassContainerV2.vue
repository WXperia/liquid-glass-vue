<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch, type CSSProperties } from 'vue';
import { GlassMode, type GlassContainerProps } from '../type';
import GlassFilter from './GlassFilter.vue';
import { ShaderDisplacementGenerator } from '../shader-util';
import { uuid, isFirefox, debounce, FilterMapCache, componentCount } from '../utils';
const props = withDefaults(defineProps<GlassContainerProps>(), {
  className: "",
  displacementScale: 25,
  blurAmount: 1,
  saturation: 180,
  aberrationIntensity: 2,
  active: false,
  overLight: false,
  cornerRadius: 10,
  padding: "24px 32px",
  mode: GlassMode.shader,
  effect: "liquidGlass"
})
const filterId = uuid()
const shaderMapUrl = ref<string>("")
const glassSize = ref({ width: 270, height: 69 })

// Generate shader-based displacement map using shaderUtils
const generateShaderDisplacementMap = async (width: number, height: number) => {
  const cacheKey = `${width}x${height}-${props.effect}`
  if (FilterMapCache.has(cacheKey)) {
    return FilterMapCache.get(cacheKey) as string
  }
  const generator = new ShaderDisplacementGenerator({
    width,
    height,
    effect: props.effect
  })
  const dataUrl = await generator.updateShader()
  FilterMapCache.set(cacheKey, dataUrl)
  return dataUrl
}
const debouncedGenerateShaderDisplacementMap = debounce(generateShaderDisplacementMap as unknown as (...args: unknown[]) => unknown, 500)
watch(() => [props.mode, props.effect, glassSize.value.width, glassSize.value.height], () => {
  if (props.mode === "shader") {
    debouncedGenerateShaderDisplacementMap(glassSize.value.width, glassSize.value.height)
  }
})

const sizeChange = () => {
  if (liquidGlassContentRef.value) {
    const rect = liquidGlassContentRef.value.getBoundingClientRect()

    Object.assign(glassSize.value, { width: rect.width, height: rect.height })
  }
}

// liquid glass size logic
const liquidGlassContentRef = ref<HTMLElement>()
onMounted(() => {
  sizeChange()
  window?.addEventListener("resize", sizeChange)
  componentCount.add()
})
onUnmounted(() => {
  window?.removeEventListener("resize", sizeChange)
  componentCount.remove()
  if (componentCount.count === 0) {
    FilterMapCache.clear()
  }
})
const backdropStyle = computed<Partial<CSSProperties>>(() => {
  return {
    filter: isFirefox ? undefined : `url(#${filterId})`,
    backdropFilter: `blur(${(props.overLight ? 12 : 0) + props.blurAmount}px) saturate(${props.saturation}%)`,
    position: 'absolute',
    inset: '0',

  }
})
// glass style
const glassStyle = computed(() => {
  return {
    transition: 'all 0.2s ease-in-out',
    boxShadow: props.overLight ? '0px 16px 70px rgba(0, 0, 0, 0.75)' : '0px 12px 40px rgba(0, 0, 0, 0.25)',
    borderRadius: `${props.cornerRadius}px`,
    overflow: 'hidden',
  }
})
const ctx = getCurrentInstance()
const hasClickEvent = computed(() => {
  return ctx?.attrs.onClick !== undefined
})

</script>
<template>
  <div class="liquid-glass" :class="{
    'cursor-pointer': hasClickEvent
  }">
    <GlassFilter :mode="mode" :id="filterId" :displacementScale="displacementScale"
      :aberrationIntensity="aberrationIntensity" :width="glassSize.width" :height="glassSize.height"
      :shaderMapUrl="shaderMapUrl" />
    <div class="glass" :style="glassStyle" ref="liquidGlassContentRef">
      <div class="glass__warp" :style="backdropStyle"></div>

      <div class="transition-all duration-150 ease-in-out text-white" :style="{
        position: 'relative',
        zIndex: 1,
        textShadow: props.overLight ? '0px 2px 12px rgba(0, 0, 0, 0)' : '0px 2px 12px rgba(0, 0, 0, 0.4)',
      }">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.liquid-glass {
  position: relative;
  width: fit-content;
  height: fit-content;
}

.glass {
  display: block;
  width: fit-content;
  height: fit-content;
  position: relative;
}
</style>
