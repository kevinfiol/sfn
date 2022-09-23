import m from 'mithril';
import cls from 'classies';

export const TextInput = () => ({
    view: ({ attrs: { placeholder, value, onInput } }) =>
        m('input', {
            type: 'text',
            placeholder,
            value,
            oninput: ({ target }) => onInput(target.value)
        })
});

export const Spinner = () => {
    let spinner = null;

    return {
        oncreate: ({ dom }) => {
            spinner = SpinnerEl(dom);
            spinner.start();
        },

        onremove: () => {
            if (spinner) spinner.remove();
        },

        view: () => m('div.spinner')
    }
};

export const Card = () => ({
    view: ({ attrs: { profile, onClick, isStaged, showHeader } }) =>
        m('div.card.max-width-3', {
            onclick: profile.visible && onClick,
            className: cls({
                '-staged': isStaged,
                'clickable': onClick,
                'opacity-50': !profile.visible
            })
        },
            showHeader &&
                m('header.overflow-hidden',
                    m('a', { href: profile.profileurl },
                        profile.profileurl
                    )
                )
            ,

            m('div.flex.select-none',
                m('img.mr-2', {
                    style: { width: '40px' },
                    src: profile.avatar
                }),

                m('span', profile.personaname),

                isStaged && 
                    m('span.pl-1', '✓')
                ,
            )
        )
});

function SpinnerEl(element, ms = 100) {
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