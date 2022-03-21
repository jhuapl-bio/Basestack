import WorkStatusesPopover from '../app/renderer/components/ui/WorkStatus/WorkStatusesPopover.vue'

export default {
    title: 'Nav/Work Statuses Popover',
    component: WorkStatusesPopover,
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
  components: {WorkStatusesPopover},
  template: `
    <work-statuses-popover v-bind="$props" />
    `
});

export const Default = Template.bind({})
Default.args = {
    progress: 50
}