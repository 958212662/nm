// pages/home/dogInfo/add/dog_add.js
var config = require("../../../../apis/config.js")
var http = require("../../../../apis/request.js")
var httpSync = require("../../../../apis/request_sync.js")
var icon = require("../../../../apis/icon.js")
var imageType = require("../../../../apis/imageType.js")

import WxValidate from '../../../../utils/WxValidate.js'

var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scanIcon: icon.scan,
    owner: {
      ownerIndex: 0,
      ownerArray: ['xxxx', 'ssss', 'mmmm']
    },
    fence: {
      fenceIndex: 0,
      fenceArray: ["2012", "2013"],
    },
    breed: {
      breedIndex: 0,
      breedArray: ["拉布拉多", "德牧"]
    },
    sex: {
      sexIndex: 0,
      sexArray: ["公", "母"]
    },
    health: {
      healthIndex: 0,
      healthArray: ["良好"]
    },
    deviceNo: ""
  },

  formSubmit: function (e) {
    var that = this;
    var dogInfo = e.detail.value;
    dogInfo.traceId = that.data.dogInfo.traceId;
    if (!this.WxValidate.checkForm(dogInfo)) {
      const error = this.WxValidate.errorList[0];
      this.showModal(error);
      return false;
    }
    //表单提交
    var url = config.url.BASE_URL + '/dogInfo/update';
    var token = app.globalData.token;
    http.httpGet(url, token, dogInfo, function (res) {
      console.log(res)
      if (res.status == 200) {
        var dogInfoId = that.data.dogInfo.id;
        //上传照片(待定)
        that.uploadImage(dogInfoId, imageType.dogImage);
        wx.showToast({
          title: '修改成功',
          icon: "success",
          duration: 1500
        });
        setTimeout(function () {
          wx.navigateBack();
        }, 1500)
      }else{
       wx.showModal({
         title: '提示',
         content: '修改失败',
         showCancel:false
       })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log("options", options);
    var dogInfo = JSON.parse(options.dogInfo);
    var dogPicList = JSON.parse(options.dogPicList);
    console.log("dogInfo", dogInfo);
    that.setData({
      ['sex.sexIndex']:dogInfo.sex,
      dogInfo: dogInfo,
      dogPicList: dogPicList,
    });


    this.initValidate();//验证规则函数
    var userInfo = app.globalData.userInfo;
    this.getOwnerByProtectorId(userInfo.userId);
    this.getFenceByProtectorId(userInfo.userId);
    this.getDogBreed();
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  bindOwnerChange: function (e) {
    var that = this;
    that.setData({
      ['dogInfo.ownerName']:"",
      ['owner.ownerIndex']: e.detail.value
    })
  },

  bindFenceChange: function (e) {
    var that = this;
    that.setData({
      ['dogInfo.fenceName']: "",
      ['fence.fenceIndex']: e.detail.value
    })
  },

  bindBreedChange: function (e) {
    var that = this;
    that.setData({
      ['dogInfo.breed']: "",
      ['breed.breedIndex']: e.detail.value
    })
  },

  bindAgeChange: function (e) {
    var that = this;
    that.setData({
      ['age.ageIndex']: e.detail.value
    })
  },

  bindSexChange: function (e) {
    var that = this;
    that.setData({
      ['sex.sexIndex']: e.detail.value
    })
  },


  uploadImage(id, type) {
    var that = this;
    //上传照片(待定)
    that.selectComponent("#image-upload").uploadImage(id, type);
  },

  //获得犬主列表(根据防疫员id)
  getOwnerByProtectorId(protectorId) {
    var that = this;
    var url = config.url.BASE_URL + "/dogInfo/getDogOwner";
    var token = app.globalData.token;
    var params = {
      Id: protectorId
    }
    http.httpGet(url, token, params, function (res) {
      console.log(res);
      that.setData({
        ["owner.ownerArray"]: res.data
      })
    })
  },

  //获得围栏列表(根据防疫员id)
  getFenceByProtectorId(protectorId) {
    var that = this;
    var url = config.url.BASE_URL + "/dogInfo/getFence";
    var token = app.globalData.token;
    var params = {
      Id: protectorId
    }
    http.httpGet(url, token, params, function (res) {
      console.log(res);
      that.setData({
        ["fence.fenceArray"]: res.data
      })
    })
  },

  //获得种类列表()
  getDogBreed() {
    var that = this;
    app.getDogBreed(function (res) {
      that.setData({
        ["breed.breedArray"]: res.data
      })
    })
  },



  //获得设备id列表(根据防疫员id)
  getDeviceId(deviceNo, fun) {
    var that = this;
    var url = config.url.BASE_URL + "/dogInfo/findDeviceIdByDeviceNo";
    var token = app.globalData.token;
    var params = {
      deviceNo: deviceNo
    }
    http.httpGet(url, token, params, function (res) {
      var deviceId = res.data;
      typeof fun == "function" && fun(deviceId);
    });
  },

  //报错 
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },


  //验证函数
  initValidate: function () {
    // 验证字段的规则
    var rules = {
      dogName: {
        required: true,
      },
      age: {
        digits: true,
      },
      weight: {
        digits: true,
      }
    };
    var messages = {
      dogName: {
        required: "请填写犬名",
      },
      age: {
        digits: "请输入有效的数字",
      },
      weight: {
        digits: "请输入有效的数字",
      }
    };
    this.WxValidate = new WxValidate(rules, messages)
  },
})