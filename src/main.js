/**
 * Main controller
 * Handles init event processing
 */

import SovPriceBot from './discord/sovPriceBot/sovPriceBot';
import SovSageCommando from './discord/sovSageCommando/sovSageCommando';
// import SovSage from './discord/sovSage/sovSage';

class MainCtrl {
  async start() {
    SovPriceBot.init();
    // SovSage.init();
    SovSageCommando.init();
  }
}

export default new MainCtrl();
