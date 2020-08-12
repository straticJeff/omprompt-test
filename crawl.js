import {CrawlerQueue} from './src/CrawlerQueue'
import {PageParser} from './src/PageParser'
import {Fetcher} from "./src/Fetcher"

const startPage = process.argv[2] || 'bbc.co.uk'
const searchToken = process.argv[3] || 'Renault'
const parallelism = process.argv[4] || 4

const domain = startPage.match(/^(https?:\/\/)?([^/]*).*$/)[2]
console.log(`Domain: ${domain}`)

const queue = new CrawlerQueue(
    parallelism,
    domain,
    searchToken,
    PageParser.parsePage,
    Fetcher.retrievePage
)

queue.crawl(startPage)
queue.queueLoop()
