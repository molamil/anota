const conf = {
    color: '#9841B5',
}

// -- ARROW CLASS

// Arrow structure
const arrowConf = {
    t: 15,  // Shaft thickness
    tl: 8,  // Head back tip in x
    tt: 20, // Head back tip in y
    tp: 50, // Head length
}

class Arrow {
    constructor(svg, x = 0, y = 0) {
        console.log('Arrow')
        const that = this

        this.svg = svg
        this.wrapper = svg.parent()
        this.x1 = x
        this.y1 = y
        this.x2 = 0
        this.y2 = 0
        this.enabled = false
        this.shape = null

        // Binders for "this" to work in listeners
        this._onMove = (event) => {
            that._moveListener.call(that, event)
        }
    }

    enable() {
        this.enabled = true
        this.wrapper.addEventListener('mousedown', this._downListener)
        this.wrapper.addEventListener('mouseup', this._upListener)
    }

    disable() {
        this.enabled = false
        this.wrapper.removeEventListener('mousedown', this._downListener)
        this.wrapper.removeEventListener('mouseup', this._upListener)
        this.wrapper.removeEventListener('mousemove', this._onMove)
    }

    draw() {
        this.shape = this.svg.polygon().fill(conf.color)
        this.wrapper.addEventListener('mousemove', this._onMove)
    }

    _doDraw() {
        const x1 = this.x1
        const y1 = this.y1
        const x2 = this.x2
        const y2 = this.y2
        const a = (Math.atan2(x2 - x1, -(y2 - y1)) * (180 / Math.PI)) - 90
        const al = Math.hypot(x2 - x1, y2 - y1)

        this.shape.plot([
            [x1, y1],
            [x1 + al, y1],
            [x1 + al + (-arrowConf.tl), y1 - arrowConf.tt],
            [x1 + al + arrowConf.tp, y1 + (arrowConf.t / 2)],
            [x1 + al + (-arrowConf.tl), y1 + arrowConf.t + arrowConf.tt],
            [x1 + al, y1 + arrowConf.t],
            [x1, y1 + arrowConf.t],
        ])
        console.log('a', a)
        this.shape.rotate(a, x1, y1 + (arrowConf.t / 2))
    }

    _downListener(event) {
        this.x1 = event.clientX
        this.y1 = event.clientY
        this.draw()
    }

    _upListener(event) {
        this.x1 = event.clientX
        this.y1 = event.clientY
        this.draw()
    }

    _moveListener(event) {
        this.x2 = event.clientX
        this.y2 = event.clientY
        this._doDraw()
    }
}


// -- ANOTA CLASS

const anotaConf = {
    n: 1,
}

class Anota {
    constructor(id = `_anota${anotaConf.n}`) {
        console.log('Anota')

        const wrapper = document.createElement('div')
        wrapper.id = id
        wrapper.setAttribute('style', 'z-index: 100000; ' +
            'position: absolute; ' +
            'top: 0; ' +
            'left: 0; ' +
            'width: 100%; ' +
            'height: 100%; ')
        // TODO: Consider checking whether document.body is not undefined and wait for DOM loaded
        document.body.appendChild(wrapper)
        anotaConf.n += 1

        this.wrapper = wrapper
        this.svg = SVG(id)
        this.arrows = []
    }

    drawArrow() {
        const arrow = new Arrow(this.svg)
        arrow.draw()
        this.arrows.push(arrow)
    }
}

// TODO: Try to achieve this directly on the UMD wrapper, right now it outputs on window.main.Anota
window.Anota = Anota

export { Anota }
