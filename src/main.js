const anota = {
    hola() {
        return (message) => {
            /* eslint-disable no-undef */
            alert(`Hola ${message}`)
        }
    },
}

anota.hola()('PIZZA!')

// export default { anota }
