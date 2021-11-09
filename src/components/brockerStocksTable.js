import 'w3-css/w3.css'
import React, { Component }  from 'react';


export function StocksTableBrocker(props) {
    const buy = props.buy;
    const items = buy.map((stock) => {
        return <td key={stock.stock}> {stock.stock} </td>
    });
    const counts = buy.map((stock) => {
        return <td key={stock.stock}> {stock.buy} </td>
    });

    const price = buy.map((stock) => {
        return <td key={stock.stock}> {parseInt(stock.buy) * parseInt(stock.price)} </td>
    });
    return (
        <table className="w3-table-all w3-centered w3-card-4 w3-margin-top">
            <caption className="w3-green"> <b>My stocks</b></caption>
            <tr className="w3-pale-green">
                <td> Stock </td>
                {items}
            </tr>
            <tr>
                <td className="w3-pale-green"> Count of bought </td>
                {counts}
            </tr>
            <tr>
                <td className="w3-pale-green"> Price now (of all) </td>
                {price}
            </tr>
        </table>
    );
}
