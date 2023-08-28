import { h } from '../../lib/yolo-vue.esm.js'

export const App = {
    render() {
        return h(
            'div', 
            {
                id: 'test'
            },
            // `hello ${this.msg}!`
            //`hello world!`
            [
                h('p', {class: 'red'}, '红色'),
                h('p', {class: 'green'}, '绿色')
            ]
        )
    },
    setup() {
        return {
            msg: 'world'
        }
    }
}