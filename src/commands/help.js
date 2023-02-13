import { MessageEmbed } from 'discord.js';
import { getFileList, getModuleCollection } from './../utils/functions/handlers.js';
import config from '../../config.js';

export default {
	name: 'ajuda',
	description: __.help(config.prefix),
	action: async (bot, msg, command) => {
		try {			
			if (!process.env.ALLOWED_USERS || 
				(process.env.ALLOWED_USERS && 
				 process.env.ALLOWED_USERS.split(',').indexOf(msg.member.id) !== -1)){
				const commandModules = getFileList('commands');
				const collection = Array.from(await getModuleCollection(commandModules, 'commands'));
				const embedFields = collection.map(item => ({ name: `${config.prefix}${item[0]}`, value: item[1].description }));
		
				const message = new MessageEmbed() 
					.setColor('#3bf776')
					.setTitle(__.helptitle())
					.setDescription(__.helpdesc())
					.addFields(...embedFields);
					
				msg.channel.send({embeds: [message]});
			}
		} catch (err) {
			console.info(err);
		}
	}
};
