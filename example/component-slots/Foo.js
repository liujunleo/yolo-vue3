import { h, renderSlots } from "../../lib/yolo-vue.esm.js"

export const Foo = {
    name: 'Foo',
    render() {
        return h(
            'div', { class: 'Foo' }, 
            [
                renderSlots(this.$slots, 'header', {row: { age: 18 }, title: '插槽数据'}), 
                h('p', {}, 'Foo'), 
                renderSlots(this.$slots, 'default'),
                renderSlots(this.$slots, 'footer')
            ]
        )
        // 等同于 template：
        // <div class="Foo">
        //     <slot name="header" :row="{age: 18}" title="插槽数据"></slot>
        //     <p>Foo</p>
        //     <slot></slot>
        //     <slot name="footer"></slot>
        // </div>
    },
    setup() {
    }
}