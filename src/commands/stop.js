import Player from './../utils/classes/Player.js';

export default {
	name: 'para',
	description: __.stop(config.prefix),
	action: async (bot, msg) => {
		try {
			if (!process.env.ALLOWED_USERS || 
				(process.env.ALLOWED_USERS && 
				 process.env.ALLOWED_USERS.split(',').indexOf(msg.member.id) !== -1)){
				const player = await Player.getPlayer(msg.guild, bot);
				await player.clear();
				await player.finish();
			} else
				msg.channel.send(':)');
		} catch (err) {
			console.error(err);
			msg.channel.send(__.commanderror());
		}
	}
};
