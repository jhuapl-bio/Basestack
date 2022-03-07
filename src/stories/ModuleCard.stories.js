import ModuleCard from '../app/renderer/components/ui/ModuleCard.vue'

export default {
  title: 'Cards/Module Card',
  component: ModuleCard,
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
  components: {ModuleCard},
  template: `
    <module-card v-bind="$props" />
    `
});

export const Default = Template.bind({})
Default.args = {
  value: '',
  placeholder: 'Text goes here...'
}