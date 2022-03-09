<template>
    <button class="rounded shadow-lg inline-flex items-center w-[70px] h-[70px] p-1.5 bg-white group">
        <div class="flex items-center justify-center w-full h-full duration-500 rounded bg-pink/25 group-hover:scale-105">
            <slot>
                <span class="uppercase markup-h3 text-pink">
                    {{slotFallback}}
                </span>
            </slot>
        </div>
    </button>
</template>

<script>
export default {
    props: ['moduleName', 'link', 'color'],
    computed: {
        slotFallback: (props) => {
            return props.moduleName.charAt(0)
        }
    }
}
</script>
