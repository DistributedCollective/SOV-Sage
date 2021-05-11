/**
 * Main controller
 * Handles init event processing
 */

import SovPriceBot from './discord/sovPriceBot/sovPriceBot';
import SovSage from './discord/sovSage/sovSage';

class MainCtrl {
    async start() {
        SovPriceBot.init();
        SovSage.init();
    }
}

export default new MainCtrl();
