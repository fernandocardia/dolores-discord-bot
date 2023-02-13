import Player from './../utils/classes/Player.js';

export default {
	name: 'pula',
	description: __.skip(config.prefix),
	action: async (bot, msg, command) => {
		try {
			if (!process.env.ALLOWED_USERS || 
				(process.env.ALLOWED_USERS && 
				 process.env.ALLOWED_USERS.split(',').indexOf(msg.member.id) !== -1)){
				const player = await Player.getPlayer(msg.guild, bot);
				const result = await player.skip();
	
				if (result) msg.channel.send(__.skipped());
			}
		} catch (err) {
			console.info(err);
			msg.channel.send(__.commanderror());
		}
	}
};
