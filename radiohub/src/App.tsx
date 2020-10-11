import React from 'react';
import './App.css';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

var parser = require('xml-js');

interface Props {
  day: Date
}

class App extends React.Component<{}, Props> {
  constructor(prop: any) {
    super(prop)
    this.state = {
      day: new Date()
    }
  }

  componentDidMount() {
    fetch("/schedule")
      .then(function(response) {
        if (response.ok) {
          response.json().then(json => {
            json.forEach((v: any) => {
              const div = document.getElementById('schedule')
              const text = v.channel + v.date + v.start
              const obj = document.createElement("div")
              obj.innerHTML = text
              div?.appendChild(obj)
              console.log(v)
              console.log(obj)
            })
            console.log(json)
          })
        }
      })
    fetch("/area")
      .then(function(response) {
        return response.body?.getReader().read()
      })
      .then(function(response) {
        var xml = (new TextDecoder()).decode(response?.value)
        var options = { ignoreComment: true, alwaysChildren: true };
        var data = parser.xml2js(xml, options)['elements'][0]['elements']

        console.log(data[0])
        var list = document.getElementById('channel');
        data.forEach((v: any) => {
          var name = v.elements[0].elements[0]['text']
          let option = document.createElement('option');
          option.innerHTML = name;
          list?.appendChild(option);
        })

      })
      .catch((err) => {
        console.log('err' + err)
      })
  }

  private handleClick = () => {
    const chan: HTMLInputElement = document.getElementById('channel') as HTMLInputElement;
    const start_time: HTMLInputElement = document.getElementById('start_time') as HTMLInputElement;
    const is_now: HTMLInputElement = document.getElementById('is_now') as HTMLInputElement;
    const rec_minute: HTMLInputElement = document.getElementById('rec_minute') as HTMLInputElement;
    const datepicker: HTMLInputElement = document.getElementById('datepicker') as HTMLInputElement;
    var text = JSON.stringify({
      date: datepicker?.value,
      channel: chan?.value,
      start: start_time?.value,
      is_now: is_now?.value,
      rec_minute: rec_minute?.value,

    })
    console.log(text)

    fetch('/rec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: text
    })
  }
  private handleChange = (d: any) => {
    console.log("change")
    this.setState({ day: d })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <DatePicker className="datepicker" id="datepicker"
            onChange={this.handleChange}
            selected={this.state.day} />
          <input type="time" id="start_time"></input>
          <input type="checkbox" id="is_now" ></input>
          <input type="number" id="rec_minute" defaultValue="90"></input>
          <select id="channel"></select>
          <button onClick={this.handleClick}>rec</button>
          <div id="schedule"> </div>
        </header>
      </div>
    );
  }
}

export default App;
