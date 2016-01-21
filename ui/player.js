import React from 'react'
import ReactDOM from 'react-dom'
import Loader from './loader'
import _ from 'lodash'
import LastFM from './lastfm'
import {toHHSS, mod, scrollIntoView, getScrollTop} from './utils'

let lastfm = new LastFM("2de5147bbf48165a1fe12dc052afb725")


const SearchBox = (props) => {

  let hideForm = e => {
    e.preventDefault()
    document.activeElement.blur()
  }

  return <div className="search-box container">
          <form onSubmit={hideForm}>
          <input type="search" placeholder="Search..."
            autoFocus={true}
            required={true}
            value={props.query}
            onChange={ev => props.search(ev.target.value, true)}/>
          <button className="fa fa-times" type="reset"
            onClick={() => props.search("")}>
          </button>
          </form>
         </div>
}


const Ruler = (props) => {
  let pc = props.playPerc + "%"
  let onClick = (ev) => props.seek(ev.clientX / ev.target.clientWidth)
  return <div className="ruler" onClick={onClick}>
          <div className="bar" style={{width: pc}}/>
          <div className="playhead" style={{left: pc}}/>
         </div>
}


export class Player extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tracks: [],
      track: null,
      track_index: -1,
      query: "",
      playback: "paused", // playing, paused, loading, error
      playPerc: 0,
      shuffle: localStorage.shuffle === 'true'
    }

    this.loader = new Loader(tracks => this.setState({ tracks }))
    this.scrollBreak = 0

    this.reload_debounced = _.debounce(this.reload, 200)

    this.initAudio()
  }

  initAudio() {
    let audio = this.audio = new Audio();
    let aon = (ev, listener) => audio.addEventListener(ev, listener)

    aon("error", () => {
      console.error("audio error", audio.error)
      this.setState({ playback: "error" })
    })
    aon("loadstart", () => this.setState({ playback: "loading" }))
    aon("pause", () => this.setState({ playback: "paused" }))
    aon("playing", () => this.setState({ playback: "playing" }))
    aon("ended", () => this.jump(1))
    aon("timeupdate", () => {
      let newpos = parseInt(audio.currentTime*100 / this.state.track.duration)
      if (newpos !== this.state.playPerc) {
        this.setState({ playPerc: newpos })
      }
    })
  }

  renderControls() {
    const stateMap = {
      playing: "fa fa-pause",
      error: "fa fa-exclamation-circle",
      loading: "fa fa-spinner fa-spin",
      paused: "fa fa-play"
    }
    let pname = stateMap[this.state.playback]
    let liked = this.state.track.liked

    return <footer>
            <Ruler
              seek={this.seek.bind(this)}
              playPerc={this.state.playPerc}/>
            <div className="controls">
              <button className={this.state.shuffle ? "active" : "inactive"}
                      onClick={() => this.toggleShuffle()}>
                <i className="fa fa-random"></i>
              </button>
              <button onClick={() => this.togglePlay()}>
                <i className={pname}></i>
              </button>
              <button>
                <i className="fa fa-hashtag"></i>
              </button>
              <button className={liked ? "active" : "inactive"}
                      onClick={() => this.likeTrack()}>
                <i className={liked ? "fa fa-heart" : "fa fa-heart-o"}></i>
              </button>
            </div>
           </footer>
  }

  renderTracks() {
    return this.state.tracks.map((t, i) => {
      let active = this.state.track && this.state.track.file_id == t.file_id
      let search = (e) => {
        this.search('"' + t.performer + '"')
        e.stopPropagation()
      }

      return (
        <li className={active ? "active" : null}
            key={t.file_id}
            ref={active ? scrollIntoView : null}
            >
          <div className="track" onClick={() => this.playTrack(i)}>
            <div className="title">{t.title}</div>
            <a href="#" className="performer" onClick={search}>
              {t.performer || "Unknown"}
            </a>
            <div className="duration">{toHHSS(t.duration)}</div>
          </div>
          { active ? this.renderControls() : null }
        </li>
      )
    })
  }

  render() {
    let bg = this.state.cover ? `url("${this.state.cover}")` : null
    return <div id="player">
            <div className="cover" style={{backgroundImage: bg}}/>
            <div className="cover-glass"/>
            <SearchBox
              search={this.search.bind(this)}
              query={this.state.query}/>
            <ul className="track-list container">{this.renderTracks()}</ul>
           </div>
  }

  componentDidMount() {
    let view = document.querySelector("body")
    window.onscroll = ev => {
      let scrollBreak = view.scrollHeight - 400
      let top = getScrollTop(view)
      let scrolled = scrollBreak - top <= view.clientHeight
      if (scrolled &&
          scrollBreak > this.scrollBreak &&
          this.loader.hasMore())
      {
        console.log("load more")
        this.scrollBreak = scrollBreak
        this.loader.load()
      }
    }

    window.player = this;
  }

  focusSearch() {
    let input = document.querySelector('input[type="search"]')
    input.focus()
    scrollIntoView(input)
  }

  reload(text) {
    console.log("searching", text)
    this.loader.reset(text)
    this.scrollBreak = 0
  }

  search(text, debounced) {
    this.setState({ query: text })

    if (debounced) {
      this.reload_debounced(text)
    } else {
      this.reload(text)
    }
  }

  playTrack(index) {
    let tracks = this.state.tracks;
    index = mod(index, tracks.length);
    let track = tracks[index];

    if (this.state.track && this.state.track.file_id === track.file_id) {
      switch (this.state.playback) {
        case "playing":
          return this.audio.pause();
        default:
          return this.audio.play();
      }
    }

    console.log("Playing ", track.performer, track.title, track.file_id)
    document.title = `${track.title} by ${track.performer}`

    this.setState({
      track: track,
      track_index: index
    })
    this.audio.src = "./files/" + track.file_id
    this.audio.load()
    this.audio.play()

    lastfm.trackCover(track.performer, track.title)
          .then(cover => this.setState({cover}))
  }

  seek(scale) {
    let pos = parseInt(scale * this.state.track.duration)
    console.log("seek", pos)
    this.audio.currentTime = pos
  }

  togglePlay() {
    switch (this.state.playback) {
      case "playing":
        this.audio.pause()
        break
      case "paused":
        this.audio.play()
        break
    }
  }

  toggleShuffle() {
    let enable = !this.state.shuffle;
    console.log("shuffle is ", enable ? "on" : "off");
    this.setState({ shuffle: enable });
    localStorage.shuffle = enable;
  }

  likeTrack() {
    let track = this.state.track
    track.liked = !track.liked
    this.setState({track})
  }

  jump(i) {
    if (this.state.shuffle) {
      this.playTrack(_.random(0, this.state.tracks.length));
    } else {
      this.playTrack(this.state.track_index + i);
    }
  }
}
