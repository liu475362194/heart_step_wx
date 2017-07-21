var sumStep = 0
var secStep = 0
// setps.js
var isSport = false
var t
var timeNum = new Array("00","01","02","03","04","05","06","07","08","09")
var si = 0, mi = 0, hi = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("steps:生命周期函数--监听页面加载")
   var that = this
    wx.showLoading({
      title: '正在加载...',
    })
   for(var i = 10;i < 60;i++){
     timeNum.push(i)
   }
    
    // wx.onBLECharacteristicValueChange(function(res){
    //   console.log("steps",res)
    //   const result = res.value;
    //   const stepHex = that.buf2hex(result).substring(4, 6);
    //   var setpFrequency = parseInt(stepHex, 16);
    //   console.log(that.getStep(setpFrequency))
    //   secStep = that.getStep(setpFrequency)
      
    //   // sumStep += secStep
    //   that.setData({
    //     mvalue: sumStep
    //   })
    // })
  },

  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },

  getStep: function(setpFrequency){
    if(setpFrequency <= 0){
      return 0;
    }
    return Math.round(setpFrequency/60)
  },

  stepCount: function(){
    var that = this
    if(isSport){
      wx.getStorage({
        key: 'step',
        success: function(res) {
          console.log(that.getStep(res.data))
          secStep = that.getStep(res.data)
          that.setData({
            tempo: res.data,
            mvalue: sumStep,
            isconnection: getApp().globalData.isConnect
          })
        },
      })
    sumStep += secStep
    console.log("sumStep"+sumStep)
    that.totalKM()
    that.calories()
    that.time()
    t = setTimeout(function(){
      that.stepCount()
    },1000)
    }
  },

  startSport: function(){
    isSport = !isSport;
    this.stepCount()
    this.setData({
      isstart: isSport
    })
  },

  totalKM: function(){
    var distanz = sumStep * 0.0007
    distanz = distanz.toFixed(2)
    distanz = parseFloat(distanz)
    this.setData({
      distanz: distanz,
    })
  },

  calories: function () {
    var cal = sumStep * 0.058
    cal = cal.toFixed(2)
    cal = parseFloat(cal)
    this.setData({
      cal: cal,
    })
  },

  time: function(){
    var h = timeNum
    var m = timeNum
    var s = timeNum
    
    this.setData({
      h: h[hi],
      m: m[mi],
      s: s[si]
    })
    si += 1
    if(si>59){
      mi += 1
      si = 0
    }
    if(mi > 59){
      hi += 1
      mi = 0
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("steps:生命周期函数--监听页面初次渲染完成")
    wx.hideLoading()
    this.setData({
      isconnection: getApp().globalData.isConnect
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("steps:生命周期函数--监听页面显示")
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("steps:生命周期函数--监听页面隐藏")

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("steps:生命周期函数--监听页面卸载")

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("steps:生命周期函数--监听用户下拉动作")

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("steps:页面上拉触底事件的处理函数")

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("steps:用户点击右上角分享")

  }
})