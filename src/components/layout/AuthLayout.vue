<template>
  <div class="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
    <!-- Hero: a banner on phones, the left half on desktop -->
    <aside class="relative isolate flex min-h-56 flex-col justify-end overflow-hidden p-6 sm:min-h-72 lg:min-h-dvh lg:p-12">
      <img src="/bg.jpg" alt="" class="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/25 lg:bg-gradient-to-r lg:from-ink-950/90 lg:via-ink-950/65 lg:to-ink-950/30" />

      <div class="absolute left-6 top-6 flex items-center gap-2 lg:left-12 lg:top-10">
        <span class="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-lg shadow-lg shadow-brand-500/30">🎸</span>
        <span class="text-lg font-extrabold tracking-tight">Sewa<span class="text-brand-gradient">Studio</span></span>
        <span class="rounded-md border border-ink-600 bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-300">Owner</span>
      </div>

      <div class="max-w-lg animate-fade-up">
        <p class="hidden text-xs font-semibold uppercase tracking-[0.25em] text-brand-400 lg:block">Untuk pemilik studio</p>
        <h1 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Kelola studiomu, <span class="text-brand-gradient">biarkan jadwalnya terisi.</span>
        </h1>
        <p class="mt-4 hidden text-base text-ink-300 sm:block">
          Atur ruangan, alat, harga, dan jam operasional. Pantau sewa dan tarik pendapatan langsung ke rekeningmu.
        </p>
        <ul class="mt-8 hidden gap-6 text-sm text-ink-300 lg:flex">
          <li class="flex items-center gap-2"><span class="text-xl">🗓️</span> Jadwal otomatis</li>
          <li class="flex items-center gap-2"><span class="text-xl">📊</span> Laporan transaksi</li>
          <li class="flex items-center gap-2"><span class="text-xl">🏦</span> Tarik dana</li>
        </ul>
      </div>
    </aside>

    <main class="stage-glow flex items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:py-12">
      <div class="card w-full max-w-md animate-fade-up p-6 sm:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
