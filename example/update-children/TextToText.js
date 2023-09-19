import { h, ref } from '../../lib/yolo-vue.esm.js'

const nextChildren = 'newChildren'
const prevChildren = 'oldChildren'

export default {
    name: 'ArrayToText',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange

        return {
            isChange
        }
    },
    render() {
        const self = this
        return self.isChange === true
            ? h('div', {}, nextChildren)
            : h('div', {}, prevChildren)
    }
}