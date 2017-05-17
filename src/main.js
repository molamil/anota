// -- TEXT CLASS

class Text {
    constructor(svg, x = 0, y = 0, color, fontFamily = 'Helvetica, sans-serif') {
        const that = this

        // Instance properties
        this.svg = svg
        this.wrapper = svg.parent()
        this.x = x
        this.y = y
        this.color = color
        this.textInput = null
        this.textShadowEl = null
        this.padding = 5 // TODO: Make padding configurable
        this.fontFamily = fontFamily // Might get replaced in _init if WebFont is present
        this._resolve = null

        // Binders so "this" to work in listeners
        this._onInput = (event) => {
            that._inputListener.call(that, event)
        }
        this._onKeydown = (event) => {
            that._keydownListener.call(that, event)
        }

        this._init()
    }

    start() {
        this.textInput = document.createElement('input')
        this.textInput.setAttribute('id', 'test1')
        this.textInput.setAttribute('style', 'position: absolute;' +
            `top: ${this.y}px;` +
            `left: ${this.x}px;` +
            'width: 0;' +
            `padding: ${this.padding}px;` +
            `border: 2px solid ${this.color};` +
            `color: ${this.color};` +
            'background: rgba(255, 255, 255, 0.9);' +
            'text-align: center;' +
            `font-family: ${this.fontFamily};` +
            'font-weight: bold; ' +
            'font-size: 24px;')
        this.wrapper.appendChild(this.textInput)
        setTimeout(() => {
            this.textInput.focus()
        }, 100)

        this.textShadowEl = document.createElement('span')
        this.textShadowEl.setAttribute('style', 'position: absolute;' +
            'top: -100px;' + // Place out of the screen
            'left: 0;' +
            'border: 1px solid red;' +
            'white-space: nowrap;' +
            `font-family: ${this.fontFamily};` +
            'font-weight: bold;' +
            'font-size: 24px;')
        this.wrapper.appendChild(this.textShadowEl)

        this.textInput.addEventListener('input', this._onInput)
        this.textInput.addEventListener('keydown', this._onKeydown)

        return new Promise((resolve) => {
            this._resolve = resolve
        })
    }

    stop() {
        this.textInput.removeEventListener('input', this._onInput)
        this.textInput.removeEventListener('keydown', this._onKeydown)
        this._resolve(this.textInput.value)
        setTimeout(() => {
            this.textInput.blur()
        }, 100)
    }

    resize() {
        const w = this.textShadowEl.clientWidth + (this.padding * 2)
        const x = this.x - (w / 2)
        this.textInput.style.left = `${x}px`
        this.textInput.style.width = `${w}px`
    }

    _init() {
        // Use Google's PT Sans Narrow if WebFont is present
        if (typeof WebFont === 'object') {
            WebFont.load({
                google: {
                    families: ['PT Sans Narrow:700'],
                },
            })
            this.fontFamily = '"PT Sans Narrow", sans-serif'
        }
    }

    _inputListener() {
        this.textShadowEl.innerHTML = this.textInput.value.replace(/\s/g, '&nbsp')
        this.resize()
    }

    _keydownListener(event) {
        if (event.keyCode === 13 || event.keyCode === 288) {
            this.stop()
        }
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
    constructor(id = `_anota${Anota.n}`, color = Anota.color) {
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
        this.color = color
        this.wrapper = wrapper
        this.svg = SVG(id)
        this.currentSelected = null
        this.currentWorking = null
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
        this.currentSelected = Anota.tools.ARROW
    }

    startArrow(x = 0, y = 0) {
        const arrow = new Arrow(this.svg, x, y, this.color)
        arrow.start()
        this.arrows.push(arrow)
    }

    stopArrow() {
        this.arrows[this.arrows.length - 1].stop()
    }

    selectText() {
        // TODO: deselect the previous tool
        this.currentSelected = Anota.tools.TEXT
    }

    startText(x = 0, y = 0) {
        const text = new Text(this.svg, x, y, this.color)
        this.currentWorking = text
        console.log('text start')
        text.start().then((value) => {
            console.log('text stop', value)
            this.currentWorking = null
        })
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
        console.log('DOWN?')
        if (this.currentWorking === null) {
            console.log('DOWN', this.currentSelected)
            if (this.currentSelected === Anota.tools.ARROW) {
                this.startArrow(event.clientX, event.clientY)
            } else if (this.currentSelected === Anota.tools.TEXT) {
                this.startText(event.clientX, event.clientY)
            }
        }
    }

    _upListener() {
        if (this.currentSelected === Anota.tools.ARROW) {
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


// XXX: Try to achieve this directly on the UMD wrapper, right now it outputs on window.main.Anota
window.Anota = Anota

export { Anota }
