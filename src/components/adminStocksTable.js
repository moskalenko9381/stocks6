import React, {Component} from 'react';
import {TDselect} from "./tdSelect";




export class TableStocks extends Component {
    render() {
        const stocks = this.props.stocks;
        const auctionStarted = this.props.auctionStarted;
        const socket = this.props.socket;

        const items = stocks.map((stock) => {
            return <td key={stock.name}> {stock.name} </td>
        });

        const counts = stocks.map((stock) => {
            return <td key={stock.name}> {stock.count} </td>
        });

        const lows = stocks.map((stock) => {
            return <TDselect key={stock.name} low={stock.low}
                             name={stock.name} auctionStarted={auctionStarted}
                             socket={socket}/>
        });

        return (
            <table className="w3-table-all w3-card-4 w3-margin-top">
                <tr className="w3-green">
                    {items}
                </tr>
                <tr>
                    <td className="w3-pale-green"> Count </td>
                    {counts}
                </tr>
                <tr>
                    <td className="w3-pale-green"> Low of price </td>
                    {lows}
                </tr>
            </table>
        );
    }
}
