import React from 'react';
import Modal from 'react-modal';
import DatePicker from "react-datepicker"
import Select, { ValueType } from 'react-select'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    width: '80%',
    height: '90%',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

const rec_types = [
  { value: 'one_time', label: 'one time' },
  { value: 'now', label: 'now' },
  { value: 'schedule', label: 'schedule' },
]

interface IState {
  day: Date
  modalIsOpen: boolean
  rec_type: ValueLabel
  channels: ValueLabel[]
  select_channel: ValueLabel
}

interface ValueLabel {
  value: string
  label: string
}

class AddPopup extends React.Component<{}, IState>{
  constructor(props: {}) {
    super(props);
    this.state = {
      modalIsOpen: false,
      day: new Date(),
      rec_type: rec_types[0],
      channels: new Array(0),
      select_channel: { value: "", label: "" },
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.addSchedule= this.addSchedule.bind(this);
  }

  private handleChangeChannel = (d: any) => {
    this.setState({ select_channel: d })
  }
  private handleChange = (d: any) => {
    this.setState({ day: d })
  }

  handleTypeChange = (tp: ValueType<ValueLabel>) => {
    const v = tp as ValueLabel
    this.setState({ rec_type: v })
  }
  addSchedule(){
    this.setState({ modalIsOpen: false });
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }
  afterOpenModal() {
  }
  closeModal() {
    this.setState({ modalIsOpen: false });
  }
  render() {
    return (
      <div>
        <button onClick={this.openModal}>Open Modal!!</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
            <div>
              <p>Description</p>
              <input type="text" className="tbox-style" id="description" ></input>
            </div>
            <p>Rec Type</p>
            <Select id="rec_type" className="selectbox" onChange={this.handleTypeChange} options={rec_types} value={this.state.rec_type} defaultValue={rec_types[0]} />
            <div className='datetime' style={{ display: this.state.rec_type.value !== 'now' ? '' : 'none' }}>
              <p>Date</p>
              <DatePicker className="datepicker" id="datepicker"
                onChange={this.handleChange}
                selected={this.state.day} />
              <p>Time</p>
              <input type="time" id="time" className="tbox-style" />
            </div>
            <div>
              <p> Recording Length</p>
              <input type="number" id="rec_minute" className="tbox-style" defaultValue="90"></input>sec
            </div>
            <div>
              <p> Channel </p>
              <Select className="selectbox" id="channel" options={this.state.channels} value={this.state.select_channel} onChange={this.handleChangeChannel} />
            </div>
          <button onClick={this.addSchedule}>add</button>
          <button onClick={this.closeModal}>close</button>
        </Modal>
      </div>
    );
  }
}
export default AddPopup
