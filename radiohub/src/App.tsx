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
    fetch("/area")
      .then(function(response) {
        console.log('1nd')
        return response.body?.getReader().read()
      })
      .then(function(response) {
        console.log('2nd')
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
    const ele: HTMLInputElement = document.getElementById('channel') as HTMLInputElement;
    var chan = ele?.value
    console.log(chan)
    console.log(this.state.day)

    //    fetch('/rec', {
    //      method: 'POST',
    //      headers: {
    //        'Content-Type': 'application/json'
    //      },
    //      body: JSON.stringify({
    //        channel: chan,
    //      })
    //    })
  }
  private handleChange = (d: any) => {
    console.log("change")
    this.setState({ day: d })

  }
  render() {
    return (
      <div className="App">
        <header className="App-header">

          <DatePicker className="datepicker"
            onChange={this.handleChange}
            selected={this.state.day} />
          <input type="checkbox"></input>
          <input type="number" defaultValue="90"></input>
          <select id="channel"></select>
          <button onClick={this.handleClick}>rec</button>
        </header>
      </div>
    );
  }
}

export default App;
