<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import LiquidGlass from './lib/components/LiquidGlass.vue'
import { GlassMode } from './lib/type'
import type { FragmentShaderType } from './lib/shader-util'

// 主题模式
const isDarkMode = ref(true)

// 用户信息卡片控制参数
const displacementScale = ref(100)
const blurAmount = ref(0.5)
const saturation = ref(140)
const aberrationIntensity = ref(2)
const elasticity = ref(0)
const cornerRadius = ref(32)
const userInfoOverLight = ref(false)
const userInfoMode = ref<GlassMode>(GlassMode.standard)

// 退出按钮控制参数
const logoutDisplacementScale = ref(64)
const logoutBlurAmount = ref(0.1)
const logoutSaturation = ref(130)
const logoutAberrationIntensity = ref(2)
const logoutElasticity = ref(0.35)
const logoutCornerRadius = ref(100)
const logoutOverLight = ref(false)
const logoutMode = ref<GlassMode>(GlassMode.standard)

// 共享状态
const activeTab = ref<'userInfo' | 'logOut'>('userInfo')
const containerRef = ref<HTMLElement>()
const scroll = ref(0)
const effectList = ["flowingLiquid", 'liquidGlass', 'transparentIce', 'unevenGlass', 'mosaicGlass'] as FragmentShaderType[]
const effect = ref<FragmentShaderType>(effectList[0])

// Add effect display names mapping
const effectNames = {
  flowingLiquid: 'Flowing Liquid',
  liquidGlass: 'Liquid Glass',
  transparentIce: 'Transparent Ice',
  unevenGlass: 'Uneven Glass',
  mosaicGlass: 'Mosaic Glass'
}

const handleScroll = (event: Event) => {
  requestAnimationFrame(() => {
    const target = event.target as HTMLElement
    scroll.value = target?.scrollTop || 0
  })
}

const scrollingOverBrightSection = computed(() => scroll.value > 230 && scroll.value < 500)

const handleLogout = () => {
  console.log("已退出登录")
}

// 主题切换
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}

