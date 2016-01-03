export default class Loader {
  constructor(query) {
    this.query = query;
    this.total = 0;
    this.tracks = [];
  }

  load() {
    let url = '/tracks?offset=' + this.tracks.length;
    if (this.query) {
      url += '&text=' + this.query;
    }

    return fetch(url)
      .then(r => r.json())
      .then(result => {
        this.tracks = this.tracks.concat(result["tracks"]);
        this.total = result["total"];
        return this.tracks;
      })
      .catch(ex => console.error('Failed to load tracks', ex));
  }

  hasMore() {
    return this.total > this.tracks.length;
  }
}
