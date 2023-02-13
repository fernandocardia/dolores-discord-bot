import Player from './../utils/classes/Player.js';
import config from '../../config.js';

export default {
	name: 'toca',
	description: __.play(config.prefix),
	action: async (bot, msg, command) => {
		try {
			if (!process.env.ALLOWED_USERS || 
				(process.env.ALLOWED_USERS && 
				 process.env.ALLOWED_USERS.split(',').indexOf(msg.member.id) !== -1)){
				const channel = msg.member.voice.channel;
				const player = Player.getPlayer(msg.guild, bot);
				const playing = player.playing();
				const connected = await player.join(channel);	

				if (!connected || playing) {										
					const video = await player.add(command.combined);					
					if (video) msg.channel.send(__.addedtoqueue());
						else msg.channel.send(__.notaddedtoqueue());					
				} else {
					const userItem = command.combined;
			
					if (userItem) {
						const video = await player.add(userItem);				
						if (video) {
							if (video.videoDetails) 
								msg.channel.send(__.playing(video.videoDetails.title));
							while(await player.stream());	
				
							player.finish();
						} else
							msg.channel.send(__.queueadderror());						
					}										
				}
			}
		} catch (err) {
			console.error(err);

			const player = Player.getPlayer(msg.guild, bot);
			await player.finish();
			msg.channel.send(__.commanderror());
		}
	}
};
