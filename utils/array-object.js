/**
 * 6.8.0 thêm hàm delay (obj, mili) // xử lý bất đồng bộ trả về promise
 * 
 * 6.7.1 fix hàm
 * 
 * 6.7.0 Sửa ngày 29/03/2020 thêm hàm convertArray2Object chuyển đổi từ mảng sang đối tượng nhanh
 * 
 * 6.6.1 Sửa ngày 23/03/2020 parse JSON lỗi trả về undifined
 * 
 * 6.6.0 Ngày 21/03/2020 Thêm hàm chuyển đổi arr sang obj theo key
 * 
 * Sửa phân cách số 2 dấu thập phân phân cách bằng dấu . thay dấu ,
 * 
 * 6.5.0 Ngày 13/01/2020 thêm hàm getPhoneFromText 
 * 
 * 6.4.2 Ngày 21/12/2019 thêm hàm chuyển đổi kết quả trả về json web như google
 * getJsonStringify(json) return string, parse all fields
 * 
 * 6.4.1 Ngày 19/12/2019 thêm
 * Thêm tổng trọng số cho $sum_weight cùng cấp để tính toán nhanh
 * 
 * 6.4 Ngày 16/12/2019 bỏ createObjectKey với trường length
 * thay bằng Object.keys(obj).length
 * 
 * 6.3 Ngày 8/11/2019
 * Fix bug lỗi vòng lặp vô hạn khi so sánh ở hàm
 * orderArrayObjects
 * 
 * 6.2 Ngày 07/11/2019
 * BugFix: hàm createTreeWeight, trả về $isLeaf đúng giá trị của nó
 * 
 * 6.1 Ngày 31/10/2019
 * Thêm hàm sắp xếp mảng đối tượng theo order
 * 
 * ver 6.0 Sửa ngày 14/10/2019
 * Thêm hàm chạy multi-thread trong javascript 
 * 
 * ver 5.1
 * Chỉnh sửa ngày 27/08/2019
 * Thêm các chỉ mục hình cây $tree_index, $index, $is_leaf, $level 
 * Cho treeOrder
 * 
 * ver 5.0
 * ngày 25/08/2019
 * Thêm vào các đối tượng của cây
 * Chỉnh sửa cây order
 * 
 * ver 4.0 
 * Thêm hàm phân định hàng nghìn cho số
 * ngày 20/6/2019
 * 
 * ver 3.0 
 * get email trong text và get url trong text
 * 12/06/2019
 * 
 * array-object - cuong.dq
 * version 2.0
 * 18/05/2019
 * convertTree2Order: 
 * Chuyển đổi array cấu trúc cây (cha, con) 
 * trở về cấu trúc phẳng được sắp xếp theo thứ tự 
 * như connect by của oracle
 * 
 * version 1.5
 * 07/05/2019
 * 
 * createObject,
 * Clone
 * Tree,
 * Matrix,
 * Json lowercase
 * json to sql for db request
 * 
 */
"use strict"
/////////////////////////////////////////


/**
 * Chuyển đổi một mảng sang một đối tượng
 * ex: arr = [{id:1,value:223},{id:2,value:433}]
 * => {1:{id:1,value:223},2:{id:2,value:433}}
 * @param {*} arrOfObj    // Mảng đầu vào
 * @param {*} distinctKey // thuộc tính duy nhất ex:id -- nếu không có thì chuyển mảng thuần sang
 */
const convertArrayToObject = (arrOfObj, distinctKey) => {
    if (!arrOfObj) return {};
    return arrOfObj.reduce((obj, item) => (obj[distinctKey ? item[distinctKey] : item] = item, obj), {});
}

/**
 * Chuyển đổi một mảng sang đối tượng
 * Sử dụng để unique theo key và gán vào html một cách nhanh nhất
 * @param {*} array 
 * @param {*} key 
 */
