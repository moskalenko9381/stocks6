import React, {Component} from "react";


export class TDselect extends Component {
    render() {
        const value = this.props;

        function sendSocket(e) {
            console.log('test');
            value.socket.emit('lows', {value: e.target.value, stock: value.name});
        }

        if (value.low === "uniform")
            return (
                <td>
                    <select disabled={value.auctionStarted} onChange={sendSocket} className="w3-select">
                        <option> normal</option>
                        <option selected="selected"> uniform</option>
                    </select>
                </td>
            );
        return (
            <td>
                <select disabled={value.auctionStarted} onChange={sendSocket} className="w3-select">
                    <option> uniform </option>
                    <option selected="selected"> normal </option>
                </select>
            </td>
        );

    }
}
