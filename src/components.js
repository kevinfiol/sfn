import { m } from 'umai';

export const TextInput = ({ placeholder, value, onInput }) => (
  m('input', {
    type: 'text',
    placeholder,
    value: value || '',
    oninput: ({ target }) => onInput(target.value)
  })
);

export const Spinner = () => {
  let el;
  let timer = undefined;
  let step = 0;

  const MS = 100;
  const steps = ['|', '/', '-', '\\', '|', '/', '-', '\\'];
  const len = steps.length;

  const onMount = (node) => {
    el = node;
    timer = setInterval(() => {
      step += 1;
      if (step === len) step = 0;
      node.innerText = steps[step];
    }, MS);

    return () => {
      if (el) el.innerText = '';
      clearInterval(timer);
    };
  };

  return () => (
    m('div.spinner', { dom: onMount })
  );
};

export const UserCard = ({ profile, onClick, isStaged, showHeader }) => (
  m('article.card.-user', {
    onclick: profile.visible && onClick,
    class: {
      '-staged': isStaged,
      'clickable': profile.visible && onClick,
      'opacity-50': !profile.visible
    }
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
        style: "width: 40px;",
        src: profile.avatar
      }),

      m('span', profile.personaname),

      isStaged && 
        m('span.checkmark', '✓')
      ,
    )
  )
);

export const AppCard = ({ key, name, platforms, steam_appid, header_image }) => (
  m('article.card.-app',
    m('div.body', { key },
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
);

export const CheckBox = ({ name, value, checked, onChange }) => (
  m('div.checkbox', { className: checked ? '-selected' : '' },
    m('label', { for: value },
      m('span.name', name),
      m('input', {
        type: 'checkbox',
        id: value,
        value,
        checked,
        onchange: ({ target }) => onChange(target.checked)
      })
    )
  )
);
