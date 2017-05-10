document.addEventListener('DOMContentLoaded', () => {
    // Arrow structure
    const ap = {
        t: 15,  // Shaft thickness
        tl: 8,  // Head back tip in x
        tt: 20, // Head back tip in y
        tp: 50, // Head length
    }

    // Arrow translation
    const apt = {
        x: 200,
        y: 200,
    }

    function drawArrow(arrow, x, y) {
        const a = (Math.atan2(x - apt.x, -(y - apt.y)) * (180 / Math.PI)) - 90
        const al = Math.hypot(x - apt.x, y - apt.y)
        console.log(x, y, a, al)
        arrow.plot([
            [apt.x, apt.y],
            [apt.x + al, apt.y],
            [apt.x + al + (-ap.tl), apt.y - ap.tt],
            [apt.x + al + ap.tp, apt.y + (ap.t / 2)],
            [apt.x + al + (-ap.tl), apt.y + ap.t + ap.tt],
            [apt.x + al, apt.y + ap.t],
            [apt.x, apt.y + ap.t],
        ])
        arrow.rotate(a, apt.x, apt.y + (ap.t / 2))
    }

    let n = 1

    const wrapper = document.createElement('div')
    wrapper.id = `_anota${n}`
    wrapper.setAttribute('style', 'z-index: 100000; ' +
        'position: absolute; ' +
        'top: 0; ' +
        'left: 0; ' +
        'width: 100%; ' +
        'height: 100%; ')
    n += 1
    document.body.appendChild(wrapper)

    const draw = SVG(wrapper.id)
    const arrow = draw.polygon().fill('#9841B5')

    wrapper.addEventListener('mousemove', (event) => {
        drawArrow(arrow, event.clientX, event.clientY)
    })
})

// export default { anota }
