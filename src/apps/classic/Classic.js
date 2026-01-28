import { Component, h } from '@monygroupcorp/microact';
import { Howl } from 'howler';
import { CLASSIC_ASSETS } from '../../config.js';

/**
 * Classic — MiladyStation Classic info page.
 * Ported from miladystationlite/classic.html.
 */
class Classic extends Component {
  didMount() {
    if (this.props.soundEnabled) {
      this._music = new Howl({
        src: [`${CLASSIC_ASSETS}/jungle.mp3`],
        html5: true,
        loop: true
      });
      this._music.play();
      this.registerCleanup(() => {
        this._music.stop();
        this._music.unload();
      });
    }
  }

  render() {
    const { onBack } = this.props;
    const A = CLASSIC_ASSETS;

    return h('div', { className: 'classic-page' },
      h('button', { className: 'classic-back', onClick: onBack }, 'BACK'),
      h('img', { id: 'banner', alt: 'collection of miladystation player characters', src: `${A}/banner2.png`, width: '100%' }),

      h('div', { className: 'm_box' },
        h('div', { className: 'm_box_bar' },
          h('h2', null, 'Welcome to MiladyStation Player Character Creator! \u2014 \u306F\u308B\u30FB\u306A\u3064\u30FB\u3042\u304D\u30FB\u3075\u3086')
        ),
        h('p', null, 'MiladyStation is a retro game console with an obscure discography containing a collection of 1,212 lovepilled AI generated player characters with inspiration from Milady, Cigawrettes, Pixelady, and Ghiblady.'),
        h('h4', { className: 'center' }, 'More from Mony Group'),
        h('p', { className: 'center' }, h('a', { href: 'https://miladycola.net', target: '_blank' }, 'MiladyCola')),
        h('p', { className: 'center' }, h('a', { href: 'https://mony-group-lending.bancof.io/public-dashboard', target: '_blank' }, 'Mony Group Lending')),
        h('p', { className: 'center' }, h('a', { href: 'https://opensea.io/collection/cigstation', target: '_blank' }, 'CigStation')),
        h('p', { className: 'center' }, h('a', { href: 'https://miladystation.net/rejects' }, 'MissingNo.'))
      ),

      h('div', { className: 'mint-box' },
        h('div', { className: 'box_bar' },
          h('h2', null, 'Milady Station Player Character Selection')
        ),
        h('div', { className: 'box' },
          h('h2', null, 'Minted out on Friday January 20th, 2023 at 3:00 AM UTC'),
          h('p', null, 'If you want to play, select your character on a secondary exchange \u0295\u1D54\u1D25\u1D54\u0294'),
          h('a', { href: 'https://nftx.io/vault/0x855882cc65ba66cdbc7a8c512143f10169891307/buy/' }, 'NFTX'),
          h('br'),
          h('a', { href: 'https://opensea.io/collection/miladystation' }, 'OpenSea'),
          h('br'),
          h('p', null, 'Blur.io points to the deprecated contract')
        )
      ),

      h('div', { className: 'm_box' },
        h('div', { className: 'm_box_bar' }, 'Attributes'),
        h('p', null, 'MiladyStation sources the original Milady Attributes as well as an additional \u201CPower Level\u201D attribute that comes in 3 grades:'),
        h('div', { className: 'gallery_container' },
          h('div', { className: 'gallery_item' },
            h('img', { alt: 'hyper', src: `${A}/hyper.png`, height: '170', width: '170' }),
            h('div', { className: 'desc' }, 'Hyper')
          ),
          h('div', { className: 'gallery_item' },
            h('img', { alt: 'mega', src: `${A}/mega.png`, height: '170', width: '170' }),
            h('div', { className: 'desc' }, 'Mega')
          ),
          h('div', { className: 'gallery_item' },
            h('img', { alt: 'giga', src: `${A}/giga2.png`, height: '170', width: '170' }),
            h('div', { className: 'desc' }, 'Giga')
          )
        ),
        h('p', null, 'MiladyStation Player Characters are Milady that PVP on the wired. Only Milady with powerful anima are able to fully manifest in VR, which is why hyper is the starting power level. A milady that is particularly suited to having fun online is operating on the Mega. Finally, a milady that is too powerful to be contained in higher dimensions are Giga.')
      ),

      h('div', { className: 'box' },
        h('p', { className: 'center' }, 'Milady has no limits.')
      ),

      h('div', { className: 'box' },
        h('div', { className: 'center' },
          h('a', { href: 'https://opensea.io/collection/miladystation' },
            h('img', { id: 'logo', src: `${A}/newlogo.png`, alt: 'miladystation' })
          )
        )
      ),

      h('div', { className: 'box' },
        h('p', { className: 'center' }, '\u79C1\u306F\u304B\u308F\u3044\u3044\u3067\u3059\u79C1\u306F\u30D1\u30F3\u30AF\u30ED\u30C3\u30AF\u3067\u3059\uFF01')
      ),

      h('div', { className: 'm_box_red' },
        h('div', { className: 'm_box_bar' },
          h('h2', null, 'About MiladyStation Player Character Maker \u2014 \u306F\u308B\u30FB\u306A\u3064\u30FB\u3042\u304D\u30FB\u3075\u3086')
        ),
        h('div', { className: 'center' },
          h('p', { className: 'center' },
            h('a', { href: 'https://discord.gg/gjhaBxxGUH' }, 'MiladyStation Community Discord'),
            ' | ',
            h('a', { href: 'https://twitter.com/MiladyStation', target: '_blank' }, 'MiladyStation Player Character Maker Official Twitter'),
            ' | ',
            h('a', { href: 'https://etherscan.io/address/0xB24BaB1732D34cAD0A7C7035C3539aEC553bF3a0#code', target: '_blank' }, 'Verified Contract')
          ),
          h('hr'),
          h('p', null, 'All MiladyStation Player Character Maker branding, assets and NFTs are copylefted under the ', h('a', { href: 'https://viralpubliclicense.org' }, 'Viral Public License'), '.'),
          h('hr'),
          h('p', null, h('b', null, 'MiladyStation loves you.')),
          h('hr'),
          h('p', null, 'MiladyStation was made using stable diffusion artificial-intelligence image generation. We generated an image for every milady in the collection and were mostly horrified by the results. Every MiladyStation creation has been thoroughly vetted for evil so all that remain are the miracles.')
        )
      ),

      h('div', { className: 'box' },
        h('div', { className: 'box_bar' },
          h('h2', null, 'CigStation PowerPacks Vendor')
        ),
        h('h2', { className: 'center' }, 'Minted out on Friday the 10th of February, 2023 at 6:00PM UTC'),
        h('p', { className: 'center' },
          h('img', { alt: 'a cigawrette that has been uploaded to the n64', src: `${A}/cigstation.png`, width: '512', height: '512' })
        ),
        h('p', { className: 'center' },
          h('a', { href: 'https://opensea.io/collection/cigstation', target: '_blank' }, 'Check secondary marketplace')
        )
      ),

      h('div', { className: 'm_box_red' },
        h('div', { className: 'm_box_bar' },
          h('h2', null, 'About CigStation Power Packs \u2014 \u306F\u308B\u30FB\u306A\u3064\u30FB\u3042\u304D\u30FB\u3075\u3086')
        ),
        h('div', { className: 'center' },
          h('p', { className: 'center' },
            '| ',
            h('a', { href: 'https://twitter.com/MiladyStation', target: '_blank' }, 'MiladyStation Player Character Maker Official Twitter'),
            ' | ',
            h('a', { href: 'https://etherscan.io/address/0x2739144641160c170DA047Db1f7b52712081424c#code', target: '_blank' }, 'Verified Contract')
          ),
          h('hr'),
          h('p', null, 'All CigStation Player Character Maker branding, assets and NFTs are copylefted under the ', h('a', { href: 'https://viralpubliclicense.org' }, 'Viral Public License'), '.'),
          h('p', null, 'CigStation was made using stable diffusion artificial-intelligence image generation. They have a hard time spelling but they mean well. Smoke them if you got em.')
        )
      )
    );
  }
}

export default Classic;
