import React, { useState } from 'react';
import './App.css';
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

var parser = require('xml-js');

function DatePickerObj() {
  const [day, setDay] = useState<any>(Date.now());
  const handleChange = (d: any) => {
    console.log("change")
    setDay(d)
  }

  return (
    <div>
      <DatePicker
        onChange={handleChange}
        selected={day} />
    </div>
  );
}

class App extends React.Component {

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

  handleClick() {
    const ele: HTMLInputElement = document.getElementById('channel') as HTMLInputElement;
    var chan = ele?.value
    console.log(chan)

    fetch('/rec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: chan,
      })
    })
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
            <DatePickerObj />
            <input type="checkbox"></input>
            <input type="number" value="90" ></input>
            <select id="channel"></select>
            <button onClick={this.handleClick}>rec</button>
        </header>
      </div>
    );
  }
}

export default App;
