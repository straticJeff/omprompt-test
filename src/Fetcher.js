import fetch, {FetchError} from "node-fetch"

export class Fetcher {
    static async retrievePage(result) {
        const {url} = result
        try {
            const page = await fetch(url, {
                headers: {
                    "User-Agent": "node-fetch crawler"
                }
            })
            return Object.assign(result, {content: await page.text()})
        } catch (e) {
            throw new FetchError(`Unable to fetch HTML from page: ${result.url}`)
        }
    }
}
