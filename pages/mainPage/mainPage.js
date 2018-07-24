const app = getApp()
Page({
  data:{
    serverIp:'',
    good:[],//[goodId,{goodName:,goodPic:,salePrice:,goodNum:,selectNum:}] 
    orderDetail:{
      orderid:"",
      goodId:"",
      goodNum:""
    },
    totalNum:0,
    totalPrice:0,
    indicatorDots: false,
    autoplay: false,
    interval: 3000,
    duration: 800,
    goodsBarLabel:[
      { name: '外卖', id: 'waimai' },
      { name: '夜宵', id: 'yexiao' }
    ],
    toView:'waimai',
    curIndex:0,
    msgList:['暑假快乐','来年再见','考试顺利'],
    address:{},
    mapSchoolName:{},
    mapDormitoryName:{},
    school:['中山大学','华南师范'],
    dormitory:['慎一','慎二'],
    room:325,
    indexS: 0,
    indexD: 0,
    showModal:false
  },

  onLoad:function(){
    const self=this;
    self.setData({
      serverIp: app.globalData.serverIp
    });
    setTimeout(self.initData,3000);
    
  },
  initData:function(){
    const self=this;
    self.setAddress();
    
  },
  switchTab:function(e){
    this.setData({
      toView: e.target.dataset.id,
      curIndex: e.target.dataset.index
    })
  },
  setAddress:function(){
    const self=this;
    var address = wx.getStorageSync('address');
    console.log(address);
    for (var i = 0; i < address.length; i++) {
      if (address[i].lastUse == 1) {
        self.setData({
          address: address[i]
        })
        app.globalData.addressId=address[i].addressId;
        break;
      }
    }
    self.getPantrymanIdByAddressId('S00000001','D00000001',325);
    self.setData({
      mapSchoolName:app.globalData.mapSchoolName,
      mapDormitoryName:app.globalData.mapDormitoryName
    })
  },

  getPantrymanIdByAddressId: function (schoolId,dormitoryId,floor) {
    const self = this;
    wx.request({
      url: self.data.serverIp + 'getPantrymanIdByAddressId.do',
      data: {
        schoolId: schoolId,
        dormitoryId:dormitoryId,
        floor:floor
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        app.globalData.pantrymanId=res.data;
        self.getGoodListByPantrymanId(app.globalData.pantrymanId)
      },
      fail: function (res) {

      }
    })
  },
  getGoodListByPantrymanId: function (pantrymanId){
    const self = this;
    wx.request({
      url: self.data.serverIp + 'getGoodListByPantrymanId.do',
      data: {
        pantrymanId:   pantrymanId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res.data);
        wx.setStorageSync('good', res.data)
        self.setData({
          good:res.data
        })
      },
      fail: function (res) {

      }
    })
  },
  
  //通过客户ID获得客户地址
  getAddressListByCustomerId: function () {
    console.log("getAddressListByCustomerId");
    const self = this;
    wx.request({
      url: self.data.serverIp + 'getAddressListByCustomerId.do',
      data: {
        customerId: self.data.customerId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.setStorageSync('address', res.data)
        var address = [];
        console.log(res.data);
        address = res.data;
        for (var i = 0; i < address.length; i++) {
          if (address[i].lastUse == 1) {
            self.setData({
              address: address[i]
            })
            break;
          }
        }

      },
      fail: function (res) {

      }
    })
  },
  //获取商品列表
  getGoodList:function(){
    const self=this;
    wx.request({
      url: self.data.serverIp + 'getGoodList.do',
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.setStorageSync('good', res.data);
        self.setData({
          good: res.data
        })
      },
      fail: function (res) {
        console.log('获取商品列表失败');
      }
    }) 
  },
  //增加商品
  addGood:function(e){
    const self=this;
    var goodId = e.target.dataset.goodid;
    var good=self.data.good;
    var totalPrice=self.data.totalPrice;
    var totalNum=self.data.totalNum;
    good[goodId].selectNum++;
    totalPrice += (good[goodId].selectNum * good[goodId].salePrice);
    totalNum++;
    self.setData({
      totalPrice: totalPrice,
      totalNum:totalNum,
      good:good
    })
    wx.setStorageSync('orderDetail', self.data.good);

    app.globalData.sumAmt = totalPrice;
  },
  //增加商品
  SUBGood: function (e) {
    const self = this;
    var goodId = e.target.dataset.goodid;
    var good = self.data.good;
    if (good[goodId].selectNum==0){
      return;
    }
    var totalPrice = self.data.totalPrice;
    var totalNum = self.data.totalNum;
    good[goodId].selectNum--;
    totalPrice -= (good[goodId].selectNum * good[goodId].salePrice);
    totalNum--;
    self.setData({
      totalPrice: totalPrice,
      totalNum: totalNum,
      good: good
    })
    wx.setStorageSync('orderDetail', self.data.good);
  },
  showModal:function(){
    const self=this;
    const totalNum=self.data.totalNum;
    if(totalNum>0){
      self.setData({
        showModal: true
      })
    }
  },
  preventTouchMove:function(){
    console.log("closr");
    const self=this;
    self.setData({
      showModal:false
    })
  },
  selectSchool:function(e){
    const self=this;
    self.setData({
      indexS:e.detail.value
    })
  },
  selectDormitory:function(e){
    const self = this;
    self.setData({
      indexD: e.detail.value
    })
  },
  inputRoom:function(e){
    const self=this;
    self.setData({
      room: e.detail.value
    })
    console.log(self.data.room);
  }
})