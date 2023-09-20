import { h, ref } from '../../lib/yolo-vue.esm.js'

const nextChildren = 'newChildren'
const prevChildren = [h('div', {}, 'A'), h('div', {}, 'B')]

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
        return this.isChange === true
            ? h('div', {},  nextChildren)
            : h('div', {},  prevChildren)
    }
}