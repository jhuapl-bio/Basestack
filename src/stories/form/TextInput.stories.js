import TextInput from '../app/renderer/components/ui/forms/TextInput.vue'

export default {
  title: 'Form/Text Input',
  component: TextInput,
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
  components: {TextInput},
  template: `
    <text-input v-bind="$props" :v-model="value" />
    `
});

export const Default = Template.bind({})
Default.args = {
  value: '',
  placeholder: 'Text goes here...'
}