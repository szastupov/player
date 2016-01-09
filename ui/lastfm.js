import qs from 'qs'

export default class LastFM {
  constructor(api_key) {
    this.api_key = api_key
    this.url = "http://ws.audioscrobbler.com/2.0/"
  }

  apiCall(options) {
    let query = _.assign({
      api_key: this.api_key,
      format: 'json'
    }, options)

    return fetch(this.url + '?' + qs.stringify(query))
      .then(resp => resp.json())
  }

  trackInfo(performer, title) {
    let query = {
      method: 'track.getInfo',
      artist: performer,
      track: title,
      autocorrect: '1'
    }
    return this.apiCall(query)
      .then(resp => resp["track"])
  }

  artistInfo(performer) {
    let query = {
      method: 'artist.getInfo',
      artist: performer,
      autocorrect: '1'
    }
    return this.apiCall(query)
      .then(resp => resp["artist"])
  }

  trackCover(performer, title) {
    return this.trackInfo(performer, title)
      .then(info => {
        if ("album" in info) {
          return info.album
        } else {  // Fallback to artist cover
          return this.artistInfo(performer)
        }
      })
      .then(album => {
        let cover = _.findWhere(album.image, {size: "extralarge"})
        return _.result(cover, '#text')
      })
  }

}
