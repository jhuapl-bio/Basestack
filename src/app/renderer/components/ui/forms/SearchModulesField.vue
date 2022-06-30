<template>
    <form action="">
        <label for="search-modules" class="relative flex items-center w-full py-2 pl-12 pr-3 bg-gray-100 border-2 border-gray-400 rounded-md">
            <span hidden>Search Modules</span>
            <font-awesome-icon :icon="['fas', 'search']" class="absolute left-0 inline-block ml-4 text-lg text-blue-900" />
            <input name="search-modules" placeholder="Search Modules" class="text-gray-700 bg-none placeholder:text-gray-600 focus:outline-none" />
        </label>
    </form>
</template>