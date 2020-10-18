import React from "react";
import './Record.css';

import { Channel } from 'grommet-icons';

type Props = {
  channel: string;
}

const Record: React.FC<Props> = ({ channel }) => (
  <div className="record">
    <div className="record_channel" >
      <div className="record_icon" >
        <Channel color='white'/>
      </div>
      <div className='record_text'>
        <span> {channel} </span>
      </div>
    </div>

    <div className="record_operation">
      <button >delete</button>
    </div>
  </div>
);
export default Record
