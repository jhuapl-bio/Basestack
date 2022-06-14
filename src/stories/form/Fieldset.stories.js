import Fieldset from "@/components/ui/forms/Fieldset.vue";
import Checkbox from "@/components/ui/forms/Checkbox.vue";
import Radio from "@/components/ui/forms/Radio.vue";

export default {
  title: "Form/Fieldset",
  component: Fieldset,
  subcomponents: { Checkbox, Radio },
  argTypes: {
        legend: {
            type: 'text',
            defaultValue: 'Legend'
        },
        options: {
            type: 'object',
            defaultValue: [
                {id: 1, value: 'iron-man', label: 'Iron Man'},
                {id: 2, value: 'captain-america', label: 'Captain America'},
                {id: 3, value: 'thor', label: 'Thor'},
                {id: 4, value: 'scarlet-witch', label: 'Scarlet Witch'},
            ]
        }
  },
};

export const CheckboxFieldset = (args, { argTypes }) => {
  return {
    props: Object.keys(argTypes),
    components: { 'x-fieldset': Fieldset, 'x-checkbox': Checkbox },
    template: `
            <x-fieldset :legend="$props.legend">
                <template v-slot>
                    <label v-for="option in $props.options" :for="option.value" :key="option.value" class="flex items-center markup-body-lg space-x-2">
                        <x-checkbox :id="options.value" :value="options.value" name="$props.options"></x-checkbox>
                        <span>{{option.label}}</span>
                    </label>
                </template>
            </x-fieldset>
            `,
  };
};

export const RadioFieldset = (args, { argTypes }) => {
    return {
      props: Object.keys(argTypes),
      components: { 'x-fieldset': Fieldset, 'x-radio': Radio },
      template: `
            <x-fieldset :legend="$props.legend">
                <template v-slot>
                    <label v-for="option in $props.options" :for="option.value" :key="option.value" class="flex items-center markup-body-lg space-x-2">
                        <x-radio :id="options.value" :value="options.value" name="$props.options"></x-radio>
                        <span>{{option.label}}</span>
                    </label>
                </template>
            </x-fieldset>
        `,
    };
  };

