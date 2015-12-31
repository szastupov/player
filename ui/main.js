import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'underscore'
require('whatwg-fetch');
require("./style.less");

function toHHSS(sec) {
  let hours = parseInt(sec / 3600) % 24;
  let minutes = parseInt(sec / 60) % 60;
  let seconds = sec % 60;
  return minutes + ':' + seconds;
}

let Track = (props) => {
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
            <input type="text" placeholder="Search..."
              onChange={this.search.bind(this)}/>
           </div>
  }

  search(ev) {
    let text = ev.target.value.trim();
    this.props.search(text)
  }
}

let Playhead = (props) => {
  let style = {
    width: props.playPerc + "%"
  }
  return <div className="playhead">
          <div style={style}>
          </div>
         </div>
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [],
      current_file: -1,
      current_track: -1,

      audio: null,
      playing: false,
      loading: false,
      playPerc: 0
    }

    this.loadTracks();
  }

  renderControls() {
    let pname;
    if (this.state.playing) {
      pname = "fa fa-pause";
    } else if (this.state.loading) {
      pname = "fa fa-spinner fa-spin"
    } else {
      pname = "fa fa-play";
    }

    return <footer className="player-controls">
            <Playhead playPerc={this.state.playPerc}/>
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
    return <div id="app">
            <div className="scrollable">
              <SearchBox search={this.search.bind(this)}/>
              <div className="track-list">{this.renderTracks()}</div>
            </div>
            {this.renderControls()}
           </div>
  }

  loadTracks(query) {
    let url = '/tracks';
    if (query) {
      url += '?text=' + query;
    }
    console.log(url);

    fetch(url)
      .then(r => r.json())
      .then(tracks => this.setState({ tracks: tracks }))
      .catch(ex => console.error('parsing failed', ex));
  }

  search(text) {
    console.log("searching", text);
    this.loadTracks(text);
  }

  playTrack(index) {
    let tracks = this.state.tracks;
    index = index % tracks.length;
    let track = tracks[index];

    if (track.file_id === this.state.current_file) {
      if (this.state.playing) {
        this.state.audio.pause();
      } else {
        this.state.audio.play();
      }
      return;
    }

    console.log("Playing ", track.performer, track.title, track.file_id);
    this.setState({
      current_file: track.file_id,
      current_track: index
    });

    let file_url = "/files/" + track.file_id;
    let audio = new Audio(file_url);

    audio.addEventListener("timeupdate", () => {
      this.setState({
        playPerc: parseInt(audio.currentTime*100 / track.duration)
      })
    })

    audio.addEventListener("loadstart", () => this.setState({ loading: true }))
    audio.addEventListener("canplay", () => this.setState({ loading: false }))
    audio.addEventListener("pause", () => this.setState({ playing: false }))
    audio.addEventListener("playing", () => this.setState({ playing: true }))
    audio.addEventListener("ended", () => this.forward())

    if (this.state.audio) {
      this.state.audio.pause();
    }
    this.setState({ audio: audio });

    audio.play();
  }

  togglePlay() {
    let audio = this.state.audio;
    if (!audio) {
      this.playTrack(0);
      return;
    }

    if (this.state.playing) {
      audio.pause();
    } else {
      audio.play();
    }

    this.setState({
      playing: !this.state.playing
    })
  }

  jump(i) {
    let audio = this.state.audio;
    if (!audio) {
      return;
    }
    this.playTrack(this.state.current_track + i);
  }
}

ReactDOM.render(<App />, document.getElementById('viewport'))
