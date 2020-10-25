import React from 'react';
import './App.css';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Select, { ValueType } from 'react-select'
import Record, { ClickRecord } from './component/Record'

var parser = require('xml-js');


const rec_types = [
  { value: 'one_time', label: 'one time' },
  { value: 'now', label: 'now' },
  { value: 'schedule', label: 'schedule' },
]
interface Props {
  day: Date
  rec_type: ValueLabel
  channels: ValueLabel[]
  select_channel: ValueLabel
  items: any[]
}

interface ValueLabel {
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
      select_channel: { value: "", label: "" },
      items: new Array
    }
  }

  updateSchedule(response: Response) {
    if (response.ok) {
      response.json().then(json => {
        const div = document.getElementById('schedule')
        div?.querySelectorAll('*').forEach(n => n.remove());
        const li: any[] = new Array
        json.forEach((v: any) => { li.push(v) })
        this.setState({ items: li })
        console.log(json)
      })
    }
  }

  listItems = (state: any[]) => {
    return state.map((rec: any) => {
      if (rec != "") {
        return <Record channel={rec.channel} description="" date={rec.date}  time={rec.time} onClickDelete={this.handleDeleteRecord} />
      }
      return null;
    });
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
        const list: ValueLabel[] = new Array(0)
        res.forEach((v: any) => {
          const name = v.elements[0].elements[0]['text']
          list.push({ label: name, value: name })
        })
        main.setState({ channels: list })
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
      channel: this.state.select_channel.value,
      date: datepicker?.value,
      time: start_time?.value,
      rec_type: this.state.rec_type.value,
      rec_minute: rec_minute?.value,
    })
  }
  private handleChange = (d: any) => {
    this.setState({ day: d })
  }
  handleTypeChange = (tp: ValueType<ValueLabel>) => {
    const v = tp as ValueLabel
    this.setState({ rec_type: v })
  }
  private handleChangeChannel = (d: any) => {
    this.setState({ select_channel: d })
  }
  handleDeleteRecord = (e: ClickRecord) => {
    console.log('delete record')
    const main = this
    const text = JSON.stringify({
      channel: e.channel,
      date: e.date,
      time: e.time,
      description: e.description
    })
    fetch('/del', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: text
    }).then(function(res) {
      main.updateSchedule(res)
    })
  }
  render() {
    return (
      <div className="App">
        <div className='header'>RadioHub</div>
        <div className='content'>
          <div className='operation'>
            <div>
              <p>Description</p>
              <input type="text" className="tbox-style" id="description" ></input>
            </div>
            <p>Start Now</p>
            <Select id="rec_type" className="selectbox" onChange={this.handleTypeChange} options={rec_types} value={this.state.rec_type} defaultValue={rec_types[0]} />
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
              <Select className="selectbox" id="channel" options={this.state.channels} value={this.state.select_channel} onChange={this.handleChangeChannel} />
            </div>
            <div className='register'>
              <button onClick={this.handleClick}>recording start</button>
            </div>
          </div>
          <div className="schedule_area">
            <p>Schedule</p>
            <div id="schedule"> </div>
            {this.listItems(this.state.items)}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
