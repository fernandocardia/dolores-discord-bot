import { Client, Intents } from 'discord.js';
import { config as env } from 'dotenv';
import redisModule from 'redis';
import conf from '../config.js';
import lang from './lang.js';
import { onBotReady, onMessage, onRedisError, onRedisReady } from './utils/functions/events.js';

env();

global.config = conf;
global.__ = lang;

const dolores = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

const redis = redisModule.createClient(config.redis_port, config.redis_host);

redis.on('ready', () => onRedisReady(dolores, redis));

redis.on('error', onRedisError);

dolores.on('ready', () => onBotReady(dolores));

dolores.on('messageCreate', msg => onMessage(dolores, msg));
