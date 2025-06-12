# Liquid Glass Vue

Apple's Liquid Glass effect for Vue 3.

> **📝 Note:** This Vue implementation is based on the original [liquid-glass-react](https://github.com/rdev/liquid-glass-react) library. All core effects and algorithms have been adapted from the React version to work with Vue 3's Composition API.

|                                Card Example                                |                                Button Example                                |
| :------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| ![](https://github.com/rdev/liquid-glass-react/raw/master/assets/card.png) | ![](https://github.com/rdev/liquid-glass-react/raw/master/assets/button.png) |

## 🎬 Demo

[Click here](https://liquid-glass-vue.netlify.app/) to see it in action!

![project liquid gif](./assets/project-liquid.gif)

## ✨ Features

- Proper edgy bending and refraction
- Multiple refraction modes
- Configurable frosty level
- Supports arbitrary child elements
- Configurable paddings
- Correct hover and click effects
- Edges and highlights take on the underlying light like Apple's does
- Configurable chromatic aberration
- Configurable elasticity, to mimic Apple's "liquid" feel
- Full Vue 3 support with Composition API
- TypeScript support

> **⚠️ NOTE:** Safari and Firefox only partially support the effect (displacement will not be visible)

## 🚀 Usage

### Installation

```bash
npm install @wxperia/liquid-glass-vue
```

### Basic Usage

```vue
<script setup lang="ts">
  import { LiquidGlass } from 'liquid-glass-vue'
</script>

<template>
  <LiquidGlass>
    <div class="p-6">
      <h2>Your content here</h2>
      <p>This will have the liquid glass effect</p>
    </div>
  </LiquidGlass>
</template>
```

### Button Example

```vue
<script setup lang="ts">
  import { LiquidGlass } from '@wxperia/liquid-glass-vue'

  const handleClick = () => {
    console.log('Button clicked!')
  }
</script>

<template>
  <LiquidGlass
    :displacement-scale="64"
    :blur-amount="0.1"
    :saturation="130"
    :aberration-intensity="2"
    :elasticity="0.35"
    :corner-radius="100"
    padding="8px 16px"
    @click="handleClick"
    :effect="mosaicGlass"
    :mode="'shader'"
  >
    <span class="text-white font-medium">Click Me</span>
  </LiquidGlass>
</template>
```

### Mouse Container Example

When you want the glass effect to respond to mouse movement over a larger area (like a parent container), use the `mouseContainer ` prop:

```vue
<script setup lang="ts">
  import { ref } from 'vue'
  import { LiquidGlass } from 'liquid-glass-vue'

  const containerRef = ref<HTMLDivElement>()
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-screen bg-image"
  >
    <LiquidGlass
      :mouse-container="containerRef"
      :elasticity="0.3"
      :style="{ position: 'fixed', top: '50%', left: '50%' }"
    >
      <div class="p-6">
        <h2>Glass responds to mouse anywhere in the container</h2>
      </div>
    </LiquidGlass>
  </div>
</template>
```

## Props

| Prop                  | Type                                               | Default       | Description                                                                                          |
| --------------------- | -------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `displacementScale`   | `number`                                           | `70`          | Controls the intensity of the displacement effect                                                    |
| `blurAmount`          | `number`                                           | `0.0625`      | Controls the blur/frosting level                                                                     |
| `saturation`          | `number`                                           | `140`         | Controls color saturation of the glass effect                                                        |
| `aberrationIntensity` | `number`                                           | `2`           | Controls chromatic aberration intensity                                                              |
| `elasticity`          | `number`                                           | `0.15`        | Controls the "liquid" elastic feel (0 = rigid, higher = more elastic)                                |
| `cornerRadius`        | `number`                                           | `999`         | Border radius in pixels                                                                              |
| `class`               | `string`                                           | `""`          | Additional CSS classes                                                                               |
| `padding`             | `string`                                           | `"24px 32px"` | CSS padding value                                                                                    |
| `style`               | `CSSProperties`                                    | -             | Additional inline styles                                                                             |
| `overLight`           | `boolean`                                          | `false`       | Whether the glass is over a light background                                                         |
| `mouseContainer`      | `Ref<HTMLElement>`                                 | `null`        | Container element to track mouse movement on (defaults to the glass component itself)                |
| `mode`                | `"standard" \| "polar" \| "prominent" \| "shader"` | `"standard"`  | Refraction mode for different visual effects. `shader` is the most accurate but not the most stable. |
| `globalMousePos`      | `{ x: number; y: number }`                         | -             | Global mouse position coordinates for manual control                                                 |
| `mouseOffset`         | `{ x: number; y: number }`                         | -             | Mouse position offset for fine-tuning positioning                                                    |

## Events

| Event    | Type         | Description                                 |
| -------- | ------------ | ------------------------------------------- |
| `@click` | `() => void` | Emitted when the glass component is clicked |

## Development

This Vue implementation maintains the same visual effects and behavior as the original React version while utilizing Vue 3's reactive system and Composition API for optimal performance.

### Credits

- Original React implementation: [liquid-glass-react](https://github.com/rdev/liquid-glass-react) by [rdev](https://github.com/rdev)
- Vue adaptation: Converted to Vue 3 with Composition API
