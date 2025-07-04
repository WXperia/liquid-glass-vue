<script lang="ts" setup>
import { ref, watchEffect, computed, type CSSProperties, onMounted, onUnmounted } from 'vue';
import type { LiquidGlassProps } from '../type';
import { GlassMode } from '../type';
import GlassContainerV2 from './GlassContainerV2.vue'


const props = withDefaults(defineProps<LiquidGlassProps>(), {
  displacementScale: 70,
  blurAmount: 0.0625,
  saturation: 140,
  aberrationIntensity: 2,
  elasticity: 0.15,
  cornerRadius: 999,
  padding: "24px 32px",
  overLight: false,
  mode: GlassMode.standard
})
const glassRef = ref<InstanceType<typeof GlassContainerV2>>()
const isHovered = ref(false)
const isActive = ref(false)
const glassSize = ref({ width: 270, height: 69 })
const internalGlobalMousePos = ref({ x: 0, y: 0 })
const internalMouseOffset = ref({ x: 0, y: 0 })

// Use external mouse position if provided, otherwise use internal
const globalMousePos = computed(() => props.globalMousePos || internalGlobalMousePos.value)
const mouseOffset = computed(() => props.mouseOffset || internalMouseOffset.value)
const handleMouseMove = (e: MouseEvent) => {
  const container = props.mouseContainer || glassRef.value?.$el
  if (!container) {
    return
  }

  const rect = container.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  Object.assign(internalMouseOffset.value, {
    x: ((e.clientX - centerX) / rect.width) * 100,
    y: ((e.clientY - centerY) / rect.height) * 100,
  })

  Object.assign(internalGlobalMousePos.value, {
    x: e.clientX,
    y: e.clientY,
  })
}

// Set up mouse tracking if no external mouse position is provided
watchEffect(() => {
  if (props.globalMousePos && props.mouseOffset) {
    // External mouse tracking is provided, don't set up internal tracking
    return
  }

  const container = props.mouseContainer || glassRef.value?.$el
  if (!container) {
    return
  }

  container.addEventListener("mousemove", handleMouseMove)

  return () => {
    container.removeEventListener("mousemove", handleMouseMove)
  }
})

const calculateDirectionalScale = computed(() => {
  if (!globalMousePos.value.x || !globalMousePos.value.y || !glassRef.value) {
    return "scale(1)"
  }

  const rect = glassRef.value?.$el.getBoundingClientRect()
  const pillCenterX = rect.left + rect.width / 2
  const pillCenterY = rect.top + rect.height / 2
  const pillWidth = glassSize.value.width
  const pillHeight = glassSize.value.height

  const deltaX = globalMousePos.value.x - pillCenterX
  const deltaY = globalMousePos.value.y - pillCenterY

  // Calculate distance from mouse to pill edges (not center)
  const edgeDistanceX = Math.max(0, Math.abs(deltaX) - pillWidth / 2)
  const edgeDistanceY = Math.max(0, Math.abs(deltaY) - pillHeight / 2)
  const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY)

  // Activation zone: 200px from edges
  const activationZone = 200

  // If outside activation zone, no effect
  if (edgeDistance > activationZone) {
    return "scale(1)"
  }

  // Calculate fade-in factor (1 at edge, 0 at activation zone boundary)
  const fadeInFactor = 1 - edgeDistance / activationZone

  // Normalize the deltas for direction
  const centerDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  if (centerDistance === 0) {
    return "scale(1)"
  }

  const normalizedX = deltaX / centerDistance
  const normalizedY = deltaY / centerDistance

  // Calculate stretch factors with fade-in
  const stretchIntensity = Math.min(centerDistance / 300, 1) * props.elasticity * fadeInFactor

  // X-axis scaling: stretch horizontally when moving left/right, compress when moving up/down
  const scaleX = 1 + Math.abs(normalizedX) * stretchIntensity * 0.3 - Math.abs(normalizedY) * stretchIntensity * 0.15

  // Y-axis scaling: stretch vertically when moving up/down, compress when moving left/right
  const scaleY = 1 + Math.abs(normalizedY) * stretchIntensity * 0.3 - Math.abs(normalizedX) * stretchIntensity * 0.15

  return `scaleX(${Math.max(0.8, scaleX)}) scaleY(${Math.max(0.8, scaleY)})`
})

const calculateFadeInFactor = computed(() => {
  if (!globalMousePos.value.x || !globalMousePos.value.y || !glassRef.value) {
    return 0
  }

  const rect = glassRef.value?.$el.getBoundingClientRect()
  const pillCenterX = rect.left + rect.width / 2
  const pillCenterY = rect.top + rect.height / 2
  const pillWidth = glassSize.value.width
  const pillHeight = glassSize.value.height

  const edgeDistanceX = Math.max(0, Math.abs(globalMousePos.value.x - pillCenterX) - pillWidth / 2)
  const edgeDistanceY = Math.max(0, Math.abs(globalMousePos.value.y - pillCenterY) - pillHeight / 2)
  const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY)

  const activationZone = 200
  return edgeDistance > activationZone ? 0 : 1 - edgeDistance / activationZone
})

// Helper function to calculate elastic translation
const calculateElasticTranslation = computed(() => {
  if (!glassRef.value) {
    return { x: 0, y: 0 }
  }

  const fadeInFactor = calculateFadeInFactor.value
  const rect = glassRef.value?.$el.getBoundingClientRect()
  const pillCenterX = rect.left + rect.width / 2
  const pillCenterY = rect.top + rect.height / 2

  return {
    x: (globalMousePos.value.x - pillCenterX) * props.elasticity * 0.1 * fadeInFactor,
    y: (globalMousePos.value.y - pillCenterY) * props.elasticity * 0.1 * fadeInFactor,
  }
}
)
const updateGlassSize = () => {
  if (glassRef.value) {
    const rect = glassRef.value?.$el.getBoundingClientRect()
    Object.assign(glassSize.value, { width: rect.width, height: rect.height })
  }
}

const transformStyle = computed(() => {
  return `translate(calc(-50% + ${calculateElasticTranslation.value.x}px), calc(-50% + ${calculateElasticTranslation.value.y}px)) ${isActive.value && Boolean(props.onClick) ? "scale(0.96)" : calculateDirectionalScale.value}`
})

const baseStyle = computed(() => {
  return {
    ...props.style,
    transform: transformStyle.value,
    transition: "all ease-out 0.2s",
  }
})

const positionStyles = computed<Partial<CSSProperties>>(() => {
  return {
    position: baseStyle.value.position || "relative",
    top: baseStyle.value.top || "50%",
    left: baseStyle.value.left || "50%",
  }
})

onMounted(() => {
  window.addEventListener("resize", updateGlassSize)
  updateGlassSize()
})
onUnmounted(() => {
  window.removeEventListener("resize", updateGlassSize)
})
</script>

<template>
  <div class="relatice">
    <GlassContainerV2 :style="baseStyle" :cornerRadius="cornerRadius" :displacementScale="displacementScale"
      :blurAmount="blurAmount" :saturation="saturation" :aberrationIntensity="aberrationIntensity"
      :glassSize="glassSize" :padding="padding" :mouseOffset="mouseOffset" :onMouseEnter="() => isHovered = true"
      :onMouseLeave="() => isHovered = false" :onMouseDown="() => isActive = true" :onMouseUp="() => isActive = false"
      :active="isActive" :overLight="overLight" :mode="mode">
      <slot />
    </GlassContainerV2>
  </div>
</template>
