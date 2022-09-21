export function SpinnerEl(element, ms = 100) {
    let el = element;
    let step = 0;
    let timer;

    const steps = {
        0: '|',
        1: '/',
        2: '-',
        3: '\\',
        4: '|',
        5: '/',
        6: '-',
        7: '\\'
    };

    return {
        start() {
            timer = setInterval(() => {
                if (step == 8) step = 0;
                el.innerText = steps[step];
                step += 1;
            }, ms);
        },

        remove() {
            el.innerText = '';
            clearInterval(timer);
        }
    };
}