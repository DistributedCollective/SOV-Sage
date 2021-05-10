/**
 * Main controller
 * Handles init event processing
 */

import SovPriceBot from "./discord/sovPriceBot";
import SovSage from "./discord/sovSage";

class MainCtrl {
    async start(app) {
        SovPriceBot.init();
        SovSage.init();
    }
}

export default new MainCtrl();
