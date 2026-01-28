import { Component, h } from '@monygroupcorp/microact';

class Card extends Component {
  render() {
    const { title, description } = this.props;

    return h('div', { className: 'card' },
      h('h3', null, title),
      h('p', null, description)
    );
  }
}

export default Card;
