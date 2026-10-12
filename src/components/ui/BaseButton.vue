<template>
  <component :is="to ? 'router-link' : 'button'" :to="to" :type="to ? undefined : type" :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 select-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
      'disabled:opacity-50 active:scale-[0.98]',
      sizes[size], variants[variant], block && 'w-full',
    ]">
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
    <slot />
  </component>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  to: { type: [String, Object], default: null },
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
})

const variants = {
  primary: 'bg-brand-gradient text-white shadow-lg shadow-brand-500/25 hover:brightness-110',
  secondary: 'border border-ink-600 bg-ink-700/80 text-ink-100 hover:border-ink-400 hover:bg-ink-700',
  ghost: 'text-ink-300 hover:bg-ink-700/60 hover:text-ink-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-base',
}
</script>