const convertArrayToObjects = (array, key) => {
    if (!array && !Array.isArray(array)) return {};
    return array.reduce((obj, item) => {
        let items = obj[item[key]] ? obj[item[key]].concat([item]) : [item];
        if (item[key]) obj[item[key]] = items;
        return obj
    }, {})
};

/**
 * Hàm chuyển đổi thành string từ đối tượng để truyền dữ liệu lên hoặc xuống
 * @param {*} jsonObj 
 */
const getJsonStringify = (jsonObj) => {
    return JSON.stringify(
        jsonObj // đối tượng json đầu vào
        , (key, value) => { // hàm chuyển đổi kết quả trước khi chuyển string
            // nếu giá trị của thuộc tính là null thì không truyền đi
            if (value === null) return undefined
            // nếu tên thuộc tính là các trường theo quy định của cuongdq (lưu dưới dạng json string) thì phải chuyển đổi ngược trước khi chuyển để truyền 
            if ((
                key === "roles"
                || key === "job_list"
                || key === "organization_list"
                || key === "staff_list"
                || key === "signature"
                || key === "voted_users"
                || key === "commented_users"
                || key === "category_history"
                || key === "cur_organization_history"
                || key === "attach_id_list"
                || key === "status_chain"
                || key === "intent_ids"
                || key === "machine_response"
                || key === "ajax_default"
            )
                && value !== null
                && value.length > 0) {
                try {
                    return JSON.parse(value)
                } catch (e) {
                    console.log('parse getJsonStringify error', e)
                    return undefined
                }
            }
            return value
        }
        , 2 // thêm ký tự xuống dòng và dịch index 2 ký tự để định dạng hiển thị dễ thấy nhất
    )
}

/**
 * Sắp xếp thứ tự theo alphabe tiếng việt, quốc tế
 * @param {*} arr 
 * @param {*} key 
 */
const orderArrayObjects = (arr, keys) => {
    return arr.sort(
        function (a, b) {
            if (Array.isArray(keys)) {
                // Nếu có nhiều key thì duyệt và so sánh từng key
                let idx = 0;
                // Lấy key đầu tiên, nếu == thì xét tiếp key tiếp theo
                let orderReturn = Intl.Collator().compare(a[keys[idx]], b[keys[idx]]);
                while (orderReturn === 0 && idx <= keys.length) { //bug fix 08/11/2019 Lỗi vòng lặp vô hạn
                    idx++;
                    orderReturn = Intl.Collator().compare(a[keys[idx]], b[keys[idx]]);
                    // console.log('orderReturn',orderReturn);
                }
                // trường hợp > hoặc < thì nhảy ra ko cần so sánh tiếp làm gì
                return orderReturn;
            } else {
                // Nếu chỉ có một keys thì so sánh ngay
                return Intl.Collator().compare(a[keys], b[keys]);
            }
        })
}

/**
 * tra ve gia tri max trong day [{field:value}]
 * @param {*} arrIn 
 * @param {*} fieldIn 
 */
const getMaxValue = (arrIn, fieldIn) => {
    return Math.max.apply(Math, arrIn.map((o) => { return o[fieldIn] }));
}


/**
 * Hàm lấy thời gian hiện tại dạng yyyy-mm-dd hh24:mi:ss
 */
const getTimestamp = () => {
    let curDate = new Date();
    //let yyyy_mm_dd_hh24_mi =  
    return ("" + curDate.getFullYear()).padStart(4, 0) + "-" + ("" + (curDate.getMonth() + 1)).padStart(2, 0) + "-" + ("" + curDate.getDate()).padStart(2, 0) + " " + ("" + curDate.getHours()).padStart(2, 0) + ":" + ("" + curDate.getMinutes()).padStart(2, 0) + ":" + ("" + curDate.getSeconds()).padStart(2, 0);
}

