### 1. Cài đặt thư viện
`npm i express ejs nodemon body-parser`

### 2. Cấu hình Server
```js
    const express = require('express');

    const PORT = process.env.PORT || 3000;

    const app = express();

    app.get("/", (req, res) => {
        res.send('Hello');
    })

    app.listen(PORT, () => console.log(`App listening port -> ${PORT}`))
```

### 3. Cấu hình các midleware & config view engine
```js
    //config parser -> get data from form
    app.use(bodyParser.urlencoded({ extended: true }));

    //config view engine
    app.set('view engine', 'ejs');
    app.set('views', './views'); // create folder view is application view
```

### 4. Tạo view cho index
```html
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Home</title>

        <style>
            body {
                width: 90vw;
                height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <table border="1" style="width: 500px;">
                <caption>Danh sách sản phẩm</caption>
                <tr>
                    <th>Mã SP</th>
                    <th>Tên SP</th>
                    <th>Số Lượng</th>
                    <th>Hình ảnh</th>
                    <th>Lựa chọn</th>
                </tr>

            </table>
        </div>
    </body>

    </html>
```

### 5. Cài đặt sdk aws
`npm i aws-sdk`

### 6. Config sdk cho server
- Đầu tiên phải có 1 user trên IAM để lấy quyền truy cập dymongoDB.
    - B1: Mở IAM trên aws console -> Tìm IAM
    - B2: Chọn vào users
    - B3: Add user -> Thực hiện điền thông tin
        - Điền username
        - Chọn: `Access key - Programmatic access`
        - Chọn `Attach existing policies directly`
        - Tìm `AmazonDynamoDBFullAccess`
        - Chọn và nhất next.
        - Tải file user về
    - B4: Tạo mật khẩu cho user vừa tạo
        - Chọn IAM
        - Chọn vào user
        - Chọn tab security
        - Tạo ở `Console password`
- config ở file index
    - B1: import thư viện
    ```js
        const AWS = require('aws-sdk');

        //config sdk
        const config = new AWS.Config({
            accessKeyId: 'YOUR_KEY_ID',
            secretAccessKey: 'YOUR_SECRETACCESSKEY',
            region: 'YOUR_REGION'
        });
        AWS.config = config;

        const docClient = new AWS.DynamoDB.DocumentClient();

        const tableName = 'Products';
    ```
    - B2: Lấy data từ server
    ```js
        //get all data from dymongoDB
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
    ```

### 7. Thêm 1 item vào dymongoDB

```js
    //index.js
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
```

```html
    <!-- add-product.ejs -->
    <div class="container">
        <h4>Thêm sản phẩm</h4>
        <form action="/products" method="post">
            <div class="container-form">
                <div class="form-item">
                    <label for="">Mã sản phẩm: </label>
                    <input type="text" name="id">
                </div>
                <div class="form-item">
                    <label for="">Tên sản phẩm:</label>
                    <input type="text" name="name">
                </div>
                <div class="form-item">
                    <label for="">Số lượng</label>
                    <input type="text" name="number">
                </div>
                <input class="btn" type="submit" value="Thêm">
            </div>
        </form>
    </div>
```
### 8. Xóa một item trong dymongoDB
```html
    <a href="/delete/<%=product.id%>">Xóa</a>
```

```js
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

```