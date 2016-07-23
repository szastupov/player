export default class Loader {
    constructor(onload) {
        this.onload = onload || (() => {})
        this.reset(null)
    }

    reset(query) {
        this.query = query
        this.total = 0
        this.tracks = []

        this.load()
    }

    load() {
        let url = `./tracks?offset=${this.tracks.length}&limit=30`
        if (this.query) {
            url += '&text=' + this.query
        }

        return fetch(url)
            .then(r => r.json())
            .then(result => {
                this.tracks = this.tracks.concat(result["tracks"])
                this.total = result["total"]
                this.onload(this.tracks)
            })
            .catch(ex => console.error('Failed to load tracks', ex))
    }

    hasMore() {
        return this.total > this.tracks.length
    }
}
