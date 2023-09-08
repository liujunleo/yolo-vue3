import { h } from '../../lib/yolo-vue.esm.js'

export const App = {
    name: 'App',
    setup() {
        return {
            x: 100,
            y: 100,
        }
    },
    render() {
        return h('rect',{x: this.x, y: this.y}, [
            h('circle',{x: 50, y: 50})
        ])
    }
}