/**
* Hàm chạy nhiều thread cùng lúc cho một mảng dữ liệu
* @param {*} inputArray // mảng cần đưa vào
* @param {*} maxThread  // số phiên cần chạy
* @param {*} callBackPromise // hàm callback xử lý element kiểu promise
Ví dụ:
// Để chạy multiThread thì gọi hàm này
multiThreadRuning(arrayInput, 50
    , (el) => { // đối tượng el lấy được như trong mảng
        return new Promise((resolve, reject) => {
            // ở đây ta xử lý đối tượng el
            // nếu là hàm đồng bộ thì xong thì trả về 
            // resolve(result); // xong

            // nếu hàm bất đồng bộ thì đợi xong thì trả về
            setTimeout(() => {
                //console.log('doi tuong',el);
                resolve(el); // xong ví dụ trả về luôn el
            }, 500); // giả sử 1 phiên, tần suất xử lý là 1 giây thì ta chia nhiều phiên sẽ nhanh hơn

        })
    }
)
    .then(data => {
        console.log(data); // kết quả thực thi xong
    });
*/
const multiThreadRuning = (inputArray, inputMaxThread, callBackPromise) => {
    // biến hoàn thành được đếm cho đến khi số thread hoàn thành thì mới thoát ra
    let countAll = { finishAll: 0 };

    // neu so luong bang ghi khong du cho thread thi chi tao du cac thread do thoi
    let maxThread = inputArray.length < inputMaxThread ? inputArray.length : inputMaxThread;

    return new Promise(resovleAll => {

        // chạy theo số lượng thread này
        for (let i = 0; i < maxThread; i++) {
            // định nghĩa biến đếm số lượng chạy được trong thread
            Object.defineProperty(countAll, 'count_' + i, { value: 0, writable: true, enumerable: true, configurable: true });
            // thực hiện tạo thread để chạy 
            new Promise(async (resovle) => {

                console.log(getTimestamp(), 'Thread_' + i + ' started...');

                let count = 0;
                for (let idx = 0; idx < inputArray.length; idx++) {
                    // nếu index mà chia cho số lượng thread có số dư bằng chính id của thread thì thực thi, còn lại thì thôi bỏ qua
                    if (idx % maxThread === i) {

                        // ---- *************************** -----//
                        let el = inputArray[idx];

                        if (callBackPromise) {
                            try {
                                await callBackPromise(el) // chạy lệnh callback chờ kết quả để trả về
                            } catch (e) {
                                console.log(getTimestamp(), 'Err on callback Promise:', e)
                            }
                        }
                        // ---- *************************** -----//

                        count++; // tăng số lượng bảng ghi được chạy lên
                    }
                }

                // sau khi chạy xong kiểu đồng bộ thì đếm số lượng này
                console.log(getTimestamp(), 'Thread_' + i + ' Finish!');

                // sau khi chạy xong của vòng lặp này, kết quả sẽ trả về số lượng bảng ghi đã duyệt qua
                resovle(count); // trả về kết quả đã duyệt qua

            })
                .then( // cho thực thi luôn thread này
                    result => {
                        // kết quả xong của thread sẽ ghi lại biến
                        countAll['count_' + i] = result; // kết quả bảng ghi của thread thứ i
                        countAll['finishAll']++; // hoàn thành được 1 thread tăng lên cho đến khi xong thì mới thoát ra
                    }
                )

        } // vòng lặp được chạy tuần tự cho đến khi kết quả của một thread xong thì mới chạy qua thread khác

        // cứ thiết lập thời gian 1 giây kiểm tra kết quả 1 lần, 
        var intervalLoop = () => {
            // cứ 1 giây thì gọi hàm này 1 lần để kiểm tra kết quả
            setTimeout(() => {
                //  Nếu kết quả chưa hoàn thành thì tiếp tục chờ phiên kế tiếp
                if (countAll['finishAll'] < maxThread) {
                    intervalLoop();             //  gọi lại kiểm tra giây tiếp theo nhé
                } else {
                    console.log(getTimestamp(), 'Finish all with ' + countAll['finishAll'] + ' thread(s)');
                    resovleAll(countAll); // kết quả trả về toàn bộ
                }
            }, 1000)
        }


        intervalLoop(); // gọi hàm kiểm tra để lấy kết quả
        // định thời gian để quá giờ thì tự thoát luôn???
    })
}

