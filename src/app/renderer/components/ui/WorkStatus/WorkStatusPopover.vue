<template>
    <label class="flex flex-col w-full p-4 space-y-2">
        <div class="flex justify-between">
            <div class="flex items-center space-x-2">
<<<<<<< HEAD
                <h5 class="text-gray-darkest markup-h5 strong">
                    {{label}}
                </h5>

                <div class="font-display text-gray-darker">
=======
                <h5 class="text-gray-700 markup-h5 strong">
                    {{label}}
                </h5>

                <div class="font-display text-gray-600">
>>>>>>> refactor/update-color-utilities
                    ({{progress}}%)
                </div>
            </div>

            <div>
                <circle-button icon="chevron-right" />
            </div>
        </div>

        <div 
            class="relative w-full h-2 overflow-hidden rounded-full" 
<<<<<<< HEAD
            :class="[error ? 'bg-red/10' : 'bg-gray']"
=======
            :class="[error ? 'bg-red/10' : 'bg-gray-500']"
>>>>>>> refactor/update-color-utilities
        >
            <div
                class="relative top-0 left-0 h-full duration-500"
                :style="{width: progress + '%'}"
                :class="{
<<<<<<< HEAD
                    'bg-blue-extradark animate-pulse': status.value === 'active',
                    'bg-green': status.value === 'complete',
=======
                    'bg-blue-900 animate-pulse': status.value === 'active',
                    'bg-green-100: status.value === 'complete',
>>>>>>> refactor/update-color-utilities
                }"
            />
        </div>
    </label>
</template>