<template>
    <label class="flex flex-col w-full p-4 space-y-2">
        <div class="flex justify-between">
            <div class="flex items-center space-x-2">
                <h5 class="text-gray-700 markup-h5 strong">
                    {{label}}
                </h5>

                <div class="text-gray-600 font-display">
                    ({{progress}}%)
                </div>
            </div>

            <div>
                <circle-button icon="chevron-right" />
            </div>
        </div>

        <div 
            class="relative w-full h-2 overflow-hidden rounded-full" 
            :class="[error ? 'bg-red/10' : 'bg-gray-500']"
        >
            <div
                class="relative top-0 left-0 h-full duration-500"
                :style="{width: progress + '%'}"
                :class="{
                    'bg-blue-900 animate-pulse': status.value === 'active',
                    'bg-green-100': status.value === 'complete',
                }"
            />
        </div>
    </label>
</template>