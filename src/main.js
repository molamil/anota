document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed')

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
    draw.rect(100, 100)
})

// export default { anota }
