import Web3 from 'web3';
const commando = require('discord.js-commando');

module.exports = class ChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'checksum',
			aliases: ['cs'],
			group: 'util',
			memberName: 'checksum',
			description: 'Returns a properly checksummed address.',
			examples: ['checksum 0x12ae66cdc592e10b60f9097a7b0d3c59fce29876'],
			guildOnly: false,

			args: [
				{
					key: 'address',
					label: 'textaddress',
					prompt: 'What address would you like to checksum?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		const address = args.address;
        try {
            const checksummedAddress = Web3.utils.toChecksumAddress(address);
		    return msg.reply(`Proper checksummed address: ${checksummedAddress}`);
          } catch (err) {
              console.error(err);
		    return msg.reply(`Could not checksum: ${address}`);
          }        
	}
};