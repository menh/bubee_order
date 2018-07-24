const app = getApp()
Page({
  data:{
    school: ['中山大学', '华南师范'],
    dormitory: ['慎一', '慎二'],
    orderDetail:[ ],
    indexS:0,
    indexD:0,
    orderError:false,
    cart:[],
    orderInfo:"",
    address:"",
    totalPrice:0,
    serverIp:'',
    customerId:'',
    mapSchoolName:{},
    mapDormitoryName:{}
  },
  onLoad:function()
  {
    const self=this;
    var orderDetail = wx.getStorageSync('orderDetail') || [];
    self.setData({
      orderDetail: orderDetail,
      serverIp: app.globalData.serverIp,
      customerId: app.globalData.customerId
    })
  },

  minCount:function(e)
  {
    const self=this;
    var goodId = e.target.dataset.goodid;
    var orderDetail = wx.getStorageSync('orderDetail') || [];
    var cart = self.data.cart;
    for(var i=0;i<orderDetail.length;i++){
      if(orderDetail[i].goodId==goodId)
      {
        if(orderDetail[i].goodNum>0)
        {
          orderDetail[i].goodNum = orderDetail[i].goodNum-1;
          cart[i].goodNum = orderDetail[i].goodNum;
        }
      }
    }
    self.setData({
      cart:cart
    });
    wx.setStorageSync('orderDetail', orderDetail);
    self.getTotalPrice();
  },

  addCount: function (e) {
    const self=this;
    var goodId = e.target.dataset.goodid;
    var orderDetail = wx.getStorageSync('orderDetail') || [];
    var cart = self.data.cart;
    for (var i = 0; i < orderDetail.length; i++) {
      if (orderDetail[i].goodId == goodId) {
          orderDetail[i].goodNum = orderDetail[i].goodNum + 1;
          cart[i].goodNum = orderDetail[i].goodNum;
      }
    }
    self.setData({
      cart: cart
    })
    wx.setStorageSync('orderDetail',orderDetail);
    self.getTotalPrice();
  },

  getTotalPrice: function () {
    const self = this;
    var orderDetail = wx.getStorageSync('orderDetail') || [];
    var good = wx.getStorageSync('good') || [];
    var totalPrice = 0;
    for (var i = 0; i < orderDetail.length; i++) {
      var price = 0;
      var num = 0;
      for (var j = 0; j < good.length; j++) {
        if (good[j].goodId == orderDetail[i].goodId) {
          price = good[j].price;
          num = orderDetail[i].goodNum;
          break;
        }
      }
      totalPrice =totalPrice + price * num;
    }
    self.setData({
      totalPrice: totalPrice
    })
  },

  addOrderDetail:function(){
    const self=this;
    var orderDetail = wx.getStorageSync('orderDetail') || [];
    var orderInfo =self.data.orderInfo;

    for (var i = 0; i < orderDetail.length; i++) {
      orderDetail[i].orderId = orderInfo.orderId;
    }
    wx.setStorageSync('orderDetail', orderDetail);

    wx.request({
      url: self.data.serverIp + 'addOrderDetail.do',
      data: JSON.stringify(orderDetail),
      method: 'POST',
      "Content-Type": "applciation/json",
      success: function (res) {
        wx.showToast({
          title: '下单成功',
          icon: 'succes',
          duration: 1000,
          mask: true,
          success: function () {


            self.wxPay();
            /*setTimeout(function () {
              wx.setStorageSync('orderDetail', '');
              wx.navigateTo({
                url: '../mainPage/mainPage',
              })
            }, 1000)
            */
          }
        });
        
      },
      fail: function (res) {
        
      }
    })
  }, 
  addOrderInfo:function(){
    const self = this;
    var orderInfo = [];
    wx.request({
      url: self.data.serverIp + 'addOrderInfo.do',
      data: {
        customerId: self.data.customerId,
        addressId: self.data.address.addressId,
        orderTime: app.formatTime(new Date()),
        orderStatus: 0,
        sumAmt: self.data.totalPrice
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.setData({
          orderInfo: res.data
        })
        self.addOrderDetail();
      },
      fail: function (res) {
        console.log("addOrderInfo");
      }
    });
  },
  placeAnOrder:function(){ 
    const self=this;
    self.addOrderInfo();
  },
  wxPay:function(){
    const self=this;
    console.log(self.data.totalPrice);
    console.log(app.globalData.openid);
    wx.request({
      url: self.data.serverIp + 'getPayParamers.do',
      data: {
        totalFee: self.data.totalPrice,
        openId:app.globalData.openid
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.toPay(res.data);
      },
      fail: function (res) {

      }
    });
  },

  toPay: function (args) {
    const self = this;
    console.log(args);
    wx.requestPayment(
      {
        'timeStamp': args.timeStamp,
        'nonceStr': args.nonceStr,
        'package': args.package,
        'signType': 'MD5',
        'paySign': args.paySign,
        'success': function (res) {
          setTimeout(function () {
            wx.navigateTo({
              url: '../mainPage/mainPage',
            })
          }, 100)
         },
        'fail': function (res) { },
        'complete': function (res) { }
      })
  },
  getMapSchool: function () {
    const self = this;
    wx.request({
      url: self.data.serverIp + 'getMapSchool.do',
      data: {},
      method: 'POST',
      "Content-Type": "applciation/json",
      success: function (res) {
        var mapSchoolName = res.data;
        self.setData({
          mapSchoolName: mapSchoolName
        })
        wx.setStorageSync("mapSchoolName", mapSchoolName);
      },
      fail: function (res) {
        
      }
    });
  },
  getMapDormitory: function () {
    const self = this;
    var orderList = self.data.orderList;
    wx.request({
      url: self.data.serverIp + 'getMapDormitory.do',
      data: {},
      method: 'POST',
      "Content-Type": "applciation/json",
      success: function (res) {
        var mapDormitoryName = res.data;
        self.setData({
          mapDormitoryName: mapDormitoryName
        })
        wx.setStorageSync("mapDormitoryName", mapDormitoryName);
      },
      fail: function (res) {
        
      }
    })
  },
})