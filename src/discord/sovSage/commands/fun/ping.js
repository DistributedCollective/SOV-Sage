// TODO: convert all the module.exports to ES6?
module.exports = {
    name: 'ping',
    description: 'Ping!',
    cooldoown: 5,
    execute(message) {
        message.channel.send('Pong.');
    },
};
