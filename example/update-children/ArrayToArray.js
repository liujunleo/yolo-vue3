import { h, ref } from '../../lib/yolo-vue.esm.js'

// 1. 左侧对比：获取新老数组从左侧起差异开始下标值
// (a b) c
// (a b) d e
// i: 2、e1: 2、e2: 3
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'), 
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren =  [
//     h('p', { key: 'A' }, 'A'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E')
// ]

// 2. 右侧对比：获取新老数组从右侧起差异开始下标值
// a (b c)
// d e (b c)
// i: 0、e1: 0、e2: 1
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'), 
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C')
// ]
// const nextChildren =  [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'E' }, 'E'),
//     h('p', { key: 'B' }, 'B'),
//     h('p', { key: 'C' }, 'C'),
// ]

// 3. (左侧对比) 新数组比老数组长：添加新数组多出的 vnode
// (a b)
// d c (a b)
// const prevChildren = [
//     h('p', { key: 'A' }, 'A'), 
//     h('p', { key: 'B' }, 'B')
// ]
// const nextChildren =  [
//     h('p', { key: 'D' }, 'D'),
//     h('p', { key: 'C' }, 'C'),
//     h('p', { key: 'A' }, 'A'), 
//     h('p', { key: 'B' }, 'B')
// ]

// 4. (右侧对比) 老数组比新数组长：删除老数组多出的 vnode
// (a b) c
// (a b)
const prevChildren = [
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B')
]
const nextChildren =  [
    h('p', { key: 'A' }, 'A'), 
    h('p', { key: 'B' }, 'B')
]


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
        return this.isChange === true
            ? h('div', {}, nextChildren)
            : h('div', {}, prevChildren)
    }
}