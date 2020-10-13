import React from 'react';
import './App.css';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Select, { ValueType } from 'react-select'

var parser = require('xml-js');


const rec_types = [
  { value: 'one_time', label: 'one time' },
  { value: 'now', label: 'now' },
  { value: 'schedule', label: 'schedule' },
]
interface Props {
  day: Date
  rec_type: typeof rec_types[0]
}

class App extends React.Component<{}, Props> {
  constructor(prop: any) {
    super(prop)
    this.state = {
      day: new Date(),
      rec_type: rec_types[0]
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
        const xml = (new TextDecoder()).decode(response?.value)
        const options = { ignoreComment: true, alwaysChildren: true };
        const data = parser.xml2js(xml, options)['elements'][0]['elements']

        console.log(data[0])
        const list = document.getElementById('channel');
        data.forEach((v: any) => {
          const name = v.elements[0].elements[0]['text']
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
    const text = this.createRequestInfo()
    console.log(text)
    fetch('/rec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: text
    })
  }
  createRequestInfo() {
    const chan: HTMLInputElement = document.getElementById('channel') as HTMLInputElement;
    const start_time: HTMLInputElement = document.getElementById('start_time') as HTMLInputElement;
    const rec_minute: HTMLInputElement = document.getElementById('rec_minute') as HTMLInputElement;
    const datepicker: HTMLInputElement = document.getElementById('datepicker') as HTMLInputElement;
    return JSON.stringify({
      date: datepicker?.value,
      channel: chan?.value,
      start: start_time?.value,
      rec_type: this.state.rec_type,
      rec_minute: rec_minute?.value,
    })
  }
  private handleChange = (d: any) => {
    this.setState({ day: d })
  }
  handleTypeChange = (tp: ValueType<{ value: string, label: string }>) => {
    const v = tp as { value: string, label: string }
    this.setState({ rec_type: v })
  }
  render() {
    return (
      <div className="App">
        <div className='header'>RadioHub</div>
        <div className='content'>
          <div className='operation'>
            <p>Start Now</p>
            <Select id="rec_type" onChange={this.handleTypeChange} options={rec_types} value={this.state.rec_type} defaultValue={rec_types[0]} />
            <div className='datetime' style={{ display: this.state.rec_type.value !== 'now' ? '' :'none' }}>
              <p>Date</p>
              <DatePicker className="datepicker" id="datepicker"
                onChange={this.handleChange}
                selected={this.state.day} />
              <p>Time</p>
              <input type="time" id="start_time" className="tbox-style" />
            </div>
            <div>
              <p> Recording Length</p>
              <input type="number" id="rec_minute" className="tbox-style" defaultValue="90"></input>sec
            </div>
            <div>
              <p> Channel </p>
              <Select id="channel" />
            </div>
            <div className='register'>
              <button onClick={this.handleClick}>recording start</button>
            </div>
          </div>
          <p>Schedule</p>
          <div id="schedule"> </div>
        </div>
      </div>
    );
  }
}

export default App;
