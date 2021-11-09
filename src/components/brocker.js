import 'w3-css/w3.css'
import React, { Component }  from 'react';
import openSocket from "socket.io-client";
import axios from "axios";
import {StocksTableBrocker} from "./brockerStocksTable";

export class Brocker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            brocker: {money: 10},
            isLoaded: false,
            market: {
                stock: '',
                count: 0,
                action: 'buy'
            },

            buy: [],
            startMoney: 0,
            auctionStarted: false
        };
        this.socket = openSocket('http://localhost:3030');
        console.log('socket connection status: ' + this.socket.connected)
        this.socket.on("connect", () => {
            this.socket.json.emit("hello", {"name": this.state.brocker.name});
        });
        this.socket.on('action', (msg) => {
            let allStocks = this.state.stocks;
            let buy = this.state.buy;
            let partnerName = this.state.brocker.name;

            for (let i = 0; i < allStocks.length; i++) {
                if (allStocks[i].name === msg.stock) {
                    if (msg.action === 'buy') {
                        allStocks[i].count -= parseInt(msg.count);
                        if (msg.name === partnerName)
                            buy[i].buy += parseInt(msg.count);
                    }
                    else {
                        allStocks[i].count += parseInt(msg.count);
                        if (msg.name === partnerName)
                            buy[i].buy -= parseInt(msg.count);
                    }
                    break;
                }
            }
            this.setState({stocks: allStocks, buy: buy});
        });

        this.socket.on('change', (msg) => {
            let allStocks = this.state.stocks;
            let buy = this.state.buy;
            for (let i = 0; i < msg.value.length; i++) {
                allStocks[i].price = msg.value[i];
                buy[i].price = msg.value[i];
            }
            this.setState({stocks: allStocks, buy: buy});
        });

        this.socket.on('start', () => {
            this.setState({auctionStarted: true});
        });
        this.socket.on('end', () => {
            this.setState({auctionStarted: false});
        });

        this.changeCount = this.changeCount.bind(this);
        this.changeStock = this.changeStock.bind(this);
        this.changeAction = this.changeAction.bind(this);
        this.action = this.action.bind(this);
    }

    changeCount(e) {
        let temp = this.state.market;
        temp.count = e.target.value;
        this.setState({market: temp});
    }

    changeStock(e) {
        let temp = this.state.market;
        temp.stock = e.target.value;
        this.setState({market: temp});
    }

    changeAction(e) {
        let temp = this.state.market;
        temp.action = e.target.value;
        this.setState({market: temp});
    }

    action() {
        let market = this.state.market;
        let nameBrocker = this.state.brocker.name;
        let stocks = this.state.stocks;
        let brocker = this.state.brocker;
        let buy = this.state.buy;
        let deltaMoney = 0;
        if(market.count <= 0 || market.count === undefined || market.count === null) {
            window.alert('Enter amount of stocks you want to buy!');
            return;
        }
        if(market.action === 'sold') {
            for(let i = 0; i < stocks.length; i++) {
                if(stocks[i].name === market.stock) {
                    if(buy[i].buy < market.count) {
                        window.alert('Not enough stocks to sell!');
                        return;
                    }
                }
            }
        }

        for(let elem of stocks) {
            if(elem.name === market.stock) {
                deltaMoney = market.count * elem.price;
                let newMoney = 0;
                if(market.action === 'buy') {
                    newMoney = parseInt(brocker.money) - deltaMoney;
                    if(newMoney < 0) {
                        window.alert('Not enough money!');
                        return;
                    }
                } else {
                    newMoney = parseInt(brocker.money) + deltaMoney;
                }
                brocker.money = newMoney;
                break;
            }
        }
        this.setState({brocker: brocker});
        this.socket.json.emit("action", {'stock': market.stock, 'count': market.count, 'action': market.action,
            'name': nameBrocker, 'deltaMoney': deltaMoney});
    }

    componentDidMount() {
        axios.get('http://localhost:3001/brocker')
            .then((result) => {
                let market = this.state.market;
                market.stock = result.data.stocks[0].name;
                let array = [];

                for(let i = 0; i < result.data.stocks.length; i++) {
                    let value = {};
                    value.stock = result.data.stocks[i].name;
                    value.buy = 0;
                    value.price = result.data.stocks[i].price;
                    array.push(value);
                }
                console.log(result.data.brocker.money);
                this.setState({stocks: result.data.stocks, brocker: result.data.brocker, isLoaded: true, market: market, buy: array,
                    startMoney: result.data.brocker.money});
            });
    }


    render() {
        const {stocks, brocker, isLoaded, market, buy, startMoney, auctionStarted} = this.state;
        if (!isLoaded)
            return <h1> Couldn't connect to server (port 3001) </h1>;
        else {
            const items = stocks.map((stock) => {
                return <option key={stock.name}> {stock.name} </option>
            });

            const stockNames = stocks.map((stock) => {
                return <td key={stock.name}> {stock.name} </td>
            });

            const stockCounts = stocks.map((stock) => {
                return <td key={stock.name}> {stock.count} </td>
            });

            const stockPrices = stocks.map((stock) => {
                return <td key={stock.name}> {stock.price} </td>
            });

            return (
                <div className="w3-margin w3-center w3-container">
                    <h2 className="w3-container w3-green"><b> Current brocker page </b></h2>
                    <table className="w3-table-all w3-centered w3-card-4 w3-margin-top" id="microTable">
                        <tr className="w3-pale-blue">
                            <td> Brocker name </td>
                            <td> Balance money now </td>
                            <td> Profit money</td>
                        </tr>
                        <tr>
                            <td>{brocker.name}</td>
                            <td>{brocker.money}</td>
                            <td>{brocker.money - startMoney}</td>
                        </tr>
                    </table>



                    <StocksTableBrocker buy={buy} />

                    <table className="w3-table-all w3-centered w3-card-4 w3-margin-top w3-margin-bottom">
                        <caption className="w3-green"><b> Exchange market </b></caption>
                        <tr className="w3-pale-green">
                            <td> Stock name </td>
                            {stockNames}
                        </tr>
                        <tr>
                            <td className="w3-pale-blue"> Count now </td>
                            {stockCounts}
                        </tr>
                        <tr>
                            <td className="w3-pale-blue"> Current price of one stock </td>
                            {stockPrices}
                        </tr>
                    </table>



                    <div className="w3-center w3-container w3-margin-top" id="panel">
                            <h3 className="w3-green"><b> Deal </b></h3>
                        <select onChange={this.changeStock} className="w3-select">
                            {items}
                        </select>
                        <input type="number" min="0" step="1" placeholder="Amount of stocks" onChange={this.changeCount}
                               className="w3-input"/>
                        <select onChange={this.changeAction} className="w3-select">
                            <option> buy </option>
                            <option> sold </option>
                        </select>
                        <button onClick={this.action} disabled={!auctionStarted}
                                className="w3-margin-top w3-button w3-pale-green w3-hover-yellow"> Make a deal </button>
                    </div>
                </div>
            )
        }
    }

}
