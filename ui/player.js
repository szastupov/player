import React from 'react'
import ReactDOM from 'react-dom'
import Loader from './loader'
import _ from 'lodash'
import LastFM from './lastfm'


const lastfm = new LastFM("2de5147bbf48165a1fe12dc052afb725")


function toHHSS(sec) {
  let hours = parseInt(sec / 3600) % 24;
  let minutes = parseInt(sec / 60) % 60;
  let seconds = sec % 60;
  return minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}


const SearchBox = (props) => {
  return <div className="search-box container">
          <form onSubmit={e => e.preventDefault()}>
          <input type="text" placeholder="Search..."
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
  let pc = props.playPerc + "%";

  let onClick = (ev) => props.seek(ev.clientX / ev.target.clientWidth);
  return <div className="ruler" onClick={onClick}>
          <div className="bar" style={{width: pc}}/>
          <div className="playhead" style={{left: pc}}/>
         </div>
}


export class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      current_file: -1,
      current_track: -1,
      query: "",
      playback: "paused", // playing, paused, loading, error
      duration: 0,
      playPerc: 0
    }

    this.loader = new Loader();
    this.loadTracks();
    this.scrollBreak = 0;

    this.reload_debounced = _.debounce(this.reload, 200);

    this.initAudio();

  }

  initAudio() {
    let audio = this.audio = new Audio();
    let aon = (ev, listener) => audio.addEventListener(ev, listener)

    aon("error", () => {
      console.error("audio error", audio.error);
      this.setState({ playback: "error" });
    })
    aon("loadstart", () => this.setState({ playback: "loading" }))
    aon("pause", () => this.setState({ playback: "paused" }))
    aon("playing", () => this.setState({ playback: "playing" }))
    aon("ended", () => this.jump(1))
    aon("timeupdate", () => {
      let newpos = parseInt(audio.currentTime*100 / this.state.duration);
      if (newpos !== this.state.playPerc) {
        this.setState({ playPerc: newpos });
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

    return <footer>
            <Ruler
              seek={this.seek.bind(this)}
              playPerc={this.state.playPerc}/>
            <button onClick={this.jump.bind(this, -1)}>
              <i className="fa fa-backward"></i>
            </button>
            <button onClick={this.togglePlay.bind(this)}>
              <i className={pname}></i>
            </button>
            <button onClick={this.jump.bind(this, 1)}>
              <i className="fa fa-forward"></i>
            </button>
            <button>
              <i className="fa fa-heart-o"></i>
            </button>
           </footer>
  }

  renderTracks() {
    return this.state.tracks.map((t, i) => {
      let active = t.file_id == this.state.current_file;
      let cname = active ? "track active" : "track";
      let search = (e) => {
        this.search('"' + t.performer + '"');
        e.stopPropagation();
      }

      return <div className={cname} key={t.file_id}
                  onClick={this.playTrack.bind(this, i)}>
              <div className="track-left">
                <div className="title">{t.title}</div>
                <a href="#" className="performer" onClick={search}>
                  {t.performer || "Unknown"}
                </a>
              </div>
              <div className="duration">{toHHSS(t.duration)}</div>
             </div>
    })
  }

  render() {
    let bg = this.state.cover ? `url("${this.state.cover}")` : null
    return <div id="player">
            <div className="cover" style={{backgroundImage: bg}}/>
            <div className="scrollable" ref="scrollable">
              <SearchBox
                search={this.search.bind(this)}
                query={this.state.query}/>
              <div className="track-list container">{this.renderTracks()}</div>
            </div>
            {this.renderControls()}
           </div>
  }

  componentDidMount() {
    let view = this.refs.scrollable;
    view.addEventListener("scroll", ev => {
      let scrollBreak = view.scrollHeight - 140;
      let scrolled = scrollBreak - view.scrollTop <= view.clientHeight;
      if (scrolled &&
          scrollBreak > this.scrollBreak &&
          this.loader.hasMore())
      {
        console.log("load more");
        this.scrollBreak = scrollBreak;
        this.loadTracks();
      }
    })
  }

  loadTracks() {
    this.loader.load().then(tracks => this.setState({ tracks }))
  }

  reload(text) {
    console.log("searching", text);
    this.loader = new Loader(text);
    this.loadTracks();
    this.scrollBreak = 0;
  }

  search(text, debounced) {
    this.setState({ query: text });

    if (debounced) {
      this.reload_debounced(text);
    } else {
      this.reload(text);
    }
  }

  playTrack(index) {
    let tracks = this.state.tracks;
    index = mod(index, tracks.length);
    let track = tracks[index];

    if (track.file_id === this.state.current_file) {
      switch (this.state.playback) {
        case "playing":
          return this.audio.pause();
        default:
          return this.audio.play();
      }
    }

    console.log("Playing ", track.performer, track.title, track.file_id);
    this.setState({
      current_file: track.file_id,
      current_track: index,
      duration: track.duration,
      cover: null
    });

    document.title = `${track.title} by ${track.performer}`;

    let file_url = "./files/" + track.file_id;
    this.audio.src = file_url;
    this.audio.load();
    this.audio.play();

    lastfm.trackCover(track.performer, track.title)
          .then(cover => this.setState({cover}));
  }

  seek(scale) {
    let pos = parseInt(scale * this.state.duration);
    console.log("seek", pos);
    this.audio.currentTime = pos;
  }

  togglePlay() {
    if (this.state.current_track === -1) {
      return this.playTrack(0);
    }

    switch (this.state.playback) {
      case "playing":
        this.audio.pause();
        break;
      case "paused":
        this.audio.play();
        break;
    }
  }

  jump(i) {
    this.playTrack(this.state.current_track + i);
  }
}
