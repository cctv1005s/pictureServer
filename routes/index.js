var router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const config = require('../config.json');
const shortid = require('shortid');

//网络路径
const netPath = `http://${config.host}:${config.port}/`;

router.post('/picture',function*(next){
    var req = this.req;
    var res = this.res;
    const data = yield saveFiles(req);
    this.body = JSON.stringify(data);
});

const util  = {
    // 遍历对象
    objForEach: function (obj, fn) {
        let key, result
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result = fn.call(obj, key, obj[key])
                if (result === false) {
                    break
                }
            }
        }
    }
};

function saveFiles(req) {
    return new Promise((resolve, reject) => {
        const imgLinks = [];
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                reject('formidable, form.parse err', err.stack);
            }

            // 存储图片的文件夹
            const storePath = path.resolve(__dirname, '..', config.storeFolder);
            if (!fs.existsSync(storePath)) {
                fs.mkdirSync(storePath)
            }
            // 遍历所有上传来的图片
            util.objForEach(files, (name, file) => {
                // 图片临时位置
                const tempFilePath = file.path
                // 图片名称和路径
                var fileSuf = (file.name.match(/.*\.(.*)/)[1])||"";
                const fileName = shortid.generate() + "." +fileSuf;
                const fullFileName = path.join(storePath, fileName);
                // 将临时文件保存为正式文件
                fs.renameSync(tempFilePath, fullFileName);
                // 存储链接
                imgLinks.push(netPath + fileName);
            })

            // 返回结果
            resolve({
                errno: 0,
                data: imgLinks
            })
        })
    })
}


module.exports = router;
