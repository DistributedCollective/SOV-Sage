// TODO: finish kick
module.exports = {
    name: 'kick',
    description: 'Sometimes before a hammer, a boot works!',
    args: true,
    usage: '<user>',
    cooldown: 10,
    permissions: 'ADMINISTRATOR',
    execute(message) {
        const taggedUser = message.mentions.users.first();
        message.channel.send(`You wanted to kick: ${taggedUser.username}`);
    },
};
