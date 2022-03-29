import WorkStatuses from '../../app/renderer/components/ui/nav/WorkStatuses.vue'

export default {
  title: 'Nav/Work Status Widget',
  component: WorkStatuses,
  argTypes: {
    label: {
        control: {type: 'text'},
        defaultValue: 'Module',
    },
    progress: {
        control: {type: 'range'},
        defaultValue: 75,
        min: 0,
        max: 100,
        step: 1,
    },
    error: {
        control: {type: 'boolean'},
        defaultValue: false,
    },
    link: {
        control: {type: 'text'},
        defaultValue: 'Module',
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: {WorkStatuses},
  template: `
    <work-statuses v-bind="$props" />
    `
});

export const Default = Template.bind({})
Default.args = {
    progress: 50
}