const request = require("request");
const fs = require('fs')
const start = 0;
const data = [];
const products = require('./products.json');
const status = require('./status.json');
const startIndex = status ? status.startIndex:0;

const main = async()=>{

    //get list of products
    // for (let i = 0; i < 50; i++){
    //     const result = await getData(`https://tiki.vn/api/v2/products?limit=200&page=${i+1}`);
    //     data.push(...result.data)
    // }
    // console.log(data.length)
    // fs.writeFileSync('./products.json', JSON.stringify(data), 'utf8');

    //get product details
    const productDetails = [];

    for (let i = startIndex; i < products.length; i++){
        const jobs = [];
        const pId = products[i].id;
        
        console.log('get', pId);
        const productDetails = await getData(`https://tiki.vn/api/v2/products/${pId}`);
        console.log(productDetails)
        const images = productDetails.images;
        fs.mkdirSync('./images/' + pId, { recursive: true });
        fs.mkdirSync('./products', { recursive: true });
        fs.writeFileSync('./products/' + i + '-' + pId + '.json', JSON.stringify(productDetails), 'utf8');
        images && images.forEach(img => {
            if (img.base_url) jobs.push(download(img.base_url, './images/' + pId + '/base_url.jpg'));
            if (img.large_url) jobs.push(download(img.large_url, './images/' + pId + '/large_url.jpg'));
            if (img.medium_url) jobs.push(download(img.medium_url, './images/' + pId + '/medium_url.jpg'));
            if (img.small_url) jobs.push(download(img.small_url, './images/' + pId + '/small_url.jpg'));
            if (img.thumbnail_url) jobs.push(download(img.thumbnail_url, './images/' + pId + '/thumbnail_url.jpg'));
        });
        if (productDetails.video_url) jobs.push(download(productDetails.video_url, './images/' + pId + '/video_url.mp4'));
        await Promise.all(jobs);
        fs.writeFileSync('./status.json', JSON.stringify({startIndex: i + 1}, 'utf8'));
    }
}

const getData = (url)=>{
    return new Promise(resolve=>{
        request({
            method: 'GET',
            url,
            json: true,
            headers: {'Content-Type': 'application/json'},
        }, (error, response, body)=>{
            resolve(body);
        });
    })
}

const download = async(url, path)=>{
    return new Promise(resolve=>{
        const stream = fs.createWriteStream(path);
        stream.on('close', ()=>{
            resolve(true);
        })
        request(url).pipe(stream)
    })
}
main();