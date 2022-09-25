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
    let timer = undefined;
    let step = 0;

    const MS = 100;
    const steps = ['|', '/', '-', '\\', '|', '/', '-', '\\'];
    const len = steps.length;

    return {
        oncreate: ({ dom }) => {
            timer = setInterval(() => {
                step += 1;
                if (step === len) step = 0;
                dom.innerText = steps[step];
            }, MS);
        },

        onremove: ({ dom }) => {
            dom.innerText = '';
            clearInterval(timer);
        },

        view: () => m('div.spinner')
    }
};

export const UserCard = () => ({
    view: ({ attrs: { profile, onClick, isStaged, showHeader } }) =>
        m('article.card.-user', {
            onclick: profile.visible && onClick,
            className: cls({
                '-staged': isStaged,
                'clickable': onClick,
                'opacity-50': !profile.visible
            })
        },
            showHeader &&
                m('header',
                    m('a', { href: profile.profileurl },
                        profile.profileurl
                    )
                )
            ,

            m('div.body',
                m('img', {
                    style: { width: '40px' },
                    src: profile.avatar
                }),

                m('span', profile.personaname),

                isStaged && 
                    m('span.checkmark', '✓')
                ,
            )
        )
});

export const AppCard = () => ({
    view: ({ attrs: { name, platforms, steam_appid, header_image } }) =>
        m('article.card.-app',
            m('div.body',
                m('a.-neutral', {
                    href: `https://store.steampowered.com/app/${steam_appid}`
                },
                    m('img.border', {
                        loading: 'lazy',
                        src: header_image
                    })
                ),

                m('span', name),

                m('small.block',
                    // makes a string like `windows / linux / mac`
                    Object.entries(platforms).reduce((str, platform) => {
                        if (platform[1]) str += str ? ' / ' + platform[0] : platform[0];
                        return str;
                    }, '')
                )
            )
        )
});

export const CheckBox = () => ({
    view: ({ attrs: { name, value, checked, onChange } }) =>
        m('div.checkbox', { className: checked ? '-selected' : '' },
            m('label', { for: name },
                m('span.name', name),
                m('input', {
                    type: 'checkbox',
                    id: name,
                    value,
                    checked,
                    onchange: ({ target }) => onChange(target.checked)
                })
            )
        )
});
