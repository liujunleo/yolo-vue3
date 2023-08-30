import { h } from '../../lib/yolo-vue.esm.js'

export const App = {
    render() {
    window.self = this
    return h(
            'div', 
            {
                id: 'test'
            },
            // `Hello ${this.msg}!`
            //`hello world!`
            [
                h('p', {class: 'red'}, '红色'),
                h('p', {class: 'green'}, '绿色')
            ]
        )
    },
    setup() {
        return {
            msg: 'World'
        }
    }
}