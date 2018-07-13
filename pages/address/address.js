const app = getApp()
Page({
  data:{
    hidden: true,
    addressList:[],
    school:[],
    dormitory: [],
    room:[],
    indexS:0,
    indexD:0,
    schoolNameList:[],
    dormitoryNameList:[],
    roomId:"",
    receiverName:"",
    receiverPhone:"",
    addAddress:"",
    selectAddressId:'',
    serverIp: '',
    customerId: '',
    mapSchoolName: {},
    mapDormitoryName: {}
  },
  onLoad:function(){
    const self=this;
    var mapSchoolName = wx.getStorageSync('mapSchoolName');
    var mapDormitoryName = wx.getStorageSync('mapDormitoryName');
    self.setData({
      serverIp: app.globalData.serverIp,
      customerId: app.globalData.customerId,
      mapSchoolName: mapSchoolName,
      mapDormitoryName: mapDormitoryName
    })
    
    var address = wx.getStorageSync('address') || [];
    var selectAddressId="";
    for(var i=0;i<address.length;i++)
    {
      if(address[i].lastUse==1)
      {
        selectAddressId=address[i].addressId;
        break;
      }
    }
    self.setData({
      addressList:address,
      selectAddressId: selectAddressId
    });
    self.getSchoolList();
   
  },

  bindReceiverName:function(e){
    const self=this;
    var address=self.data.address;
    address.receiverName = e.detail.value;
    self.setData({
      receiverName: e.detail.value,
      address:address
    });
  },
  bindReceiverPhone:function(e){
    const self = this;
    var address = self.data.address;
    address.receiverPhone = e.detail.value;
    self.setData({
      receiverPhone: e.detail.value,
      address:address
    });
    console.log(this.data.receiverPhone);
  },

  bindRoomId: function (e) {
    const self = this;
    var address = self.data.address;
    address.roomId = e.detail.value;
    this.setData({
      roomId: e.detail.value,
      address:address
    });
    console.log(this.data.roomId);
  },
  selectAddress:function(e){
    const self = this;
    console.log(e.currentTarget.dataset.selectaddressid);
    self.setData({
      selectAddressId: e.currentTarget.dataset.selectaddressid
    })
  },

  addAddress:function(e){
    const self=this;
    self.setData({
      hidden:false,
      addAddress:true,
      address:{}
    })
    
  },
  updateAddress:function(e){
     const self=this;
     self.setData({
       hidden:false,
       addAddress:false
     })
     var address=e.target.dataset.address;
     console.log(address);

     self.setData({
       address:address,
       hidden: false
     })
  },
  deleteAddress:function(e){
      console.log("deleteAddress");
      const self=this;
      var addressId = e.target.dataset.address.addressId;
      var customerId = e.target.dataset.address.customerId;
      console.log(customerId);
      wx.request({
        url: self.data.serverIp+'deleteAddress.do',
        method: 'POST',
        data: {
          addressId: addressId,
          customerId: customerId
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          console.log(res.data);
          wx.setStorageSync('address', res.data);
          self.setData({
            addressList: res.data
          })
        },
        fail: function (res) {

        }
      })
  },

  getSchoolList: function () {
    const self = this;
    wx.request({
      url: self.data.serverIp + 'getSchoolList.do',
      data: {
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.setStorageSync('school', res.data);
        var schoolName = [];
        for (var i = 0; i < (res.data).length; i++) {
          schoolName.push(res.data[i].schoolName);
        }
        self.setData({
          schoolNameList: schoolName
        });

      },
      fail: function (res) {

      }
    })
  },

  listenSchoolSelected: function (e) {
    //改变index值，通过setData()方法重绘界面
    const self=this;
    var index = e.detail.value;
    var school=wx.getStorageSync('school')||[];
    var schoolId=school[index].schoolId;
    var address = self.data.address;
    address.schoolId=e.detail.value;
    self.setData({
      schoolId: schoolId,
      indexS:index,
      address:address
    });
    console.log(schoolId);
    wx.request({
      url: self.data.serverIp + 'getDormitoryList.do',
      data: {
        schoolId:schoolId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.setStorageSync('dormitory', res.data);
        var dormitoryName = [];
        for (var i = 0; i < (res.data).length; i++) {
          dormitoryName.push(res.data[i].dormitoryName);
        }
        self.setData({
          dormitoryNameList: dormitoryName
        })
      },
      fail: function (res) {
      }
    })

  }, 
  listenDormitorySelected:function(e)
  {
    const self=this;
    var index = e.detail.value;
    var dormitory = wx.getStorageSync('dormitory') || [];
    var dormitoryId=dormitory[index].dormitoryId;
    var address = self.data.address;
    address.dormitoryId=e.detail.value;
    self.setData({
      dormitoryId: dormitoryId,
      indexD:index,
      address:address
    })
  },

  cancel:function(){
    this.setData({
      hidden:true
    })
  },
  confirm: function () {
    const self=this;
    self.setData({
      hidden:true
    });
    
    if(!self.data.addAddress)
    {
      var addressId = self.data.address.addressId;
      var customerId = app.globalData.customerId;
      wx.request({
        url: app.globalData.serverIp+'updateAddress.do',
        method: 'POST',
        data: {
          addressId: addressId,
          customerId: customerId,
          schoolId: self.data.address.schoolId,
          dormitoryId: self.data.address.dormitoryId,
          roomId: self.data.address.roomId,
          receiverName: self.data.address.receiverName,
          receiverPhone: self.data.address.receiverPhone,
          lastUse: '1'
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          wx.setStorageSync('address', res.data);
          var address=res.data;
          var selectAddressId = "";
          for (var i = 0; i < address.length; i++) {
            if (address[i].lastUse == 1) {
              selectAddressId = address[i].addressId;
              break;
            }
          }
          self.setData({
            addressList: res.data,
            selectAddressId: selectAddressId
          })
        },
        fail: function (res) {

        }
      })
    }
    else{
      var customerId = app.globalData.customerId;
      wx.request({
        url: app.globalData.serverIp+'submitAddress.do',
        method: 'POST',
        data: {
          customerId: customerId,
          schoolId: self.data.schoolId,
          dormitoryId: self.data.dormitoryId,
          roomId: self.data.roomId,
          receiverName: self.data.receiverName,
          receiverPhone: self.data.receiverPhone,
          lastUse:'1'
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          wx.setStorageSync('address',res.data);
          var address = res.data;
          var selectAddressId = "";
          for (var i = 0; i < address.length; i++) {
            if (address[i].lastUse == 1) {
              selectAddressId = address[i].addressId;
              break;
            }
          }
          self.setData({
            addressList: res.data,
            selectAddressId: selectAddressId
          })
        },
        fail: function (res) {

        }
      }) 
    }
  },
  confirmAddress:function()
  {
    const self=this;
    var address = wx.getStorageSync('address') || [];
    var selectAddressId = self.data.selectAddressId;
    for (var i = 0; i < address.length; i++) {
      if (address[i].addressId == selectAddressId) {
        if (address[i].lastUse == 1)
          break;
        else{
          wx.request({
            url: app.globalData.serverIp + 'updateAddress.do',
            method: 'POST',
            data: {
              addressId: address[i].addressId,
              customerId: address[i].customerId,
              schoolId: address[i].schoolId,
              dormitoryId: address[i].dormitoryId,
              roomId: address[i].roomId,
              receiverName: address[i].receiverName,
              receiverPhone: address[i].receiverPhone,
              lastUse: '1'
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function (res) {
              wx.setStorageSync('address', res.data);
              var address = res.data;
              var selectAddressId = "";
              for (var i = 0; i < address.length; i++) {
                if (address[i].lastUse == 1) {
                  selectAddressId = address[i].addressId;
                  break;
                }
              }
              self.setData({
                addressList: res.data,
                selectAddressId: selectAddressId
              })
            }
          })
        }
      }
    }
  }
})