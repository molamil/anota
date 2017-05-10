document.addEventListener('DOMContentLoaded', () => {
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

    const arrow = draw.group()

    // Arrow structure
    const ap = {
        l: 200, // Shaft length
        t: 15,  // Shaft thickness
        tl: 8,  // Head back tip in x
        tt: 20, // Head back tip in y
        tp: 50, // Head length
    }

    // Arrow translation
    const apt = {
        x: 0,
        y: 100,
    }

    arrow.polygon(`
        ${apt.x},${apt.y} 
        ${apt.x + ap.l},${apt.y} 
        ${apt.x + ap.l + (-ap.tl)},${apt.y - ap.tt} 
        ${apt.x + ap.l + ap.tp},${apt.y + (ap.t / 2)} 
        ${apt.x + ap.l + (-ap.tl)},${apt.y + ap.t + ap.tt} 
        ${apt.x + ap.l},${apt.y + ap.t} 
        ${apt.x},${apt.y + ap.t}
    `).fill('#9841B5')
})

// export default { anota }