// 主题相关的计算属性
const themeClass = computed(() => isDarkMode.value ? 'dark' : 'light')
const containerBgClass = computed(() =>
  isDarkMode.value
    ? 'bg-gray-900/80 backdrop-blur-md border-white/10'
    : 'bg-white/80 backdrop-blur-md border-gray-200'
)
const textClass = computed(() => isDarkMode.value ? 'text-white' : 'text-gray-900')
const textSecondaryClass = computed(() => isDarkMode.value ? 'text-white/60' : 'text-gray-600')
const textTertiaryClass = computed(() => isDarkMode.value ? 'text-white/50' : 'text-gray-500')
const inputBgClass = computed(() => isDarkMode.value ? 'bg-white/5' : 'bg-gray-100')
const buttonActiveClass = computed(() => isDarkMode.value ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white')
const buttonInactiveClass = computed(() =>
  isDarkMode.value
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
)

// 根据主题调整玻璃效果的 overLight 属性
const effectiveUserInfoOverLight = computed(() =>
  isDarkMode.value ? (scrollingOverBrightSection.value || userInfoOverLight.value) : true
)
const effectiveLogoutOverLight = computed(() =>
  isDarkMode.value ? (scrollingOverBrightSection.value || logoutOverLight.value) : true
)
// 自动检测系统主题
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
isDarkMode.value = prefersDarkMode.matches

// 监听系统主题变化
prefersDarkMode.addEventListener('change', (e) => {
  isDarkMode.value = e.matches
})
// 监听主题变化并同步到 body
watch(isDarkMode, (newValue) => {
  document.body.style.backgroundColor = newValue ? '#1a1a1a' : '#ffffff'
})

// 初始化时设置 body 背景色
onMounted(() => {
  document.body.style.backgroundColor = isDarkMode.value ? '#1a1a1a' : '#ffffff'
})

</script>

<template>
  <div
    :class="`grid grid-cols-3 shadow-2xl w-full max-w-5xl mx-auto my-10 h-screen max-h-[calc(100vh-5rem)] rounded-3xl overflow-hidden font-sans ${themeClass}`">

    <div :class="`flex-1 relative overflow-auto col-span-2 ${isDarkMode ? 'bg-black' : 'bg-gray-100'}`"
      ref="containerRef" @scroll="handleScroll">
      <div class="w-full min-h-[200vh] absolute top-0 left-0 pb-96 mb-96">
        <img src="https://picsum.photos/2000/2000" class="w-full h-96 object-cover" />
        <div class="flex flex-col gap-2" id="bright-section">
          <h2 :class="`text-2xl font-semibold my-5 text-center ${textClass}`">Some Title</h2>
          <p :class="`px-10 ${textClass}`">
            This is a sample text content to demonstrate the liquid glass effect under different backgrounds.<br />
            This is a sample text content to demonstrate the liquid glass effect under different backgrounds.<br />
            This is a sample text content to demonstrate the liquid glass effect under different backgrounds.<br />
            This is a sample text content to demonstrate the liquid glass effect under different backgrounds.<br />
            This is a sample text content to demonstrate the liquid glass effect under different backgrounds.<br />
            This is a sample text content to demonstrate the liquid glass effect under different backgrounds.
          </p>
        </div>
        <img src="https://picsum.photos/1200/1200" class="w-full h-80 object-cover my-10" />
        <img src="https://picsum.photos/1400/1300" class="w-full h-72 object-cover my-10" />
        <img src="https://picsum.photos/1100/1200" class="w-full h-96 object-cover my-10 mb-96" />
      </div>
      <!-- User Info Card -->
      <LiquidGlass v-if="activeTab === 'userInfo'" :effect="effect" :displacementScale="displacementScale"
        :blurAmount="blurAmount" :saturation="saturation" :aberrationIntensity="aberrationIntensity"
        :elasticity="elasticity" :cornerRadius="cornerRadius" :mouseContainer="containerRef"
        :overLight="effectiveUserInfoOverLight" :mode="userInfoMode" :style="{
          position: 'fixed',
          top: '25%',
          left: '40%',
        }">
        <div class="w-72 text-white text-shadow-lg">
          <h3 class="text-xl font-semibold mb-4">User Information</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div
                class="w-12 h-12 bg-black/10 backdrop-blur rounded-full flex items-center justify-center text-white font-semibold">
                John
              </div>
              <div>
                <p class="font-medium">John</p>
                <p class="text-sm text-white/80">Software Engineer</p>
              </div>
            </div>
            <div class="pt-2 space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-white/80">Email:</span>
                <span class="text-sm">john@example.com</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-white/80">Location:</span>
                <span class="text-sm">Wanderland, Earth</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-white/80">Join Date:</span>
                <span class="text-sm">March 2023</span>
              </div>
            </div>
          </div>
        </div>
      </LiquidGlass>

      <!-- Logout Button -->
      <LiquidGlass v-if="activeTab === 'logOut'" :effect="effect" :displacementScale="logoutDisplacementScale"
        :blurAmount="logoutBlurAmount" :saturation="logoutSaturation" :aberrationIntensity="logoutAberrationIntensity"
        :elasticity="logoutElasticity" :cornerRadius="logoutCornerRadius" :mouseContainer="containerRef"
        :overLight="effectiveLogoutOverLight" :mode="logoutMode" padding="8px 16px" :onClick="handleLogout" :style="{
          position: 'fixed',
          top: '20%',
          left: '40%',
        }">
        <h3 class="text-lg font-medium flex items-center gap-2 text-white">
          Logout
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </h3>
      </LiquidGlass>
    </div>

    <!-- 右侧面板 - 控制面板 -->
    <div :class="`col-start-3 h-full overflow-y-auto border-l p-8 flex flex-col ${containerBgClass}`">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 :class="`text-2xl font-bold ${textClass}`">Liquid Glass Effect</h2>
          <div class="flex items-center gap-2">
            <!-- 主题切换按钮 -->
            <button @click="toggleTheme"
              :class="`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`"
              :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <svg v-if="isDarkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <a href="https://github.com/wxperia/liquid-glass-vue" target="_blank" rel="noopener noreferrer"
              :class="`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`"
              title="View on GitHub">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
        <p :class="`text-sm ${textSecondaryClass}`">Liquid Glass Container Effect for Vue, with settings and effects.
        </p>
      </div>

      <!-- 标签切换器 -->
      <div :class="`flex mb-6 rounded-lg p-1 ${inputBgClass}`">
        <button @click="activeTab = 'userInfo'" :class="`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'userInfo'
          ? buttonActiveClass
          : buttonInactiveClass
          }`">
          User Info Card
        </button>
        <button @click="activeTab = 'logOut'" :class="`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'logOut'
          ? buttonActiveClass
          : buttonInactiveClass
          }`">
          Logout Button
        </button>
      </div>
      <div>
        <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Effect Type</span>
        <div class="space-y-2">
          <div v-for="effectType in effectList" :key="effectType" class="flex items-center space-x-3">
            <input type="radio" :id="`effect${effectType}`" name="effect" :value="effectType" v-model="effect"
              class="w-4 h-4 accent-blue-500" />
            <label :class="`text-sm ${textClass}`" :for="`effect${effectType}`">{{ effectNames[effectType] }}</label>
          </div>
        </div>
        <p :class="`text-xs mt-2 ${textTertiaryClass}`">Select the liquid glass effect type</p>
      </div>
      <div class="space-y-8 flex-1">
        <!-- 用户信息卡片控制 -->
        <template v-if="activeTab === 'userInfo'">
          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Refraction Mode</span>
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <input type="radio" id="userInfoModeStandard" name="userInfoMode" :value="GlassMode.standard"
                  v-model="userInfoMode" class="w-4 h-4 accent-blue-500" />
                <label :class="`text-sm ${textClass}`" for="userInfoModeStandard">Standard</label>
              </div>
              <div class="flex items-center space-x-3">
                <input type="radio" id="userInfoModePolar" name="userInfoMode" :value="GlassMode.polar"
                  v-model="userInfoMode" class="w-4 h-4 accent-blue-500" />
                <label :class="`text-sm ${textClass}`" for="userInfoModePolar">Polar</label>
              </div>
              <div class="flex items-center space-x-3">
                <input type="radio" id="userInfoModeProminent" name="userInfoMode" :value="GlassMode.prominent"
                  v-model="userInfoMode" class="w-4 h-4 accent-blue-500" />
                <label :class="`text-sm ${textClass}`" for="userInfoModeProminent">Prominent</label>
              </div>
              <div class="flex items-center space-x-3">
                <input type="radio" id="userInfoModeShader" name="userInfoMode" :value="GlassMode.shader"
                  v-model="userInfoMode" class="w-4 h-4 accent-blue-500" />
                <label :class="`text-sm ${textClass}`" for="userInfoModeShader">Shader</label>
              </div>
            </div>
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the refraction calculation method</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Displacement Scale</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-blue-500">{{ displacementScale }}</span>
            </div>
            <input type="range" min="0" max="200" step="1" v-model="displacementScale"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the strength of edge distortion</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Blur Amount</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-green-500">{{ blurAmount }}</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" v-model="blurAmount"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the background blur intensity</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Saturation</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-purple-500">{{ saturation }}%</span>
            </div>
            <input type="range" min="100" max="300" step="10" v-model="saturation"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the color saturation of the background</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Aberration Intensity</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-cyan-500">{{ aberrationIntensity }}</span>
            </div>
            <input type="range" min="0" max="20" step="1" v-model="aberrationIntensity"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the strength of RGB channel separation</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Elasticity</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-orange-500">{{ elasticity }}</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" v-model="elasticity"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the extent to which the glass stretches towards the
              cursor</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Corner Radius</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-pink-500">{{ cornerRadius === 999 ? "完全" : `${cornerRadius}px`
                }}</span>
            </div>
            <input type="range" min="0" max="100" step="1" v-model="cornerRadius"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the roundness of the glass corners</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Bright Background</span>
            <div class="flex items-center space-x-3">
              <input type="checkbox" id="userInfoOverLight" v-model="userInfoOverLight"
                class="w-5 h-5 accent-blue-500" />
              <label :class="`text-sm ${textClass}`" for="userInfoOverLight">
                Darken the liquid glass (for bright backgrounds)
              </label>
            </div>
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Make the glass better visible on light backgrounds</p>
          </div>
        </template>

        <!-- 退出按钮控制 -->
        <template v-if="activeTab === 'logOut'">
          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Refraction Mode</span>
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <input type="radio" id="logoutModeStandard" name="logoutMode" :value="GlassMode.standard"
                  v-model="logoutMode" class="w-4 h-4 accent-blue-500" />
                <label :class="`text-sm ${textClass}`" for="logoutModeStandard">Standard</label>
              </div>
              <div class="flex items-center space-x-3">
                <input type="radio" id="logoutModePolar" name="logoutMode" :value="GlassMode.polar" v-model="logoutMode"
                  class="w-4 h-4 accent-blue-500" />
                <label :class="`text-sm ${textClass}`" for="logoutModePolar">Polar</label>
              </div>
            </div>
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the refraction calculation method</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Displacement Scale</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-blue-500">{{ logoutDisplacementScale }}</span>
            </div>
            <input type="range" min="0" max="200" step="1" v-model="logoutDisplacementScale"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the strength of edge distortion</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Blur Amount</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-green-500">{{ logoutBlurAmount }}</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" v-model="logoutBlurAmount"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the background blur intensity</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Saturation</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-purple-500">{{ logoutSaturation }}%</span>
            </div>
            <input type="range" min="100" max="300" step="10" v-model="logoutSaturation"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the color saturation of the background</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Aberration Intensity</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-cyan-500">{{ logoutAberrationIntensity }}</span>
            </div>
            <input type="range" min="0" max="20" step="1" v-model="logoutAberrationIntensity"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the strength of RGB channel separation</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Elasticity</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-orange-500">{{ logoutElasticity }}</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" v-model="logoutElasticity"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the extent to which the glass stretches towards the
              cursor</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Corner Radius</span>
            <div class="mb-2">
              <span class="text-xl font-mono text-pink-500">{{ logoutCornerRadius === 999 ? "完全" :
                `${logoutCornerRadius}px` }}</span>
            </div>
            <input type="range" min="0" max="100" step="1" v-model="logoutCornerRadius"
              :class="`w-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`" />
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Control the roundness of the glass corners</p>
          </div>

          <div>
            <span :class="`block text-sm font-semibold mb-3 ${textClass}`">Bright Background</span>
            <div class="flex items-center space-x-3">
              <input type="checkbox" id="logoutOverLight" v-model="logoutOverLight" class="w-5 h-5 accent-blue-500" />
              <label :class="`text-sm ${textClass}`" for="logoutOverLight">
                Darken the liquid glass (for bright backgrounds)
              </label>
            </div>
            <p :class="`text-xs mt-2 ${textTertiaryClass}`">Make the glass better visible on light backgrounds</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.text-shadow-lg {
  text-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Slider styles - dark mode */
.dark input[type="range"] {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  outline: none;
  -webkit-appearance: none;
  height: 6px;
}

/* Slider styles - light mode */
.light input[type="range"] {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 5px;
  outline: none;
  -webkit-appearance: none;
  height: 6px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

/* Theme transition animation */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
