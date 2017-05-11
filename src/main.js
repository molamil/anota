const conf = {
    color: '#9841B5',
}

// -- ARROW CLASS

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

        // Binders so "this" to work in listeners
        this._onMove = (event) => {
            that._moveListener.call(that, event)
        }
        this._onDown = (event) => {
            that._downListener.call(that, event)
        }
        this._onUp = (event) => {
            that._upListener.call(that, event)
        }
    }

    enable() {
        this.enabled = true
        this.wrapper.addEventListener('mousedown', this._onDown)
        this.wrapper.addEventListener('mouseup', this._onUp)
    }

    disable() {
        this.enabled = false
        this.stopDraw()
        this.wrapper.removeEventListener('mousedown', this._onDown)
        this.wrapper.removeEventListener('mouseup', this._onUp)
    }

    startDraw() {
        this.shape = this.svg.polygon().fill(conf.color)
        this.wrapper.addEventListener('mousemove', this._onMove)
    }

    stopDraw() {
        this.wrapper.removeEventListener('mousemove', this._onMove)
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
            [x1 + al + (-Arrow.tl), y1 - Arrow.tt],
            [x1 + al + Arrow.tp, y1 + (Arrow.t / 2)],
            [x1 + al + (-Arrow.tl), y1 + Arrow.t + Arrow.tt],
            [x1 + al, y1 + Arrow.t],
            [x1, y1 + Arrow.t],
        ])
        this.shape.rotate(a, x1, y1 + (Arrow.t / 2))
    }

    _downListener(event) {
        this.x1 = event.clientX
        this.y1 = event.clientY
        this.startDraw()
    }

    _upListener() {
        this.stopDraw()
    }

    _moveListener(event) {
        this.x2 = event.clientX
        this.y2 = event.clientY
        this._doDraw()
    }
}

// Static properties
Arrow.t = 15  // Shaft thickness
Arrow.tl = 8  // Head back tip in x
Arrow.tt = 20 // Head back tip in y
Arrow.tp = 50 // Head length


// -- ANOTA CLASS

class Anota {
    constructor(id = `_anota${Anota.n}`) {
        console.log('Anota')

        const wrapper = document.createElement('div')
        wrapper.id = id
        wrapper.setAttribute('style', 'z-index: 100000; ' +
            'position: absolute; ' +
            'overflow: hidden; ' +
            'top: 0; ' +
            'left: 0; ' +
            'width: 100%; ' +
            'height: 100%; ')
        // TODO: Consider checking whether document.body is not undefined and wait for DOM loaded
        document.body.appendChild(wrapper)
        Anota.n += 1

        this.wrapper = wrapper
        this.svg = SVG(id)
        this.currentTool = null
        this.arrows = []
    }

    selectArrow() {
        console.log(this)
    }

    drawArrow() {
        const arrow = new Arrow(this.svg)
        arrow.enable()
        this.arrows.push(arrow)
    }
}

Anota.n = 1


// TODO: Try to achieve this directly on the UMD wrapper, right now it outputs on window.main.Anota
window.Anota = Anota

export { Anota }
