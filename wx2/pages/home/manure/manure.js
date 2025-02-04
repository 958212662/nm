// pages/home/manure/manure.js
var image = require("../../../apis/image.js")
var config = require("../../../apis/config.js")
var dateFormat = require("../../../apis/dateFormat.js")
var http = require("../../../apis/request.js")
var httpSync = require("../../../apis/request_sync.js")

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    component: {
      placeholderText: "溯源ID/项圈编号/犬主姓名/手机号/身份证号",
      isShow: true
    },
    ishasData: true,
    isLoad: false,
    manureArray: [],
    ishasData: true, //是否有值
    maxLength: 6, //默认最大显示8个
    params: {
      offset: 0,
      limit: 6,
    }
  },




  /**
   * 粪便处理列表(根据防疫员id)
   */
  searchManure(e) {
    var that = this;
    that.setData({
      manureArray: [],
      params: {
        offset: 0,
        limit: 6,
      },
      query: e.detail.val
    });
    var query = that.data.query;
    this.getScanList(query);
  },

  /**
   * 扫码粪便处理列表(根据防疫员id)
   */
  scanSearchManure(e) {
    var that = this;
    that.setData({
      manureArray: [],
      params: {
        offset: 0,
        limit: 6,
      },
      query: e.detail.val,
    });
    var query = that.data.query;
    this.getScanList(query);
  },
  /**
   * 获取粪便处理列表(根据防疫员id)
   */
  getList(query, fun) {
    var that = this;
    var url = config.url.BASE_URL + "/manureDisposal/list";
    var token = app.globalData.token;
    var params = that.data.params;
    if (query && query != "") {
      params.traceId = query;
    }
    http.httpGet(url, token, params, function(res) {
      console.log("xxx", res);
      var manureArray = res.rows;
      for (var index in manureArray) {
        if (manureArray[index].dealTime != '' && manureArray[index].dealTime != null) {
          manureArray[index].dealTime = dateFormat(manureArray[index].dealTime, "yyyy-MM-dd hh:mm")
        }
      }
      that.setData({
        manureArray: that.data.manureArray.concat(manureArray)
      })
      typeof fun == "function" && fun(manureArray);
    })

  },

  /**
   * 获取粪便处理列表(根据防疫员id)
   */
  getScanList(query, fun) {
    var that = this;
    var url = config.url.BASE_URL + "/manureDisposal/list";
    var token = app.globalData.token;
    var params = that.data.params;
    if (query && query != "") {
      params.traceId = query;
    }
    http.httpGet(url, token, params, function(res) {
      if (!res.rows || res.rows.length <= 0) {
        that.setData({
          manureArray: []
        })
      }
      var manureArray = res.rows;
      for (var index in manureArray) {
        if (manureArray[index].dealTime != '' && manureArray[index].dealTime != null) {
          manureArray[index].dealTime = dateFormat(manureArray[index].dealTime, "yyyy-MM-dd hh:mm")
        }
      }
      that.setData({
        manureArray: manureArray
      })
    })

  },

  /**
   * 跳转到粪便处理详情
   */
  tomanureInfoPage(e) {
    var that = this;
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var manure_index = JSON.stringify(that.data.manureArray[index]);
    wx.navigateTo({
      url: '/pages/home/manure/info/info?manure_index=' + manure_index,
    })
  },

  /**
   * 跳转到犬只添加
   */
  /**
   * 跳转到犬只添加
   */
  toDogUtilPage(e) {
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/home/dogInfo/dogUtil/dogUtil?type=' + type,
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      manureArray: [],
      maxLength: 6,
      params: {
        offset: 0,
        limit: 6
      },
      isLoad: true
    });
    var query = that.data.query;
    that.getList(query, function(manureArray) {
      if (!manureArray || manureArray.length == 0) {
        that.setData({
          ishasData: false
        })
        return;
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    if (that.data.isLoad) {
      that.setData({
        isLoad: false
      })
      return;
    }
    that.setData({
      manureArray: [],
      maxLength: 6,
      params: {
        offset: 0,
        limit: 6
      }
    });
    var query = that.data.query;
    that.getList(query, function(data) {
      if (data && data.length > 0) {
        that.setData({
          ishasData: true
        })
        return;
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    var query = that.data.query;
    that.setData({
      maxLength: that.data.maxLength * 2,
      params: {
        offset: that.data.params.offset + 6,
        limit: 6
      }
    });
    var query = that.data.query;
    that.getList(query);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 跳转到犬只选择列表
   */
  toDogUtilPage(e) {
    console.log(e);
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/home/dogInfo/dogUtil/dogUtil?type=' + type,
    })
  },
})