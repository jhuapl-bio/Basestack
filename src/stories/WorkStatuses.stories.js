import WorkStatuses from '../app/renderer/components/ui/WorkStatus/WorkStatuses.vue'

export default {
    title: 'Sections/Work Statuses',
    component: WorkStatuses,
    argTypes: {
        workStatuses: {
            defaultValue: [
                {progress: 100, label: 'Module', error: false, link: ''},
                {progress: 58, label: 'Consensus', error: true, link: ''},
                {progress: 38, label: 'Procedure', error: false, link: ''}
            ]
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