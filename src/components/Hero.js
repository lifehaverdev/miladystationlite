import { Component, h } from '@monygroupcorp/microact';

class Hero extends Component {
  render() {
    return h('section', { className: 'hero' },
      h('h1', null, 'Microact'),
      h('p', null, 'A lean, minimal React-like framework for client-side applications.'),
      h('a', { href: 'https://github.com/Monygroup/microact', className: 'button' }, 'Learn More')
    );
  }
}

export default Hero;
