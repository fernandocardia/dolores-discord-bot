import redisModule from 'redis';
import { promisify } from 'util';
import ytdl from 'ytdl-core-discord';
import { findFirstUrl, getVideoDetails, getPlaylist } from './../functions/handlers.js';

const redis = redisModule.createClient(config.redis_port, config.redis_host);

const redisRpush = promisify(redis.rpush).bind(redis);
const redisRpop = promisify(redis.rpop).bind(redis);
const redisLpop = promisify(redis.lpop).bind(redis);
const redisLrem = promisify(redis.lrem).bind(redis);
const redisLinsert = promisify(redis.linsert).bind(redis);
const redisLindex = promisify(redis.lindex).bind(redis);
const redisLrange = promisify(redis.lrange).bind(redis);
const redisLlen = promisify(redis.llen).bind(redis);
const redisDel = promisify(redis.del).bind(redis);
export default class Queue {
	constructor(guild) {
		this.guild = guild;
		this.queueIdentifier = `dolores:${this.guild.id}:queue`;
	}

	addPlaylist = async string => {
		try{
			const items = await getPlaylist(string);
			const added = items.map(item => this.add(item, false));

			await Promise.allSettled(added);

			const video = await getVideoDetails(items[0]);
			if (video.videoDetails)	return video;
			else return true;		
		}
		catch(err){
			console.error(error);
		}
	}

	add = async (string, getDetails=true) => {				
		let url = '';
		try {
			url = ytdl.validateURL(string) ? string : await findFirstUrl(string, 1);
		} catch (err){
			console.error(err);
			return false;
		}
		if (url.length) {
			const data = await redisRpush(this.queueIdentifier, url);
	
			if (data) {
				if (!getDetails) return true;
				const video = await getVideoDetails(Array.isArray(url) ? url[0] : url);

				if (video.videoDetails)	return video;
				else return true;
			}
		}

		return false;
	};

	get = async (page, pageSize = config.paginate_max_results) => {
		const validatedPage = parseInt(page) - 1;
		const validatedPageSize = parseInt(pageSize);

		if (Number.isNaN(validatedPage) || Number.isNaN(validatedPageSize)) {
			reject(`Página inválida.`);
			return;
		}

		const startIndex = validatedPage * validatedPageSize;
		const endIndex = validatedPage * validatedPageSize + validatedPageSize - 1;
		const result = await redisLrange(this.queueIdentifier, startIndex, endIndex);
		const length = await this.length();
		const pages = Math.ceil(length / validatedPageSize);

		return {
			queue: result,
			pageSize: result.length,
			startsFrom: startIndex,
			endsFrom: endIndex,
			queueLength: length,
			pages,
			page: validatedPage + 1
		};
	};

	length = async () => {
		const result = await redisLlen(this.queueIdentifier);

		return result;
	};

	clear = async () => {
		const result = await redisDel(this.queueIdentifier);

		return result;
	};

	pop = async () => {
		const result = await redisRpop(this.queueIdentifier);

		return result;
	};

	shift = async () => {
		const result = await redisLpop(this.queueIdentifier);

		return result;
	};
}
