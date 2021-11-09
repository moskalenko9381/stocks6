import 'w3-css/w3.css'
import React, { Component }  from 'react';
import axios from "axios";

export class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {name: ""};
        this.enter = this.enter.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        const style = {
            width: "50px"
        }
    }
    onChange(e) { this.setState({name: e.target.value}); }
    onKeyPress(e) { if(e.key === 'Enter') this.enter(); }

    enter() {
        let result = '';

        const body = {name: this.state.name};
        axios.post('http://localhost:3001/login', body)
            .then(response => {
                result = response.data.position;
                if (result === "") {
                    window.location.assign(`http://localhost:3000/notfound`);
                    return;
                }
                window.location.assign(`http://localhost:3000/${result}`);
            })
    };

        render() {
            return (
                <div id="enter" style={this.style} className="w3-container w3-centered w3-pale-green w3-text-brown">
                    <h1> Stock exchange </h1>
                    <input onChange={this.onChange} onKeyPress={this.onKeyPress} placeholder="Name of user" autoFocus={true} className="w3-input w3-text-brown"/>
                    <button onClick={this.enter} className="w3-margin w3-btn w3-center w3-centered w3-green w3-hover-yellow"> Enter </button>
                </div>
            )
        }

}