/**
 * Đọc nội dung để lấy số điện thoại (hoặc number)
 * @param {*} content 
 */
const getPhoneFromText = (content) => {
    let phones = [];
    content.replace(/(([0-9])+)/gim
        , phone => {
            phones.push(phone);
        })
    return phones;
}

/**
 * đọc nội dung để lấy ds email
 * @param {*} content 
 */
const getEmailFromText = (content) => {
    let emails = [];
    content.replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
        , email => {
            emails.push(email);
        })
    return emails;
}

/**
 * đọc nội dung để lấy các đường dẫn liên kết
 * @param {*} content 
 */
const getLinkFromText = (content) => {
    let links = [];
    content.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
        , url => {
            links.push(url);
        })
    return links;
}

/**
 * Hàm tự thêm vào đối tượng cho trước một giá trị
 * @param {*} obj ex: {}
 * @param {*} key ex: new_key
 * @param {*} value ex: 1
 * return {new_key:1}
 * writable: cho phep thay doi gia tri sau khi dinh nghia hay khong
 * enumerable: cho phep su dung vong lap for (let key in object) va Object.keys
 * configurable: cho phep thay doi cau truc cua doi tuong, cho phep delete obj[key]
 * http://arqex.com/967/javascript-properties-enumerable-writable-configurable
 */
const createObjectKey = (obj, key, value) => {
    Object.defineProperty(obj, key, { value: value, writable: true, enumerable: true, configurable: true });
    return obj;
}

const deleteObjectKey = (obj, key) => {
    return delete obj[key];
}

/**
 * clone đối tượng thành đối tượng mới (sử dụng để gán đối tượng mới)
 * @param {*} obj 
 */
const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Hàm chuyển đổi các key chữ hoa sang chữ thường (oracle => sqlite phù hợp)
 * @param {*} obj 
 */
const ConvertKeysToLowerCase = (obj) => {
    var output = {};
    for (let i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.toLowerCase()] = ConvertKeysToLowerCase(obj[i]);
        } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
            output[i.toLowerCase()] = [];
            output[i.toLowerCase()].push(ConvertKeysToLowerCase(obj[i][0]));
        } else {
            output[i.toLowerCase()] = obj[i];
        }
    }
    return output;
};


/**
   * Ham chuyen doi mot doi tuong json thanh cau lenh sqlJson 
   * su dung de goi lenh db.insert/update/delete/select
   * vi du: 
   * convertSqlFromJson(dual_table,{x:null,y:1},['y'])
   * return : {name:dual_table,cols:[{name:x,value:null},{name:y,value:1}],wheres:[name:y,value:1]}
   * Cau lenh tren su dung de:
   *  select x,y from dual_table where y=1;
   * hoac:
   *  update dual_table x=null, y=1 where y=1;
   * hoac 
   *  delete
   * hoac
   * insert
   * @param {*} tableName 
   * @param {*} obj 
   * @param {*} wheres 
   */
const convertSqlFromJson = (tablename, json, idWheres) => {
    let jsonInsert = { name: tablename, cols: [], wheres: [] }
    let whereFields = idWheres ? idWheres : ['id'];
    for (let key in json) {
        jsonInsert.cols.push({ name: key, value: json[key] });
        if (whereFields.find(x => x === key)) jsonInsert.wheres.push({ name: key, value: json[key] })
    }
    return jsonInsert;
}


/**
 * Tự tính trọng số thành phần, gán trọng số cha, trọng số con, và trọng số so với root
 * Trả về các trường thông tin trọng số
 * $weight_percent
 * $parent_weight_percent$
 * $root_weight_percent 
 * @param {*} arrIn      //mảng dữ liệu đầu vào
 * @param {*} idKey      //tên trường đánh mã duy nhất
 * @param {*} parentKey  //tên trường liên hệ mã cấp trên
 * @param {*} weightKey  //tên trường chứa trọng số
 * @param {*} startWith  //lấy giá trị ban đầu (nếu có)
 * @param {*} level      //lấy độ sâu (nếu có)
 * @param {*} rootWeight //Lấy trọng số cấp trên (nếu có)
 * @param {*} arrOut     //biến dữ liệu ra (nếu có)
 */

