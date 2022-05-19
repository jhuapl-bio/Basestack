<template>
    <input type="checkbox" value="" name="" class="
        form-checkbox
        w-[20px] h-[20px] 
        bg-gray-300 text-blue-600 
        border-gray-500 border-2 rounded
        checked:ring-2 checked:ring-blue-200 checked:shadow-transparent
        focus-visible:outline-none
    " 
    
    :class="[disabled ? 'shadow-transparent pointer-events-none' : 'shadow-checkbox']"
    />
</template>