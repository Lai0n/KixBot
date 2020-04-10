import { Message } from 'discord.js';
import { DClient } from '../class/DClient';

export type LibraryFileList = {
  readonly name: string;
  readonly ext: string;
};

export type LibraryData = {
  readonly quotesPath: string;
  readonly songsPath: string;
  readonly quotesList: LibraryFileList[];
  readonly songsList: LibraryFileList[];
};

export type Command = {
  readonly name: string;
  readonly description: string;
  readonly usage?: string;
  readonly examples?: readonly string[];
  execute(message: Message, args: readonly string[], client: DClient): void;
};
