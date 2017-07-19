var app = getApp()
var version = ""
var temp = []
var deviceName = ""
var serviceId = "0000ffe0-0000-1000-8000-00805f9b34fb"
// var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb"
Page({
  data: {
    isbluetoothready: false,
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    searchingstatus: false,
    // receivedata: '',
    onreceiving: false
  },
  onLoad: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        version = res.version
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
      }
    })
    wx.setNavigationBarTitle({
      title: "连接你的心率耳机",
    })
    console.log(getApp().globalData.isConnect)
  },
  onShow: function () {
    console.log("onShow" + this.data.searchingstatus)
    this.setData({
      searchingstatus: this.data.searchingstatus
    })
  },
  switchBlueTooth: function () {
    var that = this

    // that.setData({
    //   isbluetoothready: !that.data.isbluetoothready
    // })

    // if (that.data.isbluetoothready) {
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log("初始化蓝牙适配器成功")
          wx.startBluetoothDevicesDiscovery({
            success: function (res) {
              console.log("开始搜索附近蓝牙设备")
              console.log(res)

            }
          })
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log("蓝牙适配器状态变化", res)
            if(!res.available){
              that.stopBLEdiscovery()
            }
            that.setData({
              isbluetoothready: res.available,
              searchingstatus: res.discovering,
            })
            
          })
          wx.onBluetoothDeviceFound(function (devices) {
            console.log(devices)
            console.log(version)
           // if (version != '6.5.8') {
            if (devices.name == null) {
              var device = devices
              console.log(device instanceof Array)
              
              if (devices.devices[0] != null && devices.devices[0].name.length != 0) {
                temp.push(devices.devices[0])
                that.setData({
                  devices: temp
                })
                console.log('发现新蓝牙设备')
                console.log('设备id' + (devices.devices[0].deviceId != undefined ? "有ID" : "无ID"))
                console.log('设备name' + (devices.devices[0].name.length != 0 ? "有NAME " + devices.devices[0].name : "无NAME"))

              }
            } else {
              if (devices != null) {
                temp.push(devices)
                that.setData({
                  devices: temp
                })
                console.log('发现新蓝牙设备')
                console.log('设备id' + (devices.deviceId != undefined ? "有ID" : "无ID"))
                console.log('设备name' + (devices.name.length != 0 ? "有NAME " + devices.devices[0].name : "无NAME"))
              }
            }

          })
        },
        fail: function (res) {
          console.log("初始化蓝牙适配器失败")
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              that.setData({
                isbluetoothready: false,
                searchingstatus: false
              })
            }
          })
        }
      })
    
  },
  searchbluetooth: function () {
    temp = []
    var that = this

    if (!that.data.searchingstatus) {
      that.setData({
        searchingstatus: !that.data.searchingstatus
      })
      that.switchBlueTooth()
    } else {
      that.stopBLEdiscovery()

    }
  },

  stopBLEdiscovery: function(){
    var that = this
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("停止蓝牙搜索")
        console.log(res)
        wx.closeBluetoothAdapter({
          success: function (res) {
            console.log(res)
            that.setData({
              isbluetoothready: false,
              deviceconnected: false,
              devices: [],
              searchingstatus: false,
              // receivedata: ''
            })
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              content: '请检查手机蓝牙是否打开',
              success: function (res) {
                that.setData({
                  isbluetoothready: false
                })
              }
            })
          }
        })
      }
    })
  },

  connectTO: function (e) {
    var that = this
    var deviceId = e.currentTarget.id
    var deviceName = ""
    for (var i = 0; i < temp.length; i++) {
      if (deviceId == temp[i].deviceId) {
        deviceName = temp[i].name
        break
      }
    }
    if (that.data.deviceconnected) {
      wx.closeBLEConnection({
        deviceId: deviceId,
        complete: function (res) {
          console.log("断开设备")
          console.log(res)
          that.setData({
            deviceconnected: false,
            connectedDeviceId: "",
            // receivedata: ""
          })
        }
      })
    } else {
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      wx.createBLEConnection({
        deviceId: deviceId,
        success: function (res) {
          wx.hideLoading()
          wx.setStorage({
            key: 'deviceId',
            data: e.currentTarget.id,
          })
          wx.setStorage({
            key: 'deviceName',
            data: deviceName,
          })
          setTimeout(function () {
            console.log(e.currentTarget)
            wx.switchTab({
              url: "../connection/connection"
            })
            
          }, 1000)
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备成功")
          console.log(res)
          that.setData({
            deviceconnected: true,
            connectedDeviceId: deviceId
          })
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '连接设备失败',
            icon: "loading",
            duration: 1000
          })
          console.log("连接设备失败")
          console.log(res)
          that.setData({
            connected: false
          })
        }
      })
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
      // that.stopBLEdiscovery()
    }
  },
})
