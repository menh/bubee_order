//app.js
App({
  onLaunch: function () {
    //清空订单缓存
    wx.setStorageSync('orderInfo', []);
    wx.setStorageSync('orderDetail', []);
    wx.setStorageSync('good', []);
    wx.setStorageSync('address', []);

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    const self = this;
    // 登录
    //获取授权
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    //调用微信登录接口
    wx.login({  
      success: function (res) {
        console.log(res.code);
        var code=res.code;
        if(res.code){
          self.getOpenid(code); 
         // self.globalData.openid = "o9P4b5CcgFHTMNr5DxRfnibP-WIM";
         // console.log('topay');
         // self.toPay();
        }
        else{
          console.log('获取用户登陆状态失败'+res.errMsg)
        }
      }  
    });
    self.getMapSchool();
    self.getMapDormitory();
   
  },

  getMapSchool: function () {
    const self = this;
    wx.request({
      url: self.globalData.serverIp + 'getMapSchool.do',
      data: {},
      method: 'POST',
      "Content-Type": "applciation/json",
      success: function (res) {
        var mapSchoolName = res.data;
        self.globalData.mapSchoolName = mapSchoolName;
        wx.setStorageSync("mapSchoolName", mapSchoolName);
      },
      fail: function (res) {

      }
    });
  },
  
  getMapDormitory: function () {
    const self = this;
    wx.request({
      url: self.globalData.serverIp + 'getMapDormitory.do',
      data: {},
      method: 'POST',
      "Content-Type": "applciation/json",
      success: function (res) {
        var mapDormitoryName = res.data;
        self.globalData.mapDormitoryName=mapDormitoryName;
        wx.setStorageSync("mapDormitoryName", mapDormitoryName);
      },
      fail: function (res) {

      }
    })
  },

  unifiedorder: function (res) {
    const self=this;
    var body = "测试支付"
    var openid = self.globalData.openid;
    var total_fee = 1
    var notify_url = "http://localhost/notify"
    var mch_id = '1505544541'
    var attach = "测试"
    this.order(attach, body, mch_id, openid, total_fee, notify_url);
    /*  .then(function (data) {
        console.log('data--->', data, 123123)
        res.json(data)
      })*/
  },
  raw: function (args) {
    var keys = Object.keys(args)
    keys = keys.sort()
    var newArgs = {}
    keys.forEach(function (key) {
      newArgs[key] = args[key]
    })
    var string = ''
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k]
    }
    string = string.substr(1)
    return string
  },
  // 随机字符串产生函数  
  createNonceStr: function () {
    return Math.random().toString(36).substr(2, 15)
  }, 
  // 时间戳产生函数  
  createTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000) + ''
  },
  // 支付md5加密获取sign
  paysignjs: function (appid, nonceStr, packages, signType, timeStamp) {
    var ret = {
      appId: appid,
      nonceStr: nonceStr,
      package: packages,
      signType: signType,
      timeStamp: timeStamp
    }
    var string = this.raw(ret)
    string = string + '&key=' + key
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex')
    return sign.toUpperCase()
  },
  // 统一下单接口加密获取sign
  paysignjsapi: function (appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
    var ret = {
      appid: appid,
      attach: attach,
      body: body,
      mch_id: mch_id,
      nonce_str: nonce_str,
      notify_url: notify_url,
      openid: openid,
      out_trade_no: out_trade_no,
      spbill_create_ip: spbill_create_ip,
      total_fee: total_fee,
      trade_type: trade_type
    }
    var key='174414';
    var string = this.raw(ret)
    string = string + '&key=' + key
    var crypto = require('/pages/cryptojs/cryptojs.js').Crypto;
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex')
    console.log('sign: '+sign);
    return sign.toUpperCase()
  },
  // 下单接口
  order: function (attach, body, mch_id, openid, total_fee, notify_url) {

    var bookingNo = 'davdian' + this.createNonceStr() + this.createTimeStamp()
    var appid = "wx03b68c995d8d5409";
    var nonce_str = this.createNonceStr()
    var timeStamp = this.createTimeStamp()
    var url = "https://api.mch.weixin.qq.com/pay/unifiedorder"
    
    var formData = "<xml>"
    formData += "<appid>" + appid + "</appid>" //appid  
    formData += "<attach>" + attach + "</attach>" //附加数据  
    formData += "<body>" + body + "</body>"
    formData += "<mch_id>" + mch_id + "</mch_id>" //商户号  
    formData += "<nonce_str>" + nonce_str + "</nonce_str>" //随机字符串，不长于32位。  
    formData += "<notify_url>" + notify_url + "</notify_url>"
    formData += "<openid>" + openid + "</openid>"
    formData += "<out_trade_no>" + bookingNo + "</out_trade_no>"
    formData += "<spbill_create_ip>203.195.196.254</spbill_create_ip>"
    formData += "<total_fee>" + total_fee + "</total_fee>"
    formData += "<trade_type>JSAPI</trade_type>"
    formData += "<sign>" + this.paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, bookingNo, '203.195.196.254', total_fee, 'JSAPI') + "</sign>"
    formData += "</xml>"
   /* var self = this
    request({
      url: url,
      method: 'POST',
      body: formData
     }, 
     function (err, response, body) {
      if (!err && response.statusCode == 200) {
        var prepay_id = self.getXMLNodeValue('prepay_id', body.toString("utf-8"))
        var tmp = prepay_id.split('[')
        var tmp1 = tmp[2].split(']')
        //签名  
        var _paySignjs = self.paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp)
        var args = {
          appId: appid,
          timeStamp: timeStamp,
          nonceStr: nonce_str,
          signType: "MD5",
          package: tmp1[0],
          paySign: _paySignjs
        }
        deferred.resolve(args)
      } else {
        console.log(body)
      }
    })*/
   // return deferred.promise;
},

  getOpenid:function(code){
    console.log("getOpenid");
    const self=this;
     wx.request({
      url: this.globalData.serverIp + 'getWxOpenId.do',
      method: 'POST',
      data:{code:code},
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
      
        console.log(res.data);
        //self.globalData.openid ="o9P4b5CcgFHTMNr5DxRfnibP-WIM";
        self.globalData.openid =res.data
        self.getCustomerId();
       // self.unifiedorder(res);
      },
      fail: function (res) {
        console.log('获取商品列表失败');
      }
    })
  },
  getCustomerId:function(){
    console.log("getCustomerId");
    const self=this;
    wx.request({
      url: this.globalData.serverIp + 'getCustomerId.do',
      method: 'POST',
      data:{
        openId: self.globalData.openid
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {

        console.log(res.data);
        //self.globalData.openid ="o9P4b5CcgFHTMNr5DxRfnibP-WIM";
        self.globalData.customerId = res.data
        self.getAddressListByCustomerId();
      },
      fail: function (res) {
        console.log('获取商品列表失败');
      }
    })

  },

  //通过客户ID获得客户地址
  getAddressListByCustomerId: function () {
    console.log("getAddressListByCustomerId");
    const self = this;
    wx.request({
      url: self.globalData.serverIp + 'getAddressListByCustomerId.do',
      data: {
        customerId: self.globalData.customerId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.setStorageSync('address', res.data)
        console.log(res.data);
      },
      fail: function (res) {

      }
    })
  },

  formatTime: function (date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute, second].map(this.formatNumber).join(':')
  },
  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },


  globalData: {
    serverIp: 'http://localhost:8080/bubee/',
   // serverIp:'http://203.195.196.254:8080/bubehttp/',
    //serverIp:'http://www.gzfjcyd.com:8080/bubehttp/',
    //serverIp: 'https://203.195.196.254/bube/',
    //serverIp:'https://www.gzfjcyd.com/',
    openid:'',
    customerId: '',
    appid:'wx03b68c995d8d5409',
    secret:"084abe624d5da0e8464c6f6e0224fd27",
    addressId:"",
    pantrymanId:"",
    sumAmt:0,
    mapSchoolName:[],
    mapDormitoryName:[],

    userInfo: null
  }
})