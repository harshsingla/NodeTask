const router = require('express').Router();
const Scraper = require('images-scraper');
const jimp = require('jimp');
const keywordsModel = require('../db/connection');
const google = new Scraper.Google();
router.post('/submit',(req,response)=>{
    const keyword = req.body.keyword;
    keywordsModel.findOneAndUpdate({keyword},{keyword},{upsert:true,returnNewDocument: true},(err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log('Keyword added');
        }
    })
    console.log(req.body);
    google.list({
      keyword: keyword,
      num: 15,
      detail: true
      // nightmare: {
      //     show: true
      // }
    }).then(function (res) {
        console.log('first 10 results from google', res);
        //response.send(res);
        for(let key in res){
            console.log(key,res[key].url);
            jimp.read(res[key].url).then(file=> {
                file.resize(100, 100) // resize
                    .quality(50) // set JPEG quality
                    .greyscale() // set greyscale
                    .write('public/images/'+ keyword + [key] +'.jpg'); // save
            }).catch(function (err) {
                console.error(err);
            });
        }
        response.status(200).json({status:"S",message:'Scrapping successfull'});
    }).catch(function(err) {
        console.log('err', err);
        response.status(500).json({status:"E",message:'Scrapping failed'});
    });
});
router.get('/history',(req,res)=>{
    keywordsModel.find((err,doc)=>{
        if(err){
            console.log(err);
            res.status(500).json({status:"E",message:'internal db error'});
        }
        else{
            console.log(doc);
            let data = [];
            for(let key in doc){
                data.push(doc[key].keyword);
            }
            res.status(200).json({status:"S",message:'Docs found',doc:data});
        }
    })
})
module.exports = router;
