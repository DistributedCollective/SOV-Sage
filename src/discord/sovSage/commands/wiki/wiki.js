import axios from 'axios';
const Discord = require('discord.js');
const config = require('config'),
  WIKI_API_KEY = process.env.WIKI_API_KEY;

module.exports = {
  name: 'wiki',
  description:
    'Searches wiki.sovryn.app and returns first result. The optional language parameter defaults to English (en) however if you wanted French you can pass `fr` at the end of your query.',
  args: false,
  usage: '<search term> [language]',
  aliases: ['w'],
  // guildOnly: true,
  cooldown: 1,
  async execute(message, args) {
    // if (message.channel.type === 'text') {
    //   await message.delete();
    // }

    let locale, res;

    if (args.length > 1) {
      locale = args[1];
    } else {
      locale = 'en';
    }

    // always default to trying a path search, then try search by query if no path results returned
    const searchQuery = args[0],
      exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('SOVRYN Wiki')
        .setURL(config.urls.sovrynWiki);

    // res = await searchByPath(searchQuery, locale);
    // if (!res.length)
    res = await searchByQuery(searchQuery, locale);
    // console.log(res);
    // console.log(`locale: ${locale}`);

    if (res.length > 0) {
      res.forEach((element) => {
        if (element['path'].includes(args[0]))
          exampleEmbed.addField(
            element['title'],
            `https://wiki.sovryn.app/${element['locale']}/${element['path']}`
          );
      });
    }

    if (exampleEmbed.fields.length === 0 && res.length > 0) {
      res.forEach((element) => {
        exampleEmbed.addField(
          element['title'],
          `https://wiki.sovryn.app/${element['locale']}/${element['path']}`
        );
      });
    }

    if (exampleEmbed.fields.length === 0) {
      exampleEmbed.setDescription(
        'No results, try another term and remember to "quote phrases"'
      );
    }

    await message.channel.send(exampleEmbed);
    // await message.author.send(exampleEmbed);
  },
};

async function axiosWikiFetch(graphqlQuery) {
  const headers = {
      Authorization: 'Bearer ' + WIKI_API_KEY,
    },
    response = await axios.post(
      config.urls.sovrynWikiGraphqlUrl,
      graphqlQuery,
      headers
    );
  return response.data;
}

async function searchByQuery(searchTerm, locale) {
  const graphqlQuery = {
      query: `
		query {
			pages {
				search(query: "${searchTerm}", locale: "${locale}") {
					results {
						id
						title
						description
						path
						locale
					}
				}
			}
		}
		`,
    },
    res = await axiosWikiFetch(graphqlQuery);
  // console.log(res.data.pages.search);

  return res.data.pages.search.results;
}

// async function searchByPath(pathTerm, locale) {
//   const graphqlQuery = {
//       query: `
//         {
//             pages {
//               search(query:"",path:"${pathTerm}",locale:"${locale}") {
//                 results {
//                   id
//                   title
//                   description
//                   path
//                   locale
//                 }
//               }
//             }
//           }

//         `,
//     },
//     res = await axiosWikiFetch(graphqlQuery);
//   console.log(res);
//   return res.data.pages.search.results;
// }

// async function fetchToc(id) {
//   // TODO: investigate
//   // fetching TOC is currently broken
//   const graphqlQuery = {
//       query: `
// 		query {
// 			pages {
// 				single (id:${id}) {
// 					title
// 					toc
// 				}
// 			}
// 		}
// 		`,
//     },
//     res = await axiosWikiFetch(graphqlQuery);
//   // console.log(chalk.blueBright(`table of contents for ${id}`));
//   console.log(res);
//   return res.data;
// }

/*
 * code below is a semi working example how to wait for user input
 * in this case we can wait for an reaction to a message, given a
 * range of numbers say 1 to 4 to "choose" from. The SO link kinda shows
 * it in a voting senario, not how I'm using it here though
 */
// async function asdf() {
// 	const id = message.member.id; // TODO
// 	// https://stackoverflow.com/a/60799733 the interactive stuff from

// 	const wikiThumbnail = 'https://wiki.sovryn.app/sovryn-logo-wiki.png';

// 	// got some embed ideas from: https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
// 	const exampleEmbed = new Discord.MessageEmbed()
// 		.setColor('#0099ff')
// 		.setTitle('SOVRYN Wiki')
// 		.setURL('https://wiki.sovryn.app/')
// 		.setDescription('Some description here')
// 		.setThumbnail(wikiThumbnail)
// 		.addFields(
// 			{ name: '1: FastBTC1', value: "[FastBTC Info](https://wiki.sovryn.app/ 'optional hovertext')" },
// 			{ name: '2: FastBTC2', value: "[FastBTC Info](https://wiki.sovryn.app/ 'optional hovertext')" },
// 			{ name: '3: FastBTC3', value: "[FastBTC Info](https://wiki.sovryn.app/ 'optional hovertext')" },
// 			// { name: '\u200B', value: '\u200B' },
// 			// { name: 'Inline field title', value: 'Some value here', inline: true },
// 			// { name: 'Inline field title', value: 'Some value here', inline: true },
// 		);
// 	// exampleEmbed.addField('Inline field title', 'Some value here', true);
// 	// .setImage('https://i.imgur.com/wSTFkRM.png')
// 	// .setTimestamp()
// 	// .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
// 	const msg = await message.channel.send(exampleEmbed);
// 	await msg.react('1️⃣');
// 	await msg.react('2️⃣');
// 	await msg.react('3️⃣');

// 	const filter = (reaction, user) => (reaction.emoji.name == '1️⃣' || reaction.emoji.name == '2️⃣' || reaction.emoji.name == '3️⃣' || reaction.emoji.name == '4️⃣');
// 	const collected = await msg.awaitReactions(filter, { max: 1, time: 10000 })
// 		.catch(() => {
// 			msg.edit('No answer after 10 seconds, operation canceled.');
// 			msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
// 			return;
// 		});
// 	if (!collected) return;
// 	if (collected.first().emoji.name == '1️⃣') {
// 		msg.edit("https://wiki.sovryn.app/");
// 		msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
// 		msg.suppressEmbeds(true);
// 		console.log('try');
// 		// const filter2 = m => Number(m.content) >= 1 && Number(m.content) <= 23;
// 		// const collected2 = await msg.channel.awaitMessages(filter2, { max: 1, time: 6000, errors: ['time'] });
// 		// msg.channel.send(collected2.first().content)
// 		// .catch(collectedx => console.log(`After a minute, only ${collectedx.size} out of 4 voted.`));
// 	}
// 	if (collected.first().emoji.name == '2️⃣') {
// 		msg.edit("FastBTC2");
// 		msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
// 		msg.suppressEmbeds(true);
// 	}
// 	if (collected.first().emoji.name == '3️⃣') {
// 		msg.edit("FastBTC3");
// 		msg.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
// 		msg.suppressEmbeds(true);
// 	}
// }
