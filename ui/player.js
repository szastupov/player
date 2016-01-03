import React from 'react'
import ReactDOM from 'react-dom'
import Loader from './loader'
import _ from 'underscore'


function toHHSS(sec) {
  let hours = parseInt(sec / 3600) % 24;
  let minutes = parseInt(sec / 60) % 60;
  let seconds = sec % 60;
  return minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds);
}

const Track = (props) => {
  let cname = props.active ? "track active" : "track";
  let duration = toHHSS(props.duration);
  return <div className={cname} onClick={props.onClick}>
          <div className="track-left">
            <div className="title">{props.title}</div>
            <div className="performer">{props.performer || "Unknown"}</div>
          </div>
          <div className="duration">{duration}</div>
         </div>
}


class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.search = _.debounce(this.search, 200);
  }

  render() {
    return <div className="search-box">
            <form onSubmit={e => e.preventDefault()}>
            <input type="text" placeholder="Search..."
              required={true}
              onChange={this.search.bind(this)}/>
            <button className="fa fa-times" type="reset"
              onClick={() => this.props.search("")}>
            </button>
            </form>
           </div>
  }

  search(ev) {
    let text = ev.target.value.trim();
    this.props.search(text);
  }
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

      audio: null,
      playback: "paused", // playing, paused, loading, error
      duration: 0,
      playPerc: 0
    }

    this.loader = new Loader();
    this.loadTracks();
    this.scrollBreak = 0;
  }

  renderControls() {
    const stateMap = {
      playing: "fa fa-pause",
      error: "fa fa-exclamation-circle",
      loading: "fa fa-spinner fa-spin",
      paused: "fa fa-play"
    }
    let pname = stateMap[this.state.playback]

    return <footer className="player-controls">
            <Ruler
              seek={this.seek.bind(this)}
              playPerc={this.state.playPerc}/>
            <i className="fa fa-backward"
              onClick={this.jump.bind(this, -1)}></i>
            <i className={pname}
              onClick={this.togglePlay.bind(this)}></i>
            <i className="fa fa-forward"
              onClick={this.jump.bind(this, 1)}></i>
            <i className="fa fa-heart-o"></i>
           </footer>
  }

  renderTracks() {
    return this.state.tracks.map((t, i) =>
      <Track {...t} key={t.file_id}
        active={t.file_id == this.state.current_file}
        onClick={this.playTrack.bind(this, i)}
      />)
  }

  render() {
    return <div id="player">
            <div className="scrollable" ref="scrollable">
              <SearchBox search={this.search.bind(this)}/>
              <div className="track-list">{this.renderTracks()}</div>
            </div>
            {this.renderControls()}
           </div>
  }

  componentDidMount() {
    let view = this.refs.scrollable;
    view.addEventListener("scroll", ev => {
      let scrollBreak = view.scrollHeight - 70;
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

  search(text) {
    console.log("searching", text);
    this.loader = new Loader(text);
    this.loadTracks();
    this.scrollBreak = 0;
  }

  playTrack(index) {
    let tracks = this.state.tracks;
    index = index % tracks.length;
    let track = tracks[index];

    if (track.file_id === this.state.current_file) {
      switch (this.state.playback) {
        case "playing":
          return this.state.audio.pause();
        default:
          return this.state.audio.play();
      }
    }

    console.log("Playing ", track.performer, track.title, track.file_id);
    this.setState({
      current_file: track.file_id,
      current_track: index,
      duration: track.duration
    });

    let file_url = "/files/" + track.file_id;
    let audio = new Audio(file_url);

    audio.addEventListener("timeupdate", () => {
      this.setState({
        playPerc: parseInt(audio.currentTime*100 / track.duration)
      })
    })

    audio.addEventListener("error", () => {
      console.error("audio error", audio.error);
      this.setState({ playback: "error" });
    })

    audio.addEventListener("loadstart", () => this.setState({ playback: "loading" }))
    audio.addEventListener("pause", () => this.setState({ playback: "paused" }))
    audio.addEventListener("playing", () => this.setState({ playback: "playing" }))
    audio.addEventListener("ended", () => this.jump(1))

    if (this.state.audio) {
      this.state.audio.pause();
    }
    this.setState({ audio: audio });

    audio.play();
  }

  seek(scale) {
    let pos = parseInt(scale * this.state.duration);
    console.log("seek", pos);
    if (this.state.audio) {
      this.state.audio.currentTime = pos;
    }
  }

  togglePlay() {
    let audio = this.state.audio;
    if (!audio) {
      return this.playTrack(0);
    }

    switch (this.state.playback) {
      case "playing":
        audio.pause();
        break;
      case "paused":
        audio.play();
        break;
    }
  }

  jump(i) {
    let audio = this.state.audio;
    if (!audio) {
      return;
    }
    this.playTrack(this.state.current_track + i);
  }
}
