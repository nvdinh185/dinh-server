"use strict"

/**
 * 
 * version 4.0 tích hợp xử lý lấy req.token luôn cho tiện
 * 
 * version 3.0 
 * Chỉnh sửa upload không tạo file
 * 
 * version 2.0
 * Chỉnh sửa nội dung cho phép lưu file trong đường dẫn phụ tự định nghĩa từ client 
 * sau đường dẫn của biến dirUpload (nếu có: subdirectory)
 * Chuyển đổi các tham số có options (là các chuỗi json gốc chuyển ngược lại)
 * Tham số options sẽ chứa trong thuộc tính file luôn
 * 
 * json_data không có thì sẽ không trả về req.json_data
 * 
 * version 1.0
 * cuongdq
 * create 01/12/2018
 * Thực hiện nhận dữ liệu post lên từ JsonData hoặc từ FormData
 * Lưu file vào đường dẫn định trước qua biến dirUpload
 * và trả kết quả cho req.json_data hoặc req.form_data
 * 
 * các đường dẫn lưu file sẽ sắp xếp theo tháng/ngày /giờ(nếu cần)
 * 
 */
//đường dẫn lưu file khi nhận FormData ở đâu?
const arrObj = require('./array-object');

const fs = require('fs');
const url = require('url');
const systempath = require('path');
const mime = require('mime-types');
const formidable = require('formidable');

const dirUpload = 'upload_files';

if (!fs.existsSync(dirUpload)) fs.mkdirSync(dirUpload);

/**
 * Lưu file xuống đĩa, trả về thành công hoặc thất bại
 * @param {*} filename 
 * @param {*} data 
 */
var saveToDish = (filename, data, options) => {
  return new Promise((resolve, reject) => {
    // lưu kiểu cũ
    fs.createReadStream(data)
      .pipe(fs.createWriteStream(filename));

    resolve(filename);

    /* fs.writeFile(filename, data, options ? options : {}, function (err) {
      if (err) {
        //console.log('Lỗi tạo file', err);
        reject(err);
      } else {
        //console.log('File created 3', filename);
        resolve(filename)
      }
    }); */


  })
}



