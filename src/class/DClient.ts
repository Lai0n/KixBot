import { Client, Message, Collection, Snowflake } from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { LibraryData, Command } from '../types';
import { log } from '../helpers';
import { GuildQueue } from './GuildQueue';

export class DClient extends Client {
  public commands: Collection<string, Command>;
  public guildQueues: Map<Snowflake, GuildQueue>;
  public data: LibraryData;

  constructor() {
    super();

    this.commands = new Collection<string, Command>();
    this.guildQueues = new Map<Snowflake, GuildQueue>();
    this.data = {
      quotesPath: path.join(__dirname, '..', '..', '..', 'data', 'quotes'),
      songsPath: path.join(__dirname, '..', '..', '..', 'data', 'songs'),

      quotesList: [],
      songsList: []
    };

    // Update commands
    const commandFiles = fs
      .readdirSync(path.join(__dirname, '..', 'commands'))
      .filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);

      // set a new item in the Collection
      // with the key as the command name and the value as the exported module
      this.commands.set(command.name, command);
    }
  }

  public commandProcessor(message: Message): void {
    // check for configured prefix and if author of the message is not this bot
    if (
      message.content.startsWith(process.env.BOT_PREFIX) &&
      !message.author.bot
    ) {
      const args = message.content
        .slice(process.env.BOT_PREFIX.length)
        .split(/ +/);

      if (args.length === 1) {
        try {
          this.commands.get('help').execute(message, [], this);
        } catch (error) {
          log.error(error);
          message.reply(
            'Oh no! I cannot execute that command for an unknow reason!'
          );
          return;
        }
      } else {
        args.shift(); // for some fucking reason is there an empty string as first element
        let command = args.shift();
        command = command.toLowerCase();

        if (!this.commands.has(command)) {
          message.reply('That command is nonexistent, use help please.');
          return;
        }
        try {
          this.commands.get(command).execute(message, args, this);
        } catch (error) {
          log.error(error);
          message.reply(
            'Oh no! I cannot execute that command for an unknow reason!'
          );
        }
      }
    }
  }

  public updateLibraryData(): void {
    fs.readdir(this.data.quotesPath, (err, files) => {
      // handling error
      if (err) {
        // tslint:disable-next-line: restrict-plus-operands
        log.error('Unable to scan directory: ' + err);
        log.error('Exiting the process.');
        process.exit(1);
      }

      log.system('Starting scan of quote files!');

      files.forEach(file => {
        if (path.parse(file).ext !== '.RAWPCM') {
          log.system('File scanned: ' + file);
        }

        this.data.quotesList.push({
          ext: path.parse(file).ext,
          name: path.parse(file).name
        });
      });
    });
    fs.readdir(this.data.songsPath, (err, files) => {
      // handling error
      if (err) {
        // tslint:disable-next-line: restrict-plus-operands
        log.error('Unable to scan directory: ' + err);
        log.error('Exiting the process.');
        process.exit(1);
      }

      log.system('Starting scan of song files!');

      files.forEach(file => {
        log.system('File scanned: ' + file);
        this.data.songsList.push({
          ext: path.parse(file).ext,
          name: path.parse(file).name
        });
      });
    });
  }
}
