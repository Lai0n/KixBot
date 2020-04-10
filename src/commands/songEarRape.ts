import { Message, MessageReaction } from 'discord.js';
import { DClient } from '../class/DClient';

function filter(reaction: MessageReaction) {
  return reaction.emoji.name === '👌';
}

module.exports = {
  name: 'ear-rape',
  description:
    'Set volume above 0-200 levels. CAN DAMAGE YOUR EARS, ONLY ON YOUR RESPONSIBILITY!!!!',
  usage: '<0-BIG NUMBER xD>',
  execute(message: Message, args: string[], client: DClient) {
    const queue = client.guildQueues.get(message.guild.id);

    if (queue) {
      if (args.length > 0) {
        const permissions = message.member.voice.channel.permissionsFor(
          message.client.user
        );
        if (!permissions.has('ADD_REACTIONS')) {
          message.channel.send('I need add reactions to messages!');
          return;
        }

        message
          .reply(
            "Setting volume levels above 200 can permamently damage your and your's friends ears. Use it only on your responsibility!"
          )
          .then(async m => {
            await m.react('👌');

            m.awaitReactions(filter, { max: 2, time: 30000, errors: ['time'] })
              .then(() => {
                message.channel.send('You will be ear raped!');
                queue.earRape(parseInt(args[0], 10));
              })
              .catch(() => {
                message.channel.send("You didn't agree to ear raping.");
              });
          });
      } else {
        message.reply(
          'You need to enter an number of value between 0 and BIG NUMBER xD!'
        );
      }
    } else {
      message.reply("Guild queue doesn't exist.");
    }
  }
};
