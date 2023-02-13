import Discord from 'discord.js';

export default class CommandProcessor {
	constructor(msg) {
		if (!msg instanceof Discord.Message) throw TypeError('Invalid message!');

		this.text = msg.content;
		this.prefix = config.prefix;
		this.textArr = this.text.trim().substring(this.prefix.length).split(/\s+/);
	}

	get args() {
		const [cmd, ...args] = this.textArr.filter(item => !item.startsWith(config.option_prefix));
		return args;
	}

	get all() {
		return {
			command: this.cmd,
			arguments: this.args
		};
	}

	get cmd() {
		const [cmd] = this.textArr;
		return cmd;
	}

	get combined() {
		return this.args.join(' ');
	}

	hasArg(arg) {
		const argMap = new Set(this.args);
		return argMap.has(arg);
	}
}
