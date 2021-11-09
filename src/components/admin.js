// @flow
import 'w3-css/w3.css'
import React, { Component }  from 'react';
import axios from "axios";
import {TableStocks} from "./adminStocksTable";
import io from "socket.io-client";


function TrUser(props) {
    const brocker = props.brocker;
    const items = brocker.stocks.map((stock) =>
        <td key={stock.name}> {stock.count} </td>
    );

    return (
            <tr className="w3-hover-pale-green">
                <td>{brocker.name}</td>
                <td>{brocker.money}</td>
                {items}
            </tr>
            );
}

function TrStock(props) {
    const stocks = props.stocks;
    const items = stocks.map((stock) =>
        <td key={stock.name}> {stock.name} </td>
    );

    return (
        <tr className="w3-sand">
            <td> Participant </td>
            <td> Balance </td>
            {items}
        </tr>
    );
}

export class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            brockers: [],
            isLoaded: false,
            auctionStarted: false
        };

        this.start = this.start.bind(this);
        this.startUserStockInfo = this.startUserStockInfo.bind(this);
    }

    startUserStockInfo(name) {return {name: name, count: 0};}   // количество акций каждого вида

    componentDidMount() {  // метод сразу после вставки в Dom
        console.log('did mount');
        const URL = 'http://localhost:3030'
        const transports = ['websocket', 'polling', 'flashsocket'];

        this.socket = io(URL, {transports: transports});
        console.log('socket connection status: ' + this.socket.connected);

        this.socket.on('connect_error', (err) => {
            console.log('connect error: ' + err);
        });

        this.socket.on('connect', () => {this.socket.json.emit("hello", {"name": "admin"});});
        this.socket.on('action', (msg) => {
            let currentUsers = this.state.brockers;
            for (let i = 0; i < currentUsers.length; i++) {
                if (currentUsers[i].name === msg.name) {
                    for (let j = 0; j < currentUsers[i].stocks.length; j++) {
                        if (currentUsers[i].stocks[j].name === msg.stock) {
                            if (msg.action === 'buy') {
                                currentUsers[i].stocks[j].count += parseInt(msg.count);
                                currentUsers[i].money -= msg.deltaMoney;
                            } else if (msg.action === 'sold'){
                                currentUsers[i].stocks[j].count -= parseInt(msg.count);
                                currentUsers[i].money += msg.deltaMoney;
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            this.setState({partners: currentUsers});
        });

        this.socket.on('start', () => {
            this.setState({auctionStarted: true}); });
        this.socket.on('end', () => { this.setState({auctionStarted: false}); });
        axios.get('http://localhost:3001/admin').then((result) => {
            let users = result.data.users;
            for(let user of users) {
                user.stocks = [];
                for(let i = 0; i < result.data.stocks.length; i++) {
                    user.stocks.push(this.startUserStockInfo(result.data.stocks[i].name))
                }
            }
            this.setState({stocks: result.data.stocks, brockers: result.data.users, isLoaded: true});
        });
    }

    start() {
        if (!this.socket.connected) {
            console.log('socket not connected');
            const URL = 'http://localhost:3030'
            const transports = ['websocket', 'polling', 'flashsocket'];

            this.socket = io(URL, {transports: transports});
            this.socket.emit('start');
        } else {
            console.log('socket connected');
            this.socket.emit('start');
        }
    }

    render() {
        console.log('render')
        const {stocks, brockers, isLoaded, auctionStarted} = this.state;
        if (!isLoaded)
            return <h2> Couldn't connect to server (port 3001) </h2>;
        const items = brockers.map((brocker) => {
            return <TrUser key={brocker.name} brocker={brocker}/>
        });

        return (
            <div className="w3-center w3-margin" >
                    <h3 className="w3-container w3-green"><b> Admin page </b></h3>
                <table className="w3-table-all  w3-card-4">
                    <tr className="w3-pale-green">
                        <td colSpan="2"> Broker </td>
                        <td colSpan={stocks.length}> Bought stocks </td>
                    </tr>
                    <TrStock stocks={stocks}/>
                    {items}
                </table>

                <TableStocks stocks={stocks} auctionStarted={auctionStarted} socket={this.socket}/>

                <button onClick={this.start} disabled={auctionStarted} className="w3-button w3-margin w3-green w3-hover-yellow">
                    Start stocks exchange! </button>
            </div>
        )
    }
}
