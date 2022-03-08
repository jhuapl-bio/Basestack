import WorkStatus from '../app/renderer/components/ui/WorkStatus/WorkStatus.vue'

export default {
  title: 'Work Status',
  component: WorkStatus,
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
  components: {WorkStatus},
  template: `
    <work-status v-bind="$props" />
    `
});

export const Active = Template.bind({})
Active.args = {
    progress: 50
}

export const Complete = Template.bind({})
Complete.args = {
    progress: 100
}

export const Error = Template.bind({})
Error.args = {
    progress: 38,
    error: true
}