/**
* Tự tính trọng số thành phần, gán trọng số cha, trọng số con, và trọng số so với root
* Trả về các trường thông tin trọng số
* 
   '$sum_weight': 
   '$weight_percent': 1,
   '$parent_weight_percent': 0.1,
   '$root_weight_percent': 0.1,
   '$level': 3,
   '$index': 1,
   '$tree_index': '4.1.1',
   '$is_leaf': 1 
* 
 * @param {*} arrIn 
 * @param {*} idKey 
 * @param {*} parentKey 
 * @param {*} weightKey 
 * @param {*} startWith 
 * @param {*} level 
 * @param {*} rootWeight 
 * @param {*} arrOut 
 * @param {*} parentIndex 
 */
const createTreeWeight = (arrIn, idKey, parentKey, weightKey, startWith, level, rootWeight, arrOut, parentIndex) => {

    let arrReturns = arrOut ? arrOut : []; //sắp xếp lại

    let myLevel = level ? level : 1;
    // lấy luôn lá cây -- phải thêm dấu == Ngày 07/11/2019
    if (arrIn && arrIn.length >= arrReturns.length) {
        let parents = arrIn.filter(obj => (obj[parentKey] === startWith)
            || (startWith == null && obj[parentKey] == undefined)
            || (startWith == undefined && obj[parentKey] == null)
        )
        if (parents && parents.length > 0) {
            // đã có một mãng cùng cấp, hãy tính toán trọng số cho nó
            // Tính tổng thành phần của cùng cấp này
            let sumWeight = parents.map((o) => { return o[weightKey] }).reduce((a, b) => a + b, 0)
            parents.forEach((el, idx) => {
                // Ghi tổng trọng số thành phần cùng cấp
                el.$sum_weight = sumWeight;
                // Tỷ trọng % thành phần
                el.$weight_percent = el[weightKey] / sumWeight;
                // khi tạo con, trọng số cấp cha phải được ghi xuống cấp con bằng trọng số 
                el.$parent_weight_percent = rootWeight ? rootWeight : 1;
                // giá trị có thể lấy trước đó
                //(el.$parent_weight_percent===undefined||el.$parent_weight_percent===null)?1:el.$parent_weight_percent;
                // root_weight_percent cấp trên xuống cấp dưới = 
                // Tỷ trọng % so với gốc
                el.$root_weight_percent = el.$parent_weight_percent * el.$weight_percent;

                el.$level = myLevel;
                el.$index = idx + 1; //ghi số thứ tự trong cùng cấp
                el.$tree_index = (parentIndex ? parentIndex + '.' : '') + el.$index; //Ghi số thứ tự theo hình cây

                arrReturns.push(el); //gán gốc cây
                //tìm tiếp lá cây nếu có thì gán vào
                //     createTreeWeight = (arrIn, idKey, parentKey, weightKey, startWith, level, rootWeight, arrOut, parentIndex)
                return createTreeWeight(arrIn, idKey, parentKey, weightKey, el[idKey], myLevel + 1, el.$root_weight_percent, arrReturns, el.$tree_index)
                // return createTreeOrder(arrIn, idKey, parentKey, el[idKey], myLevel + 1, arrReturns, el.$tree_index)
            });
        } else { //đây là lá cây
            let objCur = arrReturns.find(obj => (obj[idKey] === startWith));
            if (objCur) objCur.$is_leaf = 1;
        }
    }

    return arrReturns;
}