/**
 * body formdata => req.form_data (file save in dirUpload )
 * eg: /upload_files/yyyymm/dd/hhmmss_filesize_filename
 * return req.form_data.params/files = {key_i:value_i}/{key_i:{url:...}}
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var formProcess = (req, res, next) => {

  const form = new formidable.IncomingForm();

  // chạy lưu file tuần tự xuống đĩa trực tiếp
  // hoặc lưu một lúc nhiều file theo thread
  form.parse(req, async (err, fields, files) => {
    let formData = { params: {}, files: {} };

    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Parse Formdata Error', error: err }));
    } else {

      for (let key in fields) {

        //chuyển đổi các biến có chữ options thì parse thành json
        //version 2.0
        if (key.indexOf("options") >= 0) {
          try {
            fields[key] = JSON.parse(fields[key]);
          } catch (e) { }
        }

        //gan them thuoc tinh dynamic
        Object.defineProperty(formData.params, key, {
          value: fields[key], //gia tri bien duoc bind vao bindVars.p_in_0,1,...n
          writable: false, //khong cho phep sua du lieu sau khi gan gia tri vao
          enumerable: true //cho phep gan thanh thuoc tinh truy van sau khi hoan thanh
        });
      }

      // đây là yêu cầu mới từ client lưu trong đường dẫn phụ này
      let dirUploadNew = dirUpload;
      let subdirectory = formData.params["subdirectory"];
      if (subdirectory) {
        if (!fs.existsSync(dirUpload + systempath.sep + subdirectory)) fs.mkdirSync(dirUpload + systempath.sep + subdirectory);
        dirUploadNew = dirUpload + systempath.sep + subdirectory; //đưa đường dẫn phụ vào để không thay đổi đường dẫn gốc
      }


      // Kiểm tra yêu cầu ghi xuống đĩa không, nếu không thì không cần ghi
      let isSaveToDish = formData.params["save_to_dish"] !== 'NO'; // trạng thái lưu xuống đĩa

      let count_file = 0;
      for (let key in files) {

        let curdatetime = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '');
        let curMonth = curdatetime.slice(0, 6);
        let curDate = curdatetime.slice(6, 8);
        let curTime = curdatetime.slice(9)
        if (!fs.existsSync(dirUploadNew + systempath.sep + curMonth)) fs.mkdirSync(dirUploadNew + systempath.sep + curMonth);
        if (!fs.existsSync(dirUploadNew + systempath.sep + curMonth + systempath.sep + curDate)) fs.mkdirSync(dirUploadNew + systempath.sep + curMonth + systempath.sep + curDate);

        //luu file theo duong dan he thong
        let filenameStored = dirUploadNew + systempath.sep
          + curMonth + systempath.sep
          + curDate + systempath.sep
          //+ curTime + "_"
          + files[key].size + "_"
          + files[key].name;

        //duong dan truy cap kieu web
        let urlFileName = filenameStored.replace(new RegExp('\\' + systempath.sep, 'g'), "/");

        // cách ghi xuống đĩa kiểu stream này chưa biết khi nào ghi xong???
        /* fs.createReadStream(files[key].path)
            .pipe(fs.createWriteStream(filenameStored)); */

        // cách ghi xuống đĩa kiểu file bình thường
        // Sau khi ghi xong mới trả kết quả về, nếu không, tiến trình đọc là ko có dữ liệu
        // chờ ghi xuống đĩa xong từng file một, mới trả kết quả về nhé
        if (isSaveToDish) { // nếu yêu cầu không ghi xuống thì bỏ qua
          try {
            await saveToDish(filenameStored, files[key].path);
            // lưu xong thì mới chạy tiếp vòng lặp
          } catch (e) {
            console.log('Lỗi ghi file xuống đĩa', e);
          }
        }

        count_file++;

        let contentType = 'image/jpeg';
        if (mime.lookup(files[key].name)) contentType = mime.lookup(files[key].name);

        //vi da tinh hop le cua token roi
        Object.defineProperty(formData.files, key, {
          value: {
            url: urlFileName              // đường dẫn chuyển url web để lấy file
            , path_name: filenameStored   // đường dẫn lưu trữ file gốc
            , file_blob: files[key].path  // dữ liệu con trỏ blob để đọc lại không cần ghi xuống đĩa
            , file_name: files[key].name  // tên file đơn thuần không có đường dẫn
            , file_size: files[key].size  // kích cỡ của file
            , file_type: contentType      // kiểu của file
            , options: formData.params["options_" + key] // tham số tùy chọn mà user gửi lên
          }, //gia tri bien duoc bind vao bindVars.p_in_0,1,...n
          writable: false, //khong cho phep sua du lieu sau khi gan gia tri vao
          enumerable: true //cho phep gan thanh thuoc tinh truy van sau khi hoan thanh
        });

      }

      formData.params.count_file = count_file;
      req.form_data = formData;

      next();
    }
  });
}


/**
 * body json => req.json_data
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var jsonProcess = (req, res, next) => {
  let postDataString = '';
  req.on('data', (chunk) => {
    postDataString += chunk;
  });
  req.on('end', () => {
    try {
      req.json_data = JSON.parse(postDataString);
    } catch (err) { }
    next();
  })
}

// xử lý lấy token bằng nhiều phương thức, tích hợp vào postHandler luôn cho tiện
const getToken = (req, res, next) => {
  //lấy token trên header truyền qua các phương thức kèm header
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  //lấy token theo phương thức kèm url, truyền qua phương thức ?token=
  if (!token) token = url.parse(req.url, true, false).query.token;
  //lấy token theo phương thức post kèm json_data;
  if (!token) token = req.json_data ? req.json_data.token : undefined; //lay them tu json_data post

  //lấy token đã biên dịch các hàm trước next hoặc token ở trên
  req.token = req.token ? req.token : token;

  //cắt bỏ chuỗi Bearer nếu nó có kèm trong token (cái này dùng trong interceptor)
  req.token = req.token && req.token.startsWith('Bearer ') ? req.token.slice(7) : req.token;

  // cắt bỏ các chuổi tiếp đầu ngữ khác nếu có quy định của client giao tiếp gửi lên token

  //trả hàm tiếp theo xử lý với kết quả req.token
  next();
}

module.exports = {
  jsonProcess,
  formProcess,
  getToken
};