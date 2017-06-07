// -- TEXT CLASS

class Text {
    constructor(svg, x = 0, y = 0, color, fontFamily = 'Helvetica, sans-serif') {
        const that = this

        // Instance properties
        this.svg = svg
        this.el = svg.parent()
        this.x = x - Text.padding - Text.borderWidth // Correction so it is visually centered
        this.y = y - Text.borderWidth - (Text.fontSize / 2) // Correction so it is visually centered
        this.color = color
        this.textInput = null
        this.padding = Text.padding
        this.fontFamily = fontFamily // Might get replaced in _init if WebFont is present
        this.value = null
        this._textShadowEl = null
        this._resolve = null
        this._reject = null

        // Binders so "this" works in listeners
        this._onInput = (event) => {
            that._inputListener.call(that, event)
        }
        this._onKeydown = (event) => {
            that._keydownListener.call(that, event)
        }
        this._onBlur = (event) => {
            that._blurListener.call(that, event)
        }

        this._init()
    }

    start() {
        this.textInput = document.createElement('input')
        this.textInput.setAttribute('style', 'position: absolute;' +
            `top: ${this.y}px;` +
            `left: ${this.x - (Text.fontSize / 2)}px;` +
            `width: ${Text.fontSize}px;` +
            `padding: ${this.padding}px;` +
            `border: ${Text.borderWidth}px solid ${this.color};` +
            `color: ${this.color};` +
            'background: #FFF;' +
            'text-align: center;' +
            `font-family: ${this.fontFamily};` +
            'font-weight: bold; ' +
            `font-size: ${Text.fontSize}px;` +
            `transition: opacity ${Text.outTime}s;`)
        this.el.appendChild(this.textInput)
        setTimeout(() => {
            this.textInput.focus()
        }, 10)

        this._textShadowEl = document.createElement('span')
        this._textShadowEl.setAttribute('style', 'position: absolute;' +
            'top: -100px;' + // Place out of the screen
            'left: 0;' +
            'white-space: nowrap;' +
            `font-family: ${this.fontFamily};` +
            'font-weight: bold;' +
            `font-size: ${Text.fontSize}px;`)
        this.el.appendChild(this._textShadowEl)

        this.textInput.addEventListener('input', this._onInput)
        this.textInput.addEventListener('keydown', this._onKeydown)
        this.textInput.addEventListener('blur', this._onBlur)

        // TODO: Implement reject
        return new Promise((resolve, reject) => {
            this._resolve = resolve
            this._reject = reject
        })
    }

    stop() {
        this._removeListeners()
        setTimeout(() => {
            this.textInput.blur()
        }, 10)
        if (this.value && this.value.replace(/\s/g, '') !== '') {
            this._resolve(this.value)
        } else {
            this._reject()
            this.destroy()
        }
    }

    resize() {
        const w = this._textShadowEl.clientWidth + (this.padding * 2)
        const x = this.x - (w / 2)
        this.textInput.style.left = `${x}px`
        this.textInput.style.width = `${w}px`
    }

    remove() {
        if (Text.animateOut) {
            this.textInput.style.opacity = 0
            setTimeout(() => {
                this.destroy()
            }, Text.outTime * 1000)
        } else {
            this.destroy()
        }
    }

    destroy() {
        this._removeListeners()
        this.el.removeChild(this.textInput)
        this.el.removeChild(this._textShadowEl)
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
        this.value = this.textInput.value
        this._textShadowEl.innerHTML = this.value.replace(/\s/g, '&nbsp')
        this.resize()
    }

    _keydownListener(event) {
        if (event.keyCode === 13 || event.keyCode === 288) {
            this.stop()
        }
    }

    _blurListener() {
        this.stop()
    }

    _removeListeners() {
        this.textInput.removeEventListener('input', this._onInput)
        this.textInput.removeEventListener('keydown', this._onKeydown)
        this.textInput.removeEventListener('blur', this._onBlur)
    }
}

// Static properties
Text.padding = 5
Text.borderWidth = 2
Text.fontSize = 24
Text.animateOut = true
Text.outTime = 1


// -- ARROW CLASS

class Arrow {
    constructor(svg, x = 0, y = 0, color) {
        const that = this

        // Instance properties
        this.svg = svg
        this.el = svg.parent()
        this.x1 = x
        this.y1 = y
        this.x2 = -1
        this.y2 = -1
        this.color = color
        this.shape = null
        this.text = null
        this._resolve = null
        this._reject = null

        // Binders so "this" works in listeners
        this._onMove = (event) => {
            that._moveListener.call(that, event)
        }
        this._onUp = (event) => {
            that._upListener.call(that, event)
        }

        this._init()
    }

    start() {
        this.shape = this.svg.polygon().fill(this.color)
        this.el.addEventListener('mousemove', this._onMove)

        return new Promise((resolve, reject) => {
            this._resolve = resolve
            this._reject = reject
        })
    }

