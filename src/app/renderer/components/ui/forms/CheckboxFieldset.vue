<template>
    <x-fieldset legend="Choose your heroes">
        <label v-for="hero in heroes" :for="hero.value" :key="hero.value" class="flex items-center markup-body-lg space-x-2">
            <checkbox :id="hero.value" :value="hero.value" name="heroes" />
            <span>{{hero.label}}</span>
        </label>
    </x-fieldset>
</template>

<script>
import Fieldset from  './Fieldset.vue'
import Checkbox from './Checkbox.vue'
export default {
    components: {'x-fieldset': Fieldset, 'checkbox': Checkbox},
    data(){
        return {
            legend: 'Choose your heroes',
            heroes: [
                {id: 1, value: 'iron-man', label: 'Iron Man'},
                {id: 2, value: 'captain-america', label: 'Captain America'},
                {id: 3, value: 'thor', label: 'Thor'},
                {id: 4, value: 'scarlet-witch', label: 'Scarlet Witch'},
            ]
        }
    }
}
</script>
