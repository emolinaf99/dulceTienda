
<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
</script>

<template>
    <RouterLink to="/" class="bannerBlock">
        <img src="/img/imgBanner.png" alt="">
    </RouterLink>
</template>