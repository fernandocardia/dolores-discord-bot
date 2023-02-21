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
				const item = command.combined;
				if (!item) msg.channel.send(__.playempty());

				const channel = msg.member.voice.channel;
				const player = Player.getPlayer(msg.guild, bot);
				const playing = player.playing();
				const connected = await player.join(channel);

				const video = item.includes('list=') ? await player.addPlaylist(item) : await player.add(item);

				if (!connected || playing) {										
					if (video) msg.channel.send(__.addedtoqueue());
						else msg.channel.send(__.notaddedtoqueue());					
				} else {				
					if (video) {
						if (video.videoDetails) 
							msg.channel.send(__.playing(video.videoDetails.title));
						while(await player.stream());	
			
						player.finish();
					} else
						msg.channel.send(__.queueadderror());
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
