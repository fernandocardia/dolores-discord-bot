import { MessageEmbed } from 'discord.js';
import Player from './../utils/classes/Player.js';
import { getVideoDetails } from './../utils/functions/handlers.js';

export default {
	name: 'fila',
	description: __.queue(config.prefix),
	action: async (bot, msg, command) => {
		try {
			if (!process.env.ALLOWED_USERS || 
				(process.env.ALLOWED_USERS && 
				 process.env.ALLOWED_USERS.split(',').indexOf(msg.member.id) !== -1)){
				const page = command.args[0] || 1;
				const queue = Player.getPlayer(msg.guild, bot);
				const result = await queue.get(page);
	
				if (result.queue.length === 0) {
					msg.channel.send(__.emptyqueue());
					return;
				}
					
				const videos = result.queue.map(async url => {					
					const details = await getVideoDetails(url);
	
					if (details) return details.videoDetails;
					return url;
				});
	
				const statusMsg = await msg.channel.send(__.processing());
					
				const resolvedVideos = await Promise.all(videos);				
	
				const embedFields = resolvedVideos.map((video, index) => {
					const views = video.viewCount;
					const userIndex = index + result.startsFrom + 1;
					const title = video.title || __.unknowntitle();
					const author = video.author?.name || __.unkownauthor();
	
					return {
						name: __.itemtitle(userIndex, title, author),
						value: __.itemdesc(views)
					};
				});
	
				const reply = new MessageEmbed()
					.setColor('#3bf776')
					.setTitle(__.queuetitle())
					.setDescription(__.queuedesc(result.page, result.pages))
					.addFields(...embedFields);
					
				await statusMsg.delete();
				msg.channel.send({embeds: [reply]});
			}				
			else 
				msg.channel.send(':)');
		} catch (err) {
			console.error(err);
			msg.channel.send(__.commanderror());
		}
	}
};
