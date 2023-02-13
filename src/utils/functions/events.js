import { Collection } from 'discord.js';
import CommandProcessor from '../classes/CommandProcessor.js';
import { getFileList, getModuleCollection } from './handlers.js';

export function onMessage(bot, msg) {
	if (msg.author.bot || !msg.content.startsWith(config.prefix)) return;
	const command = new CommandProcessor(msg);
	if (bot.commands.has(command.cmd)) bot.commands.get(command.cmd).action(bot, msg, command);
}

export async function onBotReady(bot) {
	console.log('Dolores on!');

	const commandModules = getFileList('commands');

	bot.commands = await getModuleCollection(commandModules, 'commands');
	bot.players = new Collection();
}

export function onRedisError(err) {
	console.error(err);
	throw Error(__.rediserror(config.redis_port));
}

export function onRedisReady(bot, redis) {
	console.log(__.redisactive(config.redis_port));	
	bot.login();

	if (config.redis_flush_on_start) {
		if (redis.flushall()) console.log('Redis flushall.');
	}
}
