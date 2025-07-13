
<script setup>
    import { onMounted } from 'vue';

    onMounted(() => {

        // cargamos el script de instagram y lo agregamos al body
        const script = document.createElement('script');
        script.src = 'https://static.elfsight.com/platform/platform.js';
        script.defer = true;
        script.setAttribute('data-use-service-core', '');

        document.body.appendChild(script);
    });

</script>

<template>
    
    <div class="elfsight-app-e05a66d8-d2c8-4ada-95e5-ed580f96a85c" data-elfsight-app-lazy></div>
    
</template>