/**
 * tạo cây có thứ tự sắp xếp như oracle
 * trả về trật tự cây từ gốc cây, cành, lá,
 * sửa lại để có cây trả về, thay vì phải khai báo trước biến
 * Trả về cấu trúc cây, $level, $index, $tree_index, $is_leaf 
  * @param {*} arrIn  Mãng vào
  * @param {*} idKey  Khóa id
  * @param {*} parentKey khóa cha
  * @param {*} startWith giá trị bắt đầu (tùy chọn)
  * @param {*} level độ sâu của cây (tự sinh - tùy chọn)
  * @param {*} arrOut mãng ra (tự sinh)
  * @param {*} parentIndex index cha (tự sinh)
  */
const createTreeOrder = (arrIn, idKey, parentKey, startWith, level, arrOut, parentIndex) => {

    let arrReturns = arrOut ? arrOut : []; //sắp xếp lại

    let myLevel = level ? level : 1;
    //bug dấu = mới gán được $is_leaf của bản ghi cuối cùng
    if (arrIn && arrIn.length >= arrReturns.length && idKey && parentKey) {
        let parents = arrIn.filter(obj => (obj[parentKey] === startWith)
            || (startWith == null && obj[parentKey] == undefined)
            || (startWith == undefined && obj[parentKey] == null)
            || (startWith == undefined && obj[parentKey] == '')
        )
        if (parents && parents.length > 0) {
            parents.forEach((el, idx) => {
                el.$level = myLevel;
                el.$index = idx + 1; //ghi số thứ tự trong cùng cấp
                el.$tree_index = (parentIndex ? parentIndex + '.' : '') + el.$index; //Ghi số thứ tự theo hình cây
                arrReturns.push(el);
                return createTreeOrder(arrIn, idKey, parentKey, el[idKey], myLevel + 1, arrReturns, el.$tree_index)
            });
        } else { //đây là lá cây
            let objCur = arrReturns.find(obj => (obj[idKey] === startWith));
            if (objCur) objCur.$is_leaf = 1;
        }
    }

    return arrReturns;
}

/**
 * Cây có item.$children = []
 * @param {*} arrIn 
 * @param {*} idKey 
 * @param {*} parentKey 
 * @param {*} startWith 
 * @param {*} level 
 */
const createTree = (arrIn, idKey, parentKey, startWith, level) => {
    let myLevel = level ? level : 1;
    var roots = arrIn.filter(x =>
        (x[parentKey] === startWith)
        || (startWith == null && x[parentKey] == undefined)
        || (startWith == undefined && x[parentKey] == null)
        || (startWith == undefined && x[parentKey] == '')
    );
    if (roots && roots.length > 0) {
        roots.forEach(el => {
            el.$level = myLevel;
            el.$children = createTree(arrIn, idKey, parentKey, el[idKey], myLevel + 1)
        })
        return roots;
    } else {
        let leafChildren = arrIn.find(x => x[idKey] === startWith);
        if (leafChildren) {
            leafChildren.$is_leaf = 1;
        }
        return undefined;
    }
}

/**
 * Chuyen doi cay co cau truc parent-subs/$children...->root:$id,$parent_id,$level
 * @param {*} treeIn 
 * @param {*} idSub 
 * @param {*} level 
 */
const convertTree2Order = (treeIn, idSub, id, parent_id, level) => {

    let myId = id ? id : 1;
    let myLevel = level ? level : 1;
    var roots = [];

    treeIn.forEach((el, idx) => {
        el.$id = myId;
        el.$parent_id = parent_id;
        roots.push(el);
        if (el[idSub]) {
            roots = roots.concat(convertTree2Order(el[idSub], idSub, (myId + 1), myId, (myLevel + 1)))
        }
        myId = roots.length + 1;
    });

    return roots;
}


const compare2Objects = (a, b, isSameKey, isSameValue) => { //la giong nhau cau truc hoan toan isSame
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);
    if ((isSameKey || isSameValue) && aProps.length !== bProps.length) return false;
    for (let i = 0; i < aProps.length; i++) if (isSameValue && a[aProps[i]] !== b[aProps[i]]) return false;
    for (let i = 0; i < aProps.length; i++) if (bProps.find(x => x === aProps[i]) === undefined) return false;
    return true;
}

