//import libraries
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

//create port
const PORT = process.env.PORT || 3000;

//init app with express
const app = express();

//config parser -> get data from form
app.use(bodyParser.urlencoded({ extended: true }));

//config view engine
app.set('view engine', 'ejs');
app.set('views', './views')


//config sdk
const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
    region: 'ap-southeast-1'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'Products';

//init router
app.get("/", (req, res) => {
    const params = {
        TableName: tableName
    }

    docClient.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            res.send('Internal server error');
        } else {
            return res.render('index', { products: data.Items });
        }
    })

})

app.get('/add-products', (req, res) => {
    res.render('add-product');
})

app.post('/products', (req, res) => {
    const { id, name, number } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            "id": id,
            "name": name,
            "number": number
        }
    }

    docClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
            res.send('Internal server error');
        } else {
            console.log(data);
            return res.redirect('/');
        }
    })
})

app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);

    const params = {
        TableName: tableName,
        Key: {
            "id": id
        }
    }

    docClient.delete(params, (err, data) => {
        if (err) {
            console.log(err);
            res.send('Internal server error');
        } else {
            console.log(data);
            return res.redirect('/');
        }
    })
})

app.listen(PORT, () => console.log(`App listening port -> ${PORT}`))