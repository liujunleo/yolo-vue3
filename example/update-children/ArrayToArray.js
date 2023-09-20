import { h, ref } from '../../lib/yolo-vue.esm.js'

const nextChildren = [h('div', {}, 'A-new'), h('div', {}, 'B-new')]
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]

export default {
    name: 'ArrayToArray',
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