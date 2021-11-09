var express = require('express');
var router = express.Router();
var users = require('../json/users.json')
var stocks = require('../json/stocks.json')
var settings = require('../json/settings.json')
const fs = require("fs");

const io = require('socket.io')(3030, {
    cors: {
        origin: '*'
    }
});

function writeToStocks() {
    fs.writeFile("/Users/limosk/WebstormProjects/stocks6/server/json/stocks.json", JSON.stringify(stocks), (err) => {
        if (err) throw err;
    });
}

let currentUser

function randNorm() {
    let t = 0;
    let n = 3;
    for (let i = 0; i < n; ++i)
        t += Math.random();
    return t/n;
}

function getRandomInRange(min, max, low) {
    if (low === 'normal') {
        return Math.abs(Math.round(min + ((randNorm() - 0.5) * max * 2)));
    }
    return Math.abs(Math.round(min + ((Math.random() - 0.5) * max * 2)));
}

router.get("/notfound", (req, res) => {
  res.send("Brocker not found")
})

router.post("/login", (req, res) => {
    for(let user of users) {
        if(user.name === req.body.name) {
            currentUser = user
            console.log("cur user " + currentUser)
            res.json({position: 'brocker', stocks: stocks, user: user})
            return;
        }
    }
    if(req.body.name === "admin")
        res.json({position: 'admin', stocks: stocks, brockers: users})
    else
        res.json({position: ""});
});

router.get('/brocker', function (req, res) {
    res.json({brocker: currentUser, stocks: stocks});
});

router.get('/admin', function (req, res) {
    res.json({users: users, stocks: stocks});
});

let admin = ''
let auctionStarted = false
let arrayInterval = settings.interval.split(":");
let interval = parseInt(arrayInterval[0])*60*1000 + parseInt(arrayInterval[1])*1000;
let randomInterval

io.on('connection', (socket) => {
    console.log('connect socket');
    socket.on('test', () => {
        console.log('emit test');
    })
    socket.on('connect', () => {
        console.log('connected');
    })
    socket.on('hello', (msg) => {
        console.log('hello got')
        socket['name'] = msg.name;
        if(msg.name === "admin")
            admin = socket.id;
    });

    socket.on('action', (msg) => {
        socket.json.emit('action', msg);
        socket.broadcast.json.emit('action', msg);
    });

    socket.on('disconnect', (msg) => {
        console.log('disconnected')
    });

    socket.on('start', () => {  // цена изменяется с интервалом
        console.log('test');
        io.emit('start');
        auctionStarted = true;
        randomInterval = setInterval(() => {
            let test = [];
            for(let stock of stocks) {
                stock.price = getRandomInRange(stock.price, stock.maxValue, stock.low)
                test.push(stock.price);
            }
            console.log(test)
            socket.broadcast.json.emit('change', {msg: 'Price changed', value: test});
        }, interval);
    });

    socket.on('lows', (msg) => {
        console.log('lows signal')
        for(let stock of stocks) {
            if (stock.name === msg.stock) {
                stock.low = msg.value;
                writeToStocks()
                break;
            }
        }
    });
});

module.exports = router;
