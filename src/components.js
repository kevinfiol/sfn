import m from 'mithril';
import cls from 'classies';
import { SpinnerEl } from './util';

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
            title: !profile.visible ? 'This profile is private.' : undefined,
            onclick: profile.visible && onClick,
            className: cls({
                '-staged': isStaged,
                'clickable': profile.visible && onClick,
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