    stop() {
        this._removeListeners()
        if (this.x2 !== -1 && this.y2 !== -1) {
            this._resolve()
        } else {
            this._reject()
            this.destroy()
        }
    }

    remove() {
        if (this.text) {
            this.text.remove()
            this.text = null
        }
        if (Arrow.animateOut) {
            this.shape.animate(Arrow.outTime * 1000).attr({ 'fill-opacity': 0.1 })
            setTimeout(() => {
                this.destroy()
            }, Arrow.outTime * 1000)
        } else {
            this.destroy()
        }
    }

    destroy() {
        this._removeListeners()
        this.shape.remove()
        if (this.text) {
            this.text.destroy()
            this.text = null
        }
    }

    _init() {
        this.el.addEventListener('mouseup', this._onUp)
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

    _upListener() {
        this.stop()
    }

    _removeListeners() {
        this.el.removeEventListener('mousemove', this._onMove)
    }
}

// Static properties
Arrow.t = 15  // Shaft thickness
Arrow.tl = 8  // Head back tip in x
Arrow.tt = 20 // Head back tip in y
Arrow.tp = 50 // Head length
Arrow.animateOut = true
Arrow.outTime = 0.25


// -- ANOTA CLASS

class Anota {
    constructor(id = `_anota${Anota.n}`, color = Anota.color) {
        const that = this

        const wrapper = document.createElement('div')
        wrapper.id = id
        wrapper.setAttribute('style', 'z-index: 100000; ' +
            'background: rgba(255, 0, 0, 0.2); ' +
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
        this.el = wrapper
        this.svg = SVG(id)
        this.currentSelected = null
        this.currentWorking = null
        this.arrows = []
        this.texts = []

        // Binders so "this" works in listeners
        this._onDown = (event) => {
            that._downListener.call(that, event)
        }

        this._init()
    }

    destroy() {
        this.el.removeEventListener('mousedown', this._onDown)
        this.el.removeEventListener('mouseup', this._onUp)
        // TODO: Destroy shapes, etc
    }

    selectArrow(addText) {
        // TODO: deselect the previous tool
        this.currentSelected = addText ? Anota.tools.ARROW_TEXT : Anota.tools.ARROW
    }

    startArrow(x = 0, y = 0, addText) {
        const arrow = new Arrow(this.svg, x, y, this.color)
        this.currentWorking = arrow

        this._dispatch(Anota.events.start, arrow)

        arrow.start().then(() => {
            this.currentWorking = null
            if (addText) {
                arrow.text = this.startText(x, y, arrow)
                this._dispatch(Anota.events.partial, arrow)
            } else {
                this._dispatch(Anota.events.create, arrow)
            }
        }).catch(() => {
            this.currentWorking = null
            this._dispatch(Anota.events.cancel, arrow)
        })

        // TODO: remove from array when the shape is destroyed
        this.arrows.push(arrow)
        return arrow
    }

    stopArrow() {
        this.arrows[this.arrows.length - 1].stop()
    }

    selectText() {
        // TODO: deselect the previous tool
        this.currentSelected = Anota.tools.TEXT
    }

    startText(x = 0, y = 0, master = null) {
        const text = new Text(this.svg, x, y, this.color)
        this.currentWorking = text

        if (!master) {
            this._dispatch(Anota.events.start, text)
        }

        text.start().then(() => {
            this.currentWorking = null
            this._dispatch(Anota.events.create, master || text)
        }).catch(() => {
            this.currentWorking = null
            if (master) {
                master.text = null
                this._dispatch(Anota.events.create, master)
            } else {
                this._dispatch(Anota.events.cancel, text)
            }
        })

        // TODO: remove from array when the shape is destroyed
        this.texts.push(text)
        return text
    }

    stopText() {
        this.texts[this.texts.length - 1].stop()
    }

    _init() {
        this.el.addEventListener('mousedown', this._onDown)
    }

    _dispatch(eventType, detail) {
        this.el.dispatchEvent(new CustomEvent(eventType, { detail }))
    }

    _downListener(event) {
        if (this.currentWorking === null) {
            if (this.currentSelected === Anota.tools.ARROW) {
                this.startArrow(event.clientX, event.clientY)
            } else if (this.currentSelected === Anota.tools.ARROW_TEXT) {
                this.startArrow(event.clientX, event.clientY, true)
            } else if (this.currentSelected === Anota.tools.TEXT) {
                this.startText(event.clientX, event.clientY)
            }
        }
    }
}

Anota.n = 1
Anota.color = '#9841B5'
Anota.tools = {
    ARROW: 'arrow',
    TEXT: 'text',
    ARROW_TEXT: 'arrowtext',
}
Anota.events = {
    start: 'anotastart',
    create: 'anotacreate',
    cancel: 'anotacancel',
    partial: 'anotapartial',
}


// XXX: Try to achieve this directly on the UMD el, right now it outputs on window.main.Anota
window.Anota = Anota

export default Anota
