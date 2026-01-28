import { Component, h } from '@monygroupcorp/microact';

class InteractiveDemo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      isHighlighted: false,
    };
  }

  handleIncrement() {
    this.setState({ count: this.state.count + 1 });
  }

  resetCount() {
    this.setState({ count: 0, isHighlighted: false });
  }

  toggleHighlight() {
    this.setState({ isHighlighted: !this.state.isHighlighted });
  }

  render() {
    const { count, isHighlighted } = this.state;

    return h('section', { className: `interactive-demo ${isHighlighted ? 'interactive-demo--active' : ''}` },
      h('div', { className: 'demo__copy' },
        h('p', null, "This widget exercises Microact's event system using both method references and inline functions."),
        h('p', null, 'Try clicking the buttons to update state and see the DOM update without a full re-render.')
      ),
      h('div', { className: 'demo__controls' },
        h('p', { className: 'demo__count', 'aria-live': 'polite' },
          'Button clicked ',
          h('strong', null, count),
          ` ${count === 1 ? 'time' : 'times'}`
        ),
        h('div', { className: 'demo__buttons' },
          h('button', {
            className: 'demo__increment',
            onClick: this.bind(this.handleIncrement)
          }, 'Increment'),
          h('button', {
            className: 'demo__toggle',
            onClick: (e) => {
              e.preventDefault();
              this.toggleHighlight();
            }
          }, isHighlighted ? 'Disable' : 'Enable', ' Highlight'),
          h('button', {
            className: 'demo__reset',
            type: 'reset',
            onClick: this.bind(this.resetCount)
          }, 'Reset')
        )
      )
    );
  }
}

export default InteractiveDemo;
