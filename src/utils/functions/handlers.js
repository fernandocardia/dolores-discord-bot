import fs from 'fs';
import redisModule from 'redis';
import Discord from 'discord.js';
import { youtube } from '@googleapis/youtube';
import ytdl from 'ytdl-core-discord';
import { promisify } from 'util';
import config from '../../../config.js';

const redis = redisModule.createClient(config.redis_port, config.redis_host);

export function getFileList(directory, fileTypes = ['.js']) {
	try {
		if (!directory || typeof directory !== 'string') return [];
		const fileList = fs.readdirSync(`${config.src}/${directory}`).filter(file => file.endsWith(fileTypes));
		return fileList;
	} catch (err) {
		console.error(err);
		return [];
	}
}

export async function getModuleCollection(filenames, directory) {
	if (filenames.length) {
		const moduleList = filenames.map(filename => import(`${config.src}/${directory}/${filename}`));
		const resolvedModules = await Promise.all(moduleList);
		const ready = resolvedModules.map(module => {
			const { name, action, description = '' } = module.default;
			if (name && action) return [name, { action, description }];
		});

		return new Discord.Collection(ready);
	}
}

export async function getVideoDetails(url) {
	try {
		if (!ytdl.validateURL(url)) throw Error(false);
		
		const [redisGet, redisSet, redisExpire] = [redis.get, redis.set, redis.expire].map(func => promisify(func).bind(redis));

		const fromCache = await redisGet(`youtube:${url}`);

		if (fromCache) {
			return JSON.parse(fromCache);
		}

		const videoDetails = await ytdl.getBasicInfo(url);

		await redisSet(`youtube:${url}`, JSON.stringify(videoDetails));
		await redisExpire(`youtube:${url}`, 86400);

		return videoDetails;
	} catch (err) {
		console.error(err);
	}
}

export async function findFirstUrl(search, resultCount = config.paginate_max_results) {
	return new Promise(async (resolve, reject) => {
		try {
			const yt = youtube({
				version: 'v3',
				auth: process.env.GOOGLE_API_TOKEN
			});

			const maxResults = Number.isNaN(parseInt(resultCount)) ? config.paginate_max_results : resultCount;

			const params = {
				part: 'id',
				maxResults,
				type: 'video',
				q: search
			};			

			await yt.search.list(params, (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				const urls = data.data.items.map(({ id }) => `https://www.youtube.com/watch?v=${id.videoId}`);

				resolve(urls);
			});
		} catch (err) {
			reject(err);
		}
	});
}

export function getPlaylist(url, maxResults = config.playlist_max_items) {
	return new Promise(async (resolve, reject) => {
		try {
			const yt = youtube({
				version: 'v3',
				auth: process.env.GOOGLE_API_TOKEN
			});

			const parsedUrl = new URL(url);
			const { list } = Object.fromEntries(parsedUrl.searchParams);

			if (!(parsedUrl.hostname === 'youtube.com' || parsedUrl.hostname === 'www.youtube.com') || !list) {
				console.log(parsedUrl.hostname, list);
				reject('url inválida.');
				return;
			}

			const params = {
				part: 'snippet',
				maxResults,
				playlistId: list
			};

			await yt.playlistItems.list(params, (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				const videos = data.data.items.map(({ snippet }) => `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`);

				resolve(videos);
			});
		} catch (error) {
			reject(error);
		}
	});
}