// TODO: finish kick
module.exports = {
	name: 'kick',
	description: 'Sometimes before a hammer, a boot works!',
    args: true, // Requires arguments?
    usage: '<user>', // tells user how to use
	cooldown: 10,
    permissions: 'ADMINISTRATOR', // do you have permission?
	execute(message, args) {
		const taggedUser = message.mentions.users.first();
		message.channel.send(`You wanted to kick: ${taggedUser.username}`);
	},
};