import { Component, h } from '@monygroupcorp/microact';
import Hero from './Hero.js';
import Card from './Card.js';
import InteractiveDemo from './InteractiveDemo.js';

class App extends Component {
  render() {
    const cardData = [
      {
        id: 'lightweight',
        title: 'Lightweight',
        description: 'Microact is a fraction of the size of other frameworks, making it ideal for performance-critical applications.',
      },
      {
        id: 'easy-to-learn',
        title: 'Easy to Learn',
        description: 'If you know React, you already know Microact. The API is designed to be familiar and intuitive.',
      },
      {
        id: 'component-based',
        title: 'Component-Based',
        description: 'Build encapsulated components that manage their own state, then compose them to make complex UIs.',
      },
    ];

    return h('div', { className: 'app-container' },
      h(Hero),
      h('main', { className: 'main-content' },
        h('div', { className: 'card-container' },
          cardData.map(data => h(Card, { key: data.id, title: data.title, description: data.description }))
        )
      ),
      h('section', { className: 'interactive-section' },
        h('div', { className: 'interactive-section__copy' },
          h('h2', null, 'Event System Demo'),
          h('p', null, 'This interactive card lives inside the App component and relies on Microact\'s lifecycle and event binding.')
        ),
        h(InteractiveDemo)
      ),
      h('footer', { className: 'footer' },
        h('p', null, '2026 Mony Group Corporation - All code is released under the VPL (Viral Public License)')
      )
    );
  }
}

export default App;