//const colxrow = {col:0,row:0,width:100,align:'right',color:'red'}; //co the thay doi mat na toa do diem nay them thuoc tinh
const getMatrix = (maskMatrix, data, point) => {
    var colxrow = point ? point : { col: 0, row: 0 };
    var matrix = [];
    var PrintMatrix = (objPrintMatrix, dataObject) => {
        for (let key of Object.keys(objPrintMatrix)) {
            if (Array.isArray(objPrintMatrix[key])) {
                objPrintMatrix[key].forEach((x, idx) => {
                    if (isEquikeylent(colxrow, x)) {
                        x.value = dataObject[key][idx];
                        if (x.value !== undefined && x.value !== null && x.value !== '') matrix.push(clone(x));
                    } else {
                        if (Array.isArray(x)) {
                            console.log('ARRAY KHONG XU LY: ', key, idx, x);
                        } else {
                            if (dataObject[key] && dataObject[key][idx]) PrintMatrix(x, dataObject[key][idx]);
                        }
                    }
                })
            } else {
                if (isEquikeylent(colxrow, objPrintMatrix[key])) {
                    let x = objPrintMatrix[key];
                    x.value = dataObject[key];
                    if (x.value !== undefined && x.value !== null && x.value !== '') matrix.push(clone(x));

                } else {
                    if (dataObject[key]) PrintMatrix(objPrintMatrix[key], dataObject[key]);
                }
            }
        }

    }
    PrintMatrix(maskMatrix, data);
    return matrix;
}

/**
 * Chuyển đổi số thành chuỗi
 * Thay dấu . thành dấu , và phân cách bằng dấu .
 * @param {*} x 
 * @param {*} ch 
 */
const numberWithSeparator = (x, ch) => {
    // return x && !isNaN(x) ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ch ? ch : ".") : x;
    return x && !isNaN(x) ? x.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ch ? ch : ".") : x;
}


const delay = (obj, delayMiliSecond) => {
    return new Promise(rs => {
        let milisecond = delayMiliSecond || 60000;  // đợi 10 giây để nhận key
        let startTime = Date.now();
        let intervalObj = setInterval(() => {
            // nếu đã có rồi thì lấy luôn key đã tạo để sử dụng
            if ((obj && obj.length) || (Date.now() - startTime > milisecond)) {
                rs("OK")
                clearInterval(intervalObj);
                intervalObj = null;
            }
        }, 1000)
    })


}

module.exports = {

    convertArrayToObject,   // Chuyển đổi arr sang obj
    convertArrayToObjects,  // chuyển đổi mảng sang đối tượng key

    getJsonStringify, // Định dạng chuỗi của json để truyền đi

    orderArrayObjects, // Sắp xếp thứ tự theo một trường

    getMaxValue, // Lấy giá trị cực đại
    getTimestamp, // lấy thời gian hiện tại yyyy-mm-dđ hh24:mi:ss
    multiThreadRuning, // chạy đa luồng

    clone,
    deleteObjectKey,
    createObjectKey,


    convertSqlFromJson,
    ConvertKeysToLowerCase,

    createTreeWeight,  //Tính toán trọng số và sắp xếp trật tự theo cây
    createTreeOrder,  //sap xep lai trat tu theo cay
    createTree,  //tao tree -->children
    convertTree2Order,  //tao array from tree (the sample TreeOrder)

    compare2Objects, //so sanh 2 object
    getMatrix, //tao ma tran in

    getPhoneFromText,
    getEmailFromText,
    getLinkFromText,

    //Chuyển đổi số thành chuỗi với phân định hàng nghìn (bằng ký tự bất kỳ)
    numberWithSeparator,

    // hàm trể và kiểm tra độ dài đối tượng truyền vào có thì xem như hoàn thành trước
    delay
};