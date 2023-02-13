export default function paginate(array, page = 1, pageSize = 10) {
	if (!array instanceof Array) throw TypeError("Not a array");

	const validatedPage = parseInt(page) - 1;
	const validatedPageSize = parseInt(pageSize);

	if (Number.isNaN(validatedPage) || Number.isNaN(validatedPageSize)) throw TypeError('Page or page size invalid.');

	const startIndex = validatedPage * validatedPageSize;
	const endIndex = validatedPage * validatedPageSize + validatedPageSize;
	const pageCount = Math.ceil(validatedPageSize / array.length) + 1;

	if (validatedPage > pageCount - 1 || validatedPage < 0) {
		return {
			page: [],
			pageCount
		};
	}

	const result = {
		page: array.slice(startIndex, endIndex),
		pageCount
	};

	return result;
}
