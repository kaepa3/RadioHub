import React from "react";
import './Record.css';

import { Channel, Notes, Clock } from 'grommet-icons';

type Props = {
  channel: string;
  description: string;
  time: string;
  date: string;
  onClickDelete: Function;
}

export type ClickRecord = {
  channel: string;
  description: string;
  date: string;
  time: string;
}


const Record: React.FC<Props> = ({ children, channel, description,  date, time, onClickDelete }) => {
  const handleDeleteClick = () => {
    const rec: ClickRecord = { channel: channel, description: description, time: time, date: date }
    onClickDelete(rec)
  }
  return (
    <div className="record">
      <div className="record_channel" >
        <div className="record_icon" >
          <Channel color='white' />
        </div>
        <div className='record_text'>
          <span> {channel} </span>
        </div>
      </div>
      <div className="record_description">
        <div className="record_icon" >
          <Notes color='white' />
        </div>
        <div className='record_text'>
          <span> {description} </span>
        </div>
      </div>
      <div className="record_time">
        <div className="record_icon" >
          <Clock color='white' />
        </div>
        <div className='record_text'>
          <span>{date} {time} </span>
        </div>
      </div>
      <div className="record_operation">
        <button onClick={handleDeleteClick}>delete</button>
      </div>
    </div>
  )
};
export default Record
