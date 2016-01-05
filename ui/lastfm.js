import qs from 'qs'

export default class LastFM {
  constructor(api_key) {
    self.api_key = api_key;
    self.url = "http://ws.audioscrobbler.com/2.0/";
  }

  trackInfo(performer, title) {
    let query = {
      api_key: self.api_key,
      method: 'track.getInfo',
      artist: performer,
      track: title,
      format: 'json'
    }
    return fetch(self.url + '?' + qs.stringify(query))
      .then(resp => resp.json())
      .then(resp => resp["track"])
  }

  trackCover(performer, title) {
    return this.trackInfo(performer, title)
      .then(info => {
        if ("album" in info) {
          let cover = _.findWhere(info.album.image, {size: "extralarge"});
          return _.result(cover, '#text');
        }
      })
  }

}
