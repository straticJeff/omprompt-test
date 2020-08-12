# omprompt-test

Crawls a website looking for a token with a breadth-first algorithm. Does not cross domains.

## Install

Run the following commands:

- `npm i`
- `npm link`

## Running
- `npm start` - this will by default crawl `www.bbc.co.uk` looking for the term `Renault` on all crawled pages.

OR

- `npx babel-node crawl.js {startPage} {searchTerm} {parallelism}` - searches a domain from `startPage`, with a custom search term `searchTerm`. `parallelism` defines the maximum number of concurrent requests the crawler can make to the site at any given time. 

### Issues

These are (some) of the things I've not yet had time to do within the time budget: 

- Static user agent
- Does not take `robots.txt` into account
- Application does not refill HTTP request slots immediately when they resolve - could be more efficient 
- Needs Babel compilation
- Ideally needs some configurable limitations - e.g. max depth of URLs to crawl, max time to crawl for, etc
- `CrawlerQueue` could probably do with decomposition
- `CrawlerQueue` needs unit tests!
