import path from 'path';

export default {
	src: path.resolve() + '/src',	
	prefix: '!c.',	
	redis_host: 'localhost',
	redis_port: 6379,
	redis_flush_on_start: false,
	paginate_max_results: 10,			
};
