import Discord from 'discord.js';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, StreamType } from '@discordjs/voice';
import redisModule from 'redis';
import { promisify } from 'util';
//import ytdl from 'ytdl-core-discord';
import ytdl from 'ytdl-core';
import Queue from './Queue.js';
import * as fs from 'fs';

const redis = redisModule.createClient(config.redis_port, config.redis_host);

const redisGet = promisify(redis.get).bind(redis);
const redisSet = promisify(redis.set).bind(redis);

class Player extends Queue {
	constructor(guild) {
		super(guild);
		this.connection = null;
		this.bitstream = null;
		this.player = createAudioPlayer();
		this.resource = null;
	}

	static getPlayer = (guild, bot) => {
		if (!guild instanceof Discord.Guild) throw TypeError('Invalid guild!');

		const player = bot.players.get(guild.id);
		if (player instanceof this) return player;

		bot.players.set(guild.id, new this(guild, bot));
		return bot.players.get(guild.id);
	};

	join = async channel => {
		
		if (this.connection) 
			return false;

		this.connection = await joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guildId,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfMute: false,
		});

		return this.connection;
	};
	
	stream = () => {		
		return new Promise(async (resolve, reject) => {
			try {
				const { queue } = await this.get(1, 1);
				const item = queue[0];

				if (!item) {
					resolve(false);
					return;
				}

				if (!this.connection) throw TypeError('Sem conexão');

				await ytdl(item, {filter: 'audioonly'})
					.pipe(fs.createWriteStream(`current-${this.guild.id}.mp4`))
					.on('close', async () => {
						this.resource = await createAudioResource(`current-${this.guild.id}.mp4`);
						await this.connection.subscribe(this.player);
						await this.player.play(this.resource);		
		
						this.player.on('error', (err) => console.error(err));
						this.connection.on('skip', async () => {					
							await this.player.stop();				
							await this.shift();
							resolve(true);
							return;					
						});
		
						this.player.on(AudioPlayerStatus.Idle, async () => {					
							await this.shift();
							await this.player.removeAllListeners();
							await this.connection.removeAllListeners();
							resolve(true);
						});

					});			
			} catch (err) {
				console.error(err);
				await this.skip();
				return true;
			}
		});
	};

	skip = async () => {
		await this.connection?.emit('skip');
		return true;
	};

	playing = () => (this.connection ? true : false);

	finish = async () => {
		this.connection?.destroy();
		this.bitstream?.destroy();
		this.connection = null;
		this.bitstream = null;

		return true;
	};
}

export default Player;
