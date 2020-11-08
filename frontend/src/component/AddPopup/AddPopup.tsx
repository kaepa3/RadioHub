import React from 'react';
import Modal from 'react-modal';
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

interface IState {
  modalIsOpen: boolean
  subtitle: string
}

class AddPopup extends React.Component<{}, IState>{
  constructor(props: {}) {
    super(props);
    this.state = {
      modalIsOpen: false,
      subtitle: "suber"
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
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
          <h2>ModalWindow</h2>
          <div>Opend</div>
          <button onClick={this.closeModal}>close</button>
        </Modal>
      </div>
    );
  }
}
export default AddPopup
