<template>
    <!-- Overlay -->
    <div
        class="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 transition-opacity duration-300">

        <!-- Modal Box -->
        <div
            class="bg-white/80 p-8 rounded-2xl shadow-lg w-full max-w-md text-center m-4 transform transition-all duration-300 translate-y-10 opacity-0 animate-slideUp backdrop-blur-md">
            <div class="flex flex-col items-center justify-center space-y-4">

                <!-- Icon / Image -->
                <img src="/success_submission.jpg" alt="Success"
                    class="w-24 h-24 rounded-full shadow-md" />

                <!-- Title -->
                <h2 class="text-xl font-semibold text-gray-800">
                    Pembuatan Studio Nomor Berhasil!
                </h2>

                <!-- Button -->
                <button @click="goHome"
                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                    Tutup
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    studio_uuid: {
        type: String,
        required: true
    }
})
const goHome = () => {
    window.location.href = `/home/${props.studio_uuid}`;
}
</script>

<style scoped>
@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-slideUp {
    animation: slideUp 0.4s ease-out forwards;
}
</style>
