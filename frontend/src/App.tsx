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
  rec_type: ListRecord
  channels: ListRecord[]
  select_channel: ListRecord
}

interface ListRecord {
  value: string
  label: string
}

class App extends React.Component<{}, Props> {
  constructor(prop: any) {
    super(prop)
    this.state = {
      day: new Date(),
      rec_type: rec_types[0],
      channels: new Array(0),
      select_channel: { value: "", label: "" }
    }
  }

  updateSchedule(response: Response) {
    if (response.ok) {
      response.json().then(json => {
        const div = document.getElementById('schedule')
        div?.querySelectorAll('*').forEach(n => n.remove());
        json.forEach((v: any) => {
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
  }

  componentDidMount() {
    fetch("/schedule")
      .then((res) => this.updateSchedule(res))

    const main = this
    fetch("/area")
      .then((res => res.body?.getReader().read()))
      .then(function(response) {
        const xml = (new TextDecoder()).decode(response?.value)
        const options = { ignoreComment: true, alwaysChildren: true };
        return parser.xml2js(xml, options)['elements'][0]['elements']
      })
      .then(function(res) {
        const list: ListRecord[] = new Array(0)
        res.forEach((v: any) => {
          const name = v.elements[0].elements[0]['text']
          list.push({ label: name, value: name })
        })
        return list
      })
      .then(function(res) {
        console.log(res)
        main.setState({ channels: res })
      })
      .catch((err) => {
        console.log('err' + err)
      })
  }

  private handleClick = () => {
    const main = this
    const text = this.createRequestInfo()
    console.log(text)
    fetch('/rec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: text
    }).then(function(res) {
      main.updateSchedule(res)
    })

  }
  createRequestInfo() {
    const start_time: HTMLInputElement = document.getElementById('start_time') as HTMLInputElement;
    const rec_minute: HTMLInputElement = document.getElementById('rec_minute') as HTMLInputElement;
    const datepicker: HTMLInputElement = document.getElementById('datepicker') as HTMLInputElement;
    return JSON.stringify({
      date: datepicker?.value,
      channel: this.state.select_channel.value,
      start: start_time?.value,
      rec_type: this.state.rec_type,
      rec_minute: rec_minute?.value,
    })
  }
  private handleChange = (d: any) => {
    this.setState({ day: d })
  }
  handleTypeChange = (tp: ValueType<ListRecord>) => {
    const v = tp as ListRecord
    this.setState({ rec_type: v })
  }
  private handleChangeChannel = (d: any) => {
    this.setState({ select_channel: d })
  }
  render() {
    return (
      <div className="App">
        <div className='header'>RadioHub</div>
        <div className='content'>
          <div className='operation'>
            <p>Start Now</p>
            <Select id="rec_type" onChange={this.handleTypeChange} options={rec_types} value={this.state.rec_type} defaultValue={rec_types[0]} />
            <div className='datetime' style={{ display: this.state.rec_type.value !== 'now' ? '' : 'none' }}>
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
              <Select id="channel" options={this.state.channels} value={this.state.select_channel} onChange={this.handleChangeChannel} />
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
