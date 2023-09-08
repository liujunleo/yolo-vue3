import { createRenderer } from '../../lib/yolo-vue.esm.js'
import { App } from './App.js'

const game = new PIXI.Application({
    width: 200,
    height: 200
})

document.body.append(game.view)
 

const renderer = createRenderer({
    createElement(type) {
        if(type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff000)
            rect.drawRect(-50, -50, 100, 100)
            rect.endFill()
            return rect
        }
        if(type === 'circle') {
            const circle = new PIXI.Graphics()
            circle.beginFill(0xff0000)
            circle.drawCircle(-50, -50, 25)
            circle.endFill()
            return circle
        }
    },
    patchProp(el, key, val) {
        el[key] = val
    },
    insert(el, parent) {
        parent.addChild(el)
    }
})

renderer.createApp(App).mount(game.stage)