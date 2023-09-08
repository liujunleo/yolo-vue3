import { h, ref } from '../../lib/yolo-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        let count = ref(0)
        const countClick = () => {
            count.value++
            console.log(count.value)
        }
        return {
            count,
            countClick
        }
    },
    render() {
        return h(
            'div', {},
            [
                h('p', {}, `count: ${this.count}`),
                h('button', { onClick: this.countClick }, 'count++')
            ]
        )
    }
}