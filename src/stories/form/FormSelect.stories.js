import FormSelect from '../app/renderer/components/ui/forms/FormSelect.vue'

export default {
  title: 'Form/Select',
  component: FormSelect,
  argTypes: {
    value: {
        control: {type: 'text'},
        defaultValue: '',
    },

    placeholder: {
        control: {type: 'text'},
        defaultValue: 'Text goes here…',
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {FormSelect},
  template: `
    <form-select v-bind="$props" :v-model="value" />
    `
});

export const Default = Template.bind({})
Default.args = {
  value: '',
  placeholder: 'Text goes here...'
}