import React from 'react';
import './App.css';

var parser = require('xml-js');

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
    const ele : HTMLInputElement =document.getElementById('channel') as HTMLInputElement;
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
          <p>
            <select id="channel"></select>
            <button onClick={this.handleClick}>rec</button>
          </p>
        </header>
      </div>
    );
  }
}

export default App;
