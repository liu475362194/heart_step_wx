//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  addListener: function (callback) {
    this.callback = callback;
  },
  setChangedData: function (data) {
    this.data = data;
    if (this.callback != null) {
      this.callback(data);
    }
  },
  globalData:{
    userInfo:null,
    isConnect: false
  }
})