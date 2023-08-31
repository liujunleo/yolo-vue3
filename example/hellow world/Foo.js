import { h } from "../../lib/yolo-vue.esm.js"

export const Foo = {
    name: 'Foo',
    render() {
       return h('div', {}, `count is : ${this.count}`)
    },
    setup(props) {
        console.log(`setup props: ${props.count}`)
        props.count++ // warning
    }
}