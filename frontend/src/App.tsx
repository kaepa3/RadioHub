import React from 'react';
import './App.css';
import "react-datepicker/dist/react-datepicker.css"
import { ValueType } from 'react-select'
import Record, { ClickRecord } from './component/Record/Record'
import AddPopup from './component/AddPopup/AddPopup'

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
      items: []
    }
  }

  updateSchedule(response: Response) {
    if (response.ok) {
      response.json().then(json => {
        const div = document.getElementById('schedule')
        div?.querySelectorAll('*').forEach(n => n.remove());
        const li: any[] = []
        json.forEach((v: any) => { li.push(v) })
        this.setState({ items: li })
        console.log(json)
      })
    }
  }

  listItems = (state: any[]) => {
    return state.map((rec: any) => {
      if (rec !== "") {
        return <Record channel={rec.channel} description={rec.description} date={rec.date} time={rec.time} onClickDelete={this.handleDeleteRecord} />
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

  handleAdd(json: string) {
    const main = this
    console.log(json)
    fetch('/rec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json
    }).then(function(res) {
      main.updateSchedule(res)
    })
  }
  handleTypeChange = (tp: ValueType<ValueLabel>) => {
    const v = tp as ValueLabel
    this.setState({ rec_type: v })
  }
  handleDeleteRecord = (e: ClickRecord) => {
    console.log('delete record')
    if (!window.confirm("対象のスケジュールを削除してよろしいですか？")) {
      return
    }

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
          <div>
            <AddPopup addCallback={this.handleAdd} {...this.state.channels} />
          </div>
          <div className="schedule_area">
            <p> Schedule</p>
            <div id="schedule"> </div>
            {this.listItems(this.state.items)}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
