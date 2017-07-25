// connection.js
var wxCharts = require('../../util/wxcharts.js');
var data = [0]
var ndata = []
var categories = []
var app = getApp()
var lineChart = null;
var deviceId = ""
var service = ""
var deviceName = ""
var characteristic = ""
var start = false
var leftStartX = 0
var leftMoveX = 0
var moveX = 0
var canvasWidth = 600
var windowWidth = 320
var autoMoveCanvas = true
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isconnection: false,
    isstart: start,
    tiaodong: false,
    left: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("connection:生命周期函数--监听页面加载")
    wx.showLoading({
      title: '正在加载...',
    })
    var that = this
    wx.getStorage({
      key: 'deviceId',
      success: function(res) {
        deviceId = res.data
      },
    })
    wx.getStorage({
      key: 'deviceName',
      success: function (res) {
        deviceName = res.data
        wx.setNavigationBarTitle({
          title: deviceName,
        })
      },
    })
    // console.log("deviceName:" + options.deviceName)
    // deviceName = options.deviceName
    
    for (var i = 0; i < 60; i++) {
      categories.push(i)
    }
    // deviceId = options.deviceId
    wx.onBLECharacteristicValueChange(function(res){
      console.log("ValueChange:")
      const result = res.value;
      const hex = that.buf2hex(result).substring(2, 4);
      const stepHex = that.buf2hex(result).substring(4,6);
      var step = parseInt(stepHex,16);
      console.log(that.buf2hex(result))
      wx.setStorage({
        key: 'step',
        data: step,
      })
      var heat = parseInt(hex,16)
      // console.log(hex);
      that.setData({
        mvalue: heat,
        tiaodong: true
      })
      
      
      if(start){
        if (data.length >= 60) {
          categories.push(categories.length)
          canvasWidth += 5
          if(autoMoveCanvas){
          moveX -= 5
          that.setData({
            left: moveX,
            width: canvasWidth
          })
          }
        }
        ndata.push(heat)
        data = ndata
        that.updateData();
      }
      
      
      setTimeout(function(){
        that.setData({
          tiaodong: false
        })
      },200)
      // that.touchHandler()
    }),
    wx.onBLEConnectionStateChange(function(res){
      console.log(res.connected)
      if(!res.connected){
        getApp().globalData.isConnect = false
        that.setData({
          isconnection: getApp().globalData.isConnect
        })
        app.setChangedData(false);
      }
    })
  },

  updateData: function () {//更新
  console.log("updata")
    var simulationData = this.createSimulationData();
    var series = [{
      name: '心率',
      data: simulationData.data,
      format: function (val, name) {
        return val.toFixed(2);
      }
    }];
    lineChart.updateData({
      categories: simulationData.categories,
      series: series,
      width: canvasWidth
    });
  },

  startSport: function(){
    if (getApp().globalData.isConnect == false){
      wx.showModal({
        title: '提示',
        content: '蓝牙未连接',
        success: function (res) {
        }
      })
    } else {
      start = !start
      this.setData({
        isstart: start
      })
    }
    
  },

  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },

  getServices: function () {
    var that = this
    var isOk = false
    return wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function (res) {
        console.log(res.services.length)
        for(var i = 0;i < res.services.length;i++){
          if(res.services[i].uuid == "65786365-6C70-6F69-6E74-2E636F810000"){
            service = res.services[i].uuid
            break
          }
        }
        console.log("service:")
        console.log(res)
        console.log("service:isSelect")
        console.log(service)
        wx.getBLEDeviceCharacteristics({
          deviceId: deviceId,
          serviceId: service,
          success: function(res) {
            for (var i = 0; i < res.characteristics.length; i++) {
              if (res.characteristics[i].uuid == "65786365-6C70-6F69-6E74-2E636F810001") {
                characteristic = res.characteristics[i].uuid
                break
              }
            }
            
            console.log("characteristic:")
            console.log(res)
            console.log("characteristic:isSelect")
            console.log(characteristic)
            
            wx.notifyBLECharacteristicValueChange({
              deviceId: deviceId,
              serviceId: service,
              characteristicId: characteristic,
              state: true,
              success: function(res) {
                console.log("notify:")
                console.log("OK")
                
                getApp().globalData.isConnect = true
                console.log(getApp().globalData.isConnect)
                that.setData({
                  isconnection: getApp().globalData.isConnect
                })
              },
            })
          },
        })
      },
    })
      // console.log("services2" + services)
      // return "services2"
      
  },
  // getService: function () {
  //   this.getServices()
  // },

  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      background: '#7cb5ec'
    });
  },


  createSimulationData: function () {

    return {
      categories: categories,
      data: data
    }
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading()
    console.log("connection:生命周期函数--监听页面初次渲染完成")
    this.getServices()
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
      canvasWidth = windowWidth
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    this.setData({
      width: canvasWidth
    })

    var simulationData = this.createSimulationData();
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: simulationData.categories,//x轴显示内容
      animation: false,
      background: '#f5f5f5',
      series: [{
        name: '心率',
        data: simulationData.data,
        format: function (val, name) {//点击显示的内容
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '心率值',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: canvasWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: false,
      extra: {
        lineStyle: 'nono'
      }
    });
  },

  touchStart: function(e){
    leftStartX = e.touches[0].x
  },

  touchMove: function(e){
    autoMoveCanvas = false
    leftMoveX = e.touches[0].x
    var move = leftMoveX - leftStartX
    moveX += move
    // console.log("X: " + leftMoveX)
    // console.log("left: " + leftMoveX + " - " + leftStartX + " = " + move)
    if(moveX >= 0){
      moveX = 0
    }
    if (moveX <= (windowWidth - canvasWidth)){
      moveX = (windowWidth - canvasWidth)
      autoMoveCanvas = true
    }
    this.setData({
      left: moveX
    })
    leftStartX = e.touches[0].x
  },

  touchEnd: function(e){
    leftStartX = leftMoveX
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("connection:生命周期函数--监听页面显示")
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("connection:生命周期函数--监听页面隐藏")

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("connection:生命周期函数--监听页面卸载")
    wx.closeBLEConnection({
      deviceId: deviceId,
      success: function(res) {
        console.log("蓝牙已断开！")
      },
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("connection:生命周期函数--监听用户下拉动作")

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("connection:页面上拉触底事件的处理函数")

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("connection:用户点击右上角分享")

  }
})