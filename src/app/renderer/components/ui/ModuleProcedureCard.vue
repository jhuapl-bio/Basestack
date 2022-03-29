<template>
    <table class="w-full">
        <th class="table-header-group font-mono text-black markup-h5">
            <td class="text-left">Procedure Title</td>
            <td class="text-left">Created</td>
            <td class="text-left">Last Used</td>
            <td class="text-left">Steps</td>
            <td class="text-left">Status</td>
        </th>

        <tr class="card markup-body-sm">
            <td>
                <div>
                    <div>A</div>
                    <div>
                        <h4>Procedure A</h4>
                        <p>Procedure short description</p>
                    </div>
                </div>
            </td>
            <td>11/21/21</td>
            <td>11/21/21</td>
            <td>7</td>
            <td>Running (63%)</td>
            <td>
                <circle-button icon="ellipsis-v" class="uncontained" />
            </td>
        </tr>
    </table>
    
</template>

<script>
import CircleButton from './buttons/CircleButton.vue'
export default {
    components: {'circle-button': CircleButton},
    props: [],
}
</script>
