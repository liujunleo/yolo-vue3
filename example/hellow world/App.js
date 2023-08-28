import { h } from '../../lib/yolo-vue3.esm.js'

export const App = {
    render() {
        return h('div', `hello ${this.msg}!`)
    },
    setup() {
        return {
            msg: 'world'
        }
    }
}