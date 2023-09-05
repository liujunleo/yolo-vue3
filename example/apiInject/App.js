import { h, provide, inject } from '../../lib/yolo-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        provide('base', 'app-base')
        provide('base1', 'app-base1')
    },
    render() {
        return h('div', {}, [h('p', {}, 'App'), h(AppChild, {})])
    }
}
const AppChild = {
    name: 'AppChild',
    setup() {
        provide('base', 'app-base-changed')
        provide('child-base', 'child-base')
        const base = inject('base')

        return {
            base
        }
    },
    render() {
        return h('div', {}, 
            [
                h('p', {}, `AppChlid get base：${this.base}`),
                h(AppChild2, {})
            ]
        )
    }
}

const AppChild2 = {
    name: 'AppChild2',
    setup() {
        const base = inject('base')
        const base1 = inject('base1')
        const childBase = inject('child-base')
        return { base, base1, childBase }
    },
    render() {
        return h('div', {}, 
            [
                h('p', {}, `AppChild2 get base：${this.base}`),
                h('p', {}, `AppChild2 get base1：${this.base1}`),
                h('p', {}, `AppChild2 get childBase：${this.childBase}`)
            ]
        )
    }
}