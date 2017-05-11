// -- TEXT CLASS

class Text {
    constructor(svg, x = 0, y = 0, color) {
        console.log('Text', this)

        // Instance properties
        this.svg = svg
        this.wrapper = svg.parent()
        this.x = x
        this.y = y
        this.color = color
        this.textInput = null
        this.textShape = null
    }

    start() {
        this.textShape = this.svg.text('Lorem ipsum dolor sit amet.\nCras sodales auctor.')

        this.textInput = document.createElement('input')
        this.textInput.setAttribute('autofocus', 'autofocus')
        document.body.appendChild(this.textInput)

        this.textInput.addEventListener('input', (event) => {
            console.log('input', event)
            this.textShape.text(event.target.value)
        })
    }

    stop() {
        console.log('Text.stop', this)
    }
}


// -- ARROW CLASS

class Arrow {
    constructor(svg, x = 0, y = 0, color) {
        const that = this

        // Instance properties
        this.svg = svg
        this.wrapper = svg.parent()
        this.x1 = x
        this.y1 = y
        this.x2 = 0
        this.y2 = 0
        this.color = color
        this.shape = null

        // Binders so "this" to work in listeners
        this._onMove = (event) => {
            that._moveListener.call(that, event)
        }
    }

    start() {
        this.shape = this.svg.polygon().fill(this.color)
        this.wrapper.addEventListener('mousemove', this._onMove)
    }

    stop() {
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
        const that = this

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

        // Instance properties
        this.wrapper = wrapper
        this.svg = SVG(id)
        this.currentTool = null
        this.arrows = []
        this.texts = []

        // Binders so "this" to work in listeners
        this._onDown = (event) => {
            that._downListener.call(that, event)
        }
        this._onUp = (event) => {
            that._upListener.call(that, event)
        }

        this._init()
    }

    destroy() {
        this.wrapper.removeEventListener('mousedown', this._onDown)
        this.wrapper.removeEventListener('mouseup', this._onUp)
        // TODO: Destroy shapes, etc
    }

    selectArrow() {
        // TODO: deselect the previous tool
        this.currentTool = Anota.tools.ARROW
    }

    startArrow(x = 0, y = 0) {
        const arrow = new Arrow(this.svg, x, y, Anota.color)
        arrow.start()
        this.arrows.push(arrow)
    }

    stopArrow() {
        this.arrows[this.arrows.length - 1].stop()
    }

    selectText() {
        // TODO: deselect the previous tool
        this.currentTool = Anota.tools.TEXT
    }

    startText(x = 0, y = 0) {
        const text = new Text(this.svg, x, y, Anota.color)
        text.start()
        this.texts.push(text)
    }

    stopText() {
        this.texts[this.texts.length - 1].stop()
    }

    _init() {
        this.wrapper.addEventListener('mousedown', this._onDown)
        this.wrapper.addEventListener('mouseup', this._onUp)
    }

    _downListener(event) {
        if (this.currentTool === Anota.tools.ARROW) {
            this.startArrow(event.clientX, event.clientY)
        } else if (this.currentTool === Anota.tools.TEXT) {
            this.startText(event.clientX, event.clientY)
        }
    }

    _upListener() {
        if (this.currentTool === Anota.tools.ARROW) {
            this.stopArrow()
        }
    }
}

Anota.n = 1
Anota.color = '#9841B5'
Anota.tools = {
    ARROW: 'arrow',
    TEXT: 'text',
}


// TODO: Try to achieve this directly on the UMD wrapper, right now it outputs on window.main.Anota
window.Anota = Anota

export { Anota }
