"use strict";
// eslint-disable-next-line no-undef
// exports.__esModule = true;
// eslint-disable-next-line no-undef
// exports.chartbloodPressure = void 0;

// import * as echarts_1 from "../components/charts/ec-canvas/echarts";

import * as echarts_1 from "echarts";

/** 获取小时分钟秒对应的毫秒 */
function getHoursMS(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const clock00TS = d.getTime();
  return ts - clock00TS;
}

function ms2HHmmssFormat(value, format) {
  let h = Math.floor(value / 3600000);
  let m = Math.floor((value - h * 3600000) / 60000);
  let s = Math.floor((value - h * 3600000 - m * 60000) / 1000);
  let str = "";
  if (!format) {
    format = "HH:mm";
  }
  if (h < 1) {
    h = "";
    format = format.replace("HH:", "");
    format = format.replace("小时", "");
  } else if (h < 10) {
    h = "0" + h;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (s < 10) {
    s = "0" + s;
  }
  str = format.replace("HH", h);
  str = str.replace("mm", m);
  if (/ss$/.test(format)) {
    str = str.replace("ss", s);
  }
  return str;
}
var ChartbloodPressure = /** @class */ (function () {
  function ChartbloodPressure() {
    this.colorMap = {
      l0: "#8EFA00",
      l1: "#FFFB00",
      l2: "#FF9300",
      l3: "#FF2600",
      l4: "#941100",
    };
    this.frameColorMap = {
      l0: "#64AF03",
      l1: "#B7B200",
      l2: "#B46700",
      l3: "#BC1C00",
      l4: "#580A00",
    };
    this.labelMap = {
      l0: "正常",
      l1: "偏高",
      l2: "高",
      l3: "极高",
      l4: "风险",
    };
    this.yIndexMap = {
      low120: ">120",
      low90_120: "90-120",
      low80_89: "80-89",
      low80: "<80",
      0: "0",
      high120: "<120",
      high120_129: "120-129",
      high130_139: "130-139",
      high140_180: "140-180",
      high180: ">180",
    };
    this.yLabelMap = {
      ">120": "风险",
      "90-120": "极高",
      "80-89": "高",
      "<80": "正常",
      0: "0",
      "<120": "正常",
      "120-129": "偏高",
      "130-139": "高",
      "140-180": "极高",
      ">180": "风险",
    };
    this.lineColor = "#3171B4";
  }
  ChartbloodPressure.prototype.getColor = function (lv) {
    // @ts-ignore
    return this.colorMap["l" + lv];
  };
  ChartbloodPressure.prototype.renderUpBGItem = function (params, api) {
    try {
      var y0 = api.value(0);
      var y1 = api.value(1);
      var h = api.size([0, 1])[1] * 0.9;
      var p0 = api.coord([1, y1]);
      var size = api.size([1, 1]);

      var rectShape = echarts_1.graphic.clipRectByRect(
        {
          x: p0[0],
          y: p0[1] - h / 2,
          width: params.coordSys.width - size[0] * 2,
          height: h,
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height,
        }
      );
      return {
        type: "rect",
        shape: rectShape,
        style: {
          fill: api.style().fill,
          opacity: 0.5,
        },
      };
    } catch (error) {}
    return undefined;
  };
  ChartbloodPressure.prototype.renderBGItem = function (params, api) {
    try {
      var y0 = api.value(1);
      var isBase = api.value(0) > 0;
      if (isBase) {
        return undefined;
      }
      var size = api.size([1, 1]);
      var h = size[1];
      var p0 = api.coord([1, y0]);
      // console.log('p0', p0, 'h', h, 'y0', y0, isBase, params.coordSys.height);
      var rectShape = echarts_1.graphic.clipRectByRect(
        {
          x: p0[0],
          y: p0[1] - h * 1.8,
          width: params.coordSys.width - size[0] * 2,
          height: h * 2.6,
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height,
        }
      );
      return {
        type: "rect",
        shape: rectShape,
        style: {
          fill: isBase ? "#fff" : api.style().fill,
          opacity: 0.5,
        },
      };
    } catch (error) {}
    return undefined;
  };
  ChartbloodPressure.prototype.renderDownBGItem = function (params, api) {
    try {
      var y0 = api.value(0);
      var y1 = api.value(1);
      var h = api.size([0, 1])[1] * 0.9;
      var p0 = api.coord([1, y0]);
      var size = api.size([1, 1]);
      var rectShape = echarts_1.graphic.clipRectByRect(
        {
          x: p0[0],
          y: p0[1] - h / 2,
          width: params.coordSys.width - size[0] * 2,
          height: h,
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height,
        }
      );
      return {
        type: "rect",
        shape: rectShape,
        style: {
          fill: api.style().fill,
          opacity: 0.5,
        },
      };
    } catch (error) {}
    return undefined;
  };
  /** 获取 y 值 */
  ChartbloodPressure.prototype.getUpY = function (val) {
    var ret = {
      y: "",
      val: 0,
    };
    if (val < 120 && val > 0) {
      ret.y = this.yIndexMap.high120;
      ret.val = Math.abs(val - 120) / 120;
    } else if (val >= 120 && val <= 129) {
      ret.y = this.yIndexMap.high120_129;
      ret.val = Math.abs(val - 120) / 10;
    } else if (val >= 130 && val <= 139) {
      ret.y = this.yIndexMap.high130_139;
      ret.val = Math.abs(val - 130) / 10;
    } else if (val >= 140 && val <= 179) {
      ret.y = this.yIndexMap.high140_180;
      ret.val = Math.abs(val - 140) / 40;
    } else if (val >= 180) {
      ret.y = this.yIndexMap.high180;
      ret.val = Math.abs(val - 180) / 30;
    }
    return ret;
  };
  ChartbloodPressure.prototype.getDownY = function (val) {
    var ret = {
      y: "",
      val: 0,
    };
    if (val < 80 && val > 0) {
      ret.y = this.yIndexMap.low80;
      ret.val = Math.abs(val) / 80;
    } else if (val >= 80 && val <= 89) {
      ret.y = this.yIndexMap.low80_89;
      ret.val = Math.abs(val - 80) / 10;
    } else if (val >= 90 && val <= 119) {
      ret.y = this.yIndexMap.low90_120;
      ret.val = Math.abs(val - 90) / 30;
    } else if (val >= 120) {
      ret.y = this.yIndexMap.low120;
      ret.val = Math.abs(val - 120) / 30;
    }
    return ret;
  };
  ChartbloodPressure.prototype.renderItem = function (params, api, isUp) {
    var x = api.value(0);
    var highVal = api.value(3);
    var lowVal = api.value(6);
    var lv = api.value(7);
    var timeLabel = api.value(9);
    var size = api.size([1, 1]);
    var w0 = 20;
    var r = w0 / 2;
    var w1 = 2;
    // y 轴是 0--100, 50 是中间高压低压的分割点
    var high = 50 + (highVal / 200) * 50;
    var low = 50 - (lowVal / 140) * 50;
    var p0 = api.coord([x, high]);
    var p1 = api.coord([x, low]);
    p0[1] += r * size[1];
    p1[1] -= r * size[1];
    // console.log('blood pressure h', highVal, high, 'l', lowVal, low, 'ph', p0, 'pl', p1);
    var g = { type: "group", children: [] };
    // @ts-ignore
    var frameColor = this.frameColorMap["l" + lv];
    var shadowColor = "#888";
    var shadowBlur = 10;
    var sr1 = {};
    sr1.x = p0[0] - w0 / 2;
    sr1.y = p0[1];
    sr1.width = w0;
    sr1.height = Math.abs(p0[1] - p1[1]);
    var rect = {};
    rect.shape = sr1;
    rect.type = "rect";
    rect.style = {
      fill: frameColor,
      shadowBlur: shadowBlur,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: shadowColor,
    };
    var sc1 = {};
    sc1.cx = sr1.x + r;
    sc1.cy = sr1.y;
    sc1.r = r;
    sc1.startAngle = Math.PI;
    sc1.endAngle = 0;
    var circle1 = {};
    circle1.shape = sc1;
    circle1.type = "sector";
    circle1.style = {
      fill: frameColor,
      shadowBlur: shadowBlur,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: shadowColor,
    };
    g.children.push(circle1);
    var sc2 = {};
    sc2.cx = sr1.x + r;
    sc2.cy = sr1.y + sr1.height;
    sc2.r = r;
    sc2.startAngle = 0;
    sc2.endAngle = Math.PI;
    var circle2 = {};
    circle2.shape = sc2;
    circle2.type = "sector";
    circle2.style = {
      fill: frameColor,
      shadowBlur: shadowBlur,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: shadowColor,
    };
    g.children.push(circle2);
    g.children.push(rect);
    var sr2 = {};
    sr2.x = p0[0] - w0 / 2 + w1;
    sr2.y = p0[1];
    sr2.width = w0 - w1 * 2;
    sr2.height = sr1.height;
    var rect2 = {};
    rect2.shape = sr2;
    rect2.type = "rect";
    rect2.style = api.style();
    g.children.push(rect2);
    var sc21 = {};
    var r2 = w0 / 2 - w1;
    sc21.cx = sr2.x + r2;
    sc21.cy = sr2.y;
    sc21.r = r2;
    var circle21 = {};
    circle21.shape = sc21;
    circle21.type = "circle";
    circle21.style = api.style();
    g.children.push(circle21);
    var sc22 = {};
    sc22.cx = sr2.x + r2;
    sc22.cy = sr2.y + sr1.height;
    sc22.r = r2;
    var circle22 = {};
    circle22.shape = sc22;
    circle22.type = "circle";
    circle22.style = api.style();
    g.children.push(circle22);
    var highLabel = {
      type: "text",
      style: {
        x: sc1.cx,
        y: p0[1] - r,
        text: "" + highVal,
        fill: "#333",
        stroke: "#f00",
        lineWidth: 1,
        font: "bold",
        fontSize: 12,
        textAlign: "center",
        textVerticalAlign: "bottom",
      },
    };
    g.children.push(highLabel);
    var lowLabel = {
      type: "text",
      style: {
        x: sc1.cx,
        y: sr1.y + sr1.height + r + 2,
        text: "" + lowVal,
        fill: "#333",
        stroke: "#f00",
        lineWidth: 1,
        font: "bold",
        fontSize: 12,
        textAlign: "center",
        textVerticalAlign: "top",
      },
    };
    g.children.push(lowLabel);
    var srText = {};
    srText.x = sr1.x - 5;
    srText.y = lowLabel.style.y + 10;
    srText.width = 30;
    srText.height = 24;
    var rectText = {};
    rectText.shape = srText;
    rectText.type = "rect";
    rectText.style = {
      fill: "#fff",
    };
    // g.children.push(rectText);
    var textPoint = api.coord([0, 0]);
    var timeLabelText = {
      type: "text",
      style: {
        x: sc1.cx,
        y: textPoint[1] + 8,
        text: "" + timeLabel,
        fill: "#333",
        stroke: "#f00",
        lineWidth: 1,
        font: "bold",
        fontSize: 9,
        textAlign: "center",
        textVerticalAlign: "top",
      },
    };
    g.children.push(timeLabelText);

    return g;
  };
  /**
   * @deprecated
   * @param params
   * @param api
   * @returns
   */
  ChartbloodPressure.prototype.renderTextItem = function (params, api) {
    var g = { type: "group", children: [] };
    var x0 = api.coord([0, 1]);
    var pl = api.coord([0, 0]);
    var ph = api.coord([0, 100]);
    // console.log("pl", pl, "ph", ph, params.coordSys.height);
    var highLabel = {
      type: "text",
      style: {
        x: ph[0],
        y: ph[1] - 4,
        text: "高压 (收缩压)",
        fill: "#333",
        stroke: "#f00",
        lineWidth: 1,
        font: "bold",
        fontSize: 12,
        textAlign: "left",
        textVerticalAlign: "bottom",
      },
    };
    var lowLabel = {
      type: "text",
      style: {
        x: pl[0] + 10,
        y: pl[1] + 14,
        text: "低压 (舒张压)",
        fill: "#333",
        stroke: "#f00",
        lineWidth: 1,
        font: "bold",
        fontSize: 11,
        textAlign: "left",
        textVerticalAlign: "up",
      },
    };
    g.children.push(highLabel);
    g.children.push(lowLabel);
    return g;
  };
  ChartbloodPressure.prototype.renderBlood = function (params, api) {
    var x = api.value(0);
    var y = api.value(1);
    var val = api.value(2);
    var total = api.value(3);
    var lv = api.value(5);
    var start = api.coord([0, y]);
    var end = api.coord([x, y]);
    var w = end[0] - start[0];
    var h = api.size([0, 1])[1];
    var chartW = w;
    var cx = chartW > 0 ? start[0] : start[0] + chartW;
    //@ts-ignore
    var c = this.colorMap["l" + lv];
    var rectShape = echarts_1.graphic.clipRectByRect(
      {
        x: cx,
        y: start[1] - h / 2,
        width: Math.abs(chartW),
        height: h - 6,
      },
      {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height,
      }
    );
    return (
      rectShape && {
        type: "rect",
        shape: rectShape,
        style: {
          fill: c,
        },
      }
    );
  };
  /** 渲染夜晚背景图 */
  ChartbloodPressure.prototype.renderNightBG = function (params, api) {
    try {
      var p0 = api.coord([0, 0]);
      var p1 = api.coord([100, params.coordSys.height]);
      var rectShape = echarts_1.graphic.clipRectByRect(
        {
          x: p0[0],
          y: params.coordSys.y,
          width: Math.abs(p0[0] - p1[0]),
          height: params.coordSys.height,
        },
        {
          x: params.coordSys.x,
          y: params.coordSys.y,
          width: params.coordSys.width,
          height: params.coordSys.height,
        }
      );
      return {
        type: "rect",
        shape: rectShape,
        style: {
          fill: "#ededed",
          // opacity: 0.5
        },
      };
    } catch (error) {}
    return undefined;
  };
  ChartbloodPressure.prototype.getStatisticsCD = function (i18n) {
    var self = this;
    var left = 35;
    var top = 50;
    var cd = {
      tooltip: {
        formatter: function (param) {
          var values = param.value;
          var html = "";
          if (values && values.length > 4) {
            if (i18n) {
              var totalStr = i18n("common.total");
              var val = values[2];
              var total = values[3];
              html +=
                param.marker +
                '<font color="#ddd">' +
                values[4] +
                "</font>: " +
                Math.floor((val * 100) / total) +
                "%\n                        <br>" +
                param.marker +
                '<font color="#ddd">' +
                totalStr +
                ":</font> " +
                val +
                " / " +
                total;
            }
          }
          return html;
        },
      },
      grid: {
        left: left,
        right: 8,
        top: "15%",
        bottom: 75,
        containLabel: true,
        show: false,
        backgroundColor: "",
      },
      xAxis: {
        type: "value",
        min: 0,
        max: 100,
        boundaryGap: false,
        axisLabel: {
          fontSize: 9,
          color: "#3C4868",
          formatter: function (val) {
            var p = Math.abs(val);
            if (p > 0) {
              return p + "%";
            }
            return val;
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          color: "#1B688C",
          show: true,
        },
        axisLine: {
          lineStyle: {
            color: "#EDEDF3",
          },
        },
        splitArea: {
          show: false,
          interval: function (index, value) {
            // console.log('sa ----->', index, 'val', value);
            if (parseInt(value) >= 0) {
              return true;
            }
            return false;
          },
          areaStyle: {
            color: "#ededed",
          },
        },
      },
      yAxis: {
        type: "category",
        data: [""],
        axisLabel: {
          fontSize: 12,
          interval: 0,
          color: "#3C4868",
          formatter: function (val) {
            //@ts-ignore
            var label = self.yLabelMap[val];
            if (label) {
              return label;
            }
            // if (/^ignore\-/.test(val)) {
            //     return '';
            // }
            return val;
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          color: "#1B688C",
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: "#EDEDF3",
          },
        },
        // boundaryGap: false,
        splitArea: {
          show: false,
          interval: function (index, value) {
            // console.log("sa ----->", index, "val", value);
            var lowIndexList = ["0", "<80", "80-89", "90-120", ">120"];
            if (lowIndexList.indexOf(value) > -1) {
              return true;
            }
            return false;
          },
          areaStyle: {
            color: "#ededed",
          },
        },
      },
      series: [
        {
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBlood.call(self, params, api);
          },
          itemStyle: {
            normal: {
              color: "#f00",
            },
          },
          data: [],
        },
        {
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBlood.call(self, params, api);
          },
          itemStyle: {
            normal: {
              color: "#f00",
            },
          },
          data: [],
        },
        {
          type: "custom",
          renderItem: function (params, api) {
            return self.renderNightBG.call(self, params, api);
          },
          z: 0,
          silent: true,
          data: [1],
        },
      ],
    };
    return cd;
  };
  ChartbloodPressure.prototype.genYCategory = function () {
    var yCategoryLow = [">120", "90-120", "80-89", "<80"];
    var yCategoryHigh = ["<120", "120-129", "130-139", "140-180", ">180"];
    var yCategories = [];
    yCategoryLow.forEach(function (item, i) {
      yCategories.push("ignore-l" + i + "a");
      yCategories.push(item);
      yCategories.push("ignore-l" + i + "b");
    });
    yCategories.push("0");
    yCategoryHigh.forEach(function (item, i) {
      yCategories.push("ignore-h" + i + "a");
      yCategories.push(item);
      yCategories.push("ignore-h" + i + "b");
    });
    return yCategories;
  };
  /** 获取血压图
   * @param helpFunc 显示帮助回调函数
   * @param helpFuncThis 显示帮助回调函数 this
   */
  ChartbloodPressure.prototype.getCD = function (helpFunc, helpFuncThis) {
    var self = this;
    var left = 35;
    var yCategories = this.genYCategory();
    var ctx = {
      help: false,
    };
    var cd = {
      dataZoom: [
        {
          startValue: 0,
          endValue: 10,
          xAxisIndex: [0],
          bottom: 10,
          height: 20,
        },
        {
          type: "inside",
          startValue: 0,
          xAxisIndex: [0],
          endValue: 10,
        },
      ],
      title: [
        {
          text: "高压 (收缩压)",
          textStyle: {
            fontSize: 12,
          },
          top: 18,
        },
        {
          text: "低压 (舒张压)",
          textStyle: {
            fontSize: 12,
          },
          bottom: 25,
        },
      ],
      legend: {
        show: true,
        itemWidth: 18,
        left: 10,
        data: [
          this.labelMap.l0,
          this.labelMap.l1,
          this.labelMap.l2,
          this.labelMap.l3,
          this.labelMap.l4,
        ],
      },
      tooltip: {
        textStyle: {
          fontSize: 15,
          color: "#fff",
        },
        backgroundColor: "rgba(0,0,0,0.5)",
        borderColor: "rgba(255,255,255,0.5)",
        borderWidth: 0,
        confine: true, //是否将 tooltip 框限制在图表的区域内
        formatter: function (param) {
          //   console.log(param);
          var values = param.value;
          var html = "";
          if (values && values.length > 4) {
            var time = values[0];
            var high = values[3];
            var low = values[6];
            var lv = values[7];
            // @ts-ignore
            var label = self.labelMap["l" + lv];
            // html += param.marker + "<font color=\"#ddd\">" + time + "</font><br><span style=\"font-size: 18px\"> " + label + " <br>" + high + "--" + low + "</span>";

            html += `${param.marker} ${time}\n${label}\n${high}--${low}`;
          }
          return html;
        },
      },
      grid: [
        {
          left: left,
          right: 8,
          top: "15%",
          bottom: 75,
          show: false,
          containLable: true,
        },
      ],
      xAxis: [
        {
          type: "category",
          data: [],
          boundaryGap: [0, 0],
          axisLabel: {
            // inside: true,
            formatter: function (val) {
              // const d = new Date(val)
              // return d.format('MM-dd HH:mm')
              return "";
            },
            fontSize: 12,
            color: "#3C4868",
          },
          splitLine: {
            show: false,
          },
          gridIndex: 0,
          axisTick: {
            show: false,
            color: "#1B688C",
          },
          axisLine: {
            lineStyle: {
              color: "#EDEDF3",
            },
          },
          // show: false,
        },
        {
          type: "value",
          boundaryGap: [0, 0],
          gridIndex: 0,
          show: false,
          min: 0,
          max: 100,
        },
      ],
      yAxis: [
        {
          type: "category",
          data: yCategories,
          gridIndex: 0,
          name: "",
          nameTextStyle: {
            fontSize: 16,
          },
          axisLabel: {
            fontSize: 12,
            interval: 0,
            color: "#3C4868",
            formatter: function (val) {
              //@ts-ignore
              var label = self.yLabelMap[val];
              if (label) {
                return label;
              }
              if (/^ignore\-/.test(val)) {
                return "";
              }
              return val;
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            color: "#1B688C",
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: "#EDEDF3",
            },
          },
        },
        {
          type: "value",
          gridIndex: 0,
          show: false,
          min: 0,
          max: 100,
        },
      ],
      series: [
        {
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBGItem.call(self, params, api);
          },
          xAxisIndex: 1,
          yAxisIndex: 0,
          silent: true,
          zlevel: 0,
          z: 0,
          data: [
            {
              itemStyle: {
                color: self.colorMap.l4,
              },
              value: [0, ">180"],
            },
            {
              itemStyle: {
                color: self.colorMap.l3,
              },
              value: [0, "140-180"],
            },
            {
              itemStyle: {
                color: self.colorMap.l2,
              },
              value: [0, "130-139"],
            },
            {
              itemStyle: {
                color: self.colorMap.l1,
              },
              value: [0, "120-129"],
            },
            {
              itemStyle: {
                color: self.colorMap.l0,
              },
              value: [0, "<120"],
            },
            {
              itemStyle: {
                color: self.colorMap.l4,
              },
              value: [0, ">120"],
            },
            {
              itemStyle: {
                color: self.colorMap.l3,
              },
              value: [0, "90-120"],
            },
            {
              itemStyle: {
                color: self.colorMap.l2,
              },
              value: [0, "80-89"],
            },
            {
              itemStyle: {
                color: self.colorMap.l0,
              },
              value: [0, "<80"],
            },
            {
              itemStyle: {
                color: self.colorMap.l0,
              },
              value: [1, "0"],
            },
          ],
        },
        {
          name: self.labelMap.l0,
          itemStyle: {
            color: self.colorMap.l0,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderItem.call(self, params, api, true);
          },
          encode: {
            x: 0,
            y: [1, 2, 3, 4],
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          name: self.labelMap.l1,
          itemStyle: {
            color: self.colorMap.l1,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          name: self.labelMap.l2,
          itemStyle: {
            color: self.colorMap.l2,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          name: self.labelMap.l3,
          itemStyle: {
            color: self.colorMap.l3,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          name: self.labelMap.l4,
          itemStyle: {
            color: self.colorMap.l4,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
      ],
    };
    return cd;
  };
  ChartbloodPressure.prototype.resetSeries = function (cd) {
    try {
      var series = cd.series;
      series[2].data.length = 0;
      series[3].data.length = 0;
    } catch (error) {}
  };
  ChartbloodPressure.prototype.insertData = function (
    cd,
    high,
    low,
    level,
    time,
    timeMap
  ) {
    if (level >= 0) {
      var series = cd.series;
      var xAxis = cd.xAxis;
      var d = new Date(time);

      let year = d.getFullYear(),
        month = (d.getMonth() + 1).toString().padStart(2, "0"),
        days = d.getDate().toString().padStart(2, "0"),
        hours = d.getHours().toString().padStart(2, "0"),
        Minutes = d.getMinutes().toString().padStart(2, "0"),
        seconds = d.getSeconds().toString().padStart(2, "0");

      var dateStr = `${month}-${days} ${hours}:${Minutes}:${seconds}`;
      var shortDate = `${month}-${days}`;
      // var dateStr = d.format('MM-dd HH:mm:ss');
      // var shortDate = d.format('MM-dd');

      var flag = timeMap[shortDate];
      if (!flag) {
        timeMap[shortDate] = true;
      }
      var timeLabel = void 0;
      if (!flag) {
        timeLabel = `${hours}:${Minutes}\n${month}-${days}`;
      } else {
        timeLabel = `${hours}:${Minutes}`;
      }
      xAxis[0].data.push(dateStr);
      var upY = this.getUpY(high);
      var downY = this.getDownY(low);
      var tmpVal = {
        value: [
          dateStr,
          upY.y,
          upY.val,
          high,
          downY.y,
          downY.val,
          low,
          level,
          time,
          timeLabel,
        ],
      };
      series[level + 1].data.push(tmpVal);
    }
  };
  ChartbloodPressure.prototype.insertStatisticsData = function (
    cd,
    yAxisDataItem,
    val,
    total,
    lv,
    time,
    isLow
  ) {
    var series = cd.series;
    var percent = Math.floor((val * 100) / total);
    var isNight = this.isNightTime(time) ? 1 : -1;
    if (isLow) {
      series[0].data.push({
        itemStyle: {
          //@ts-ignore
          color: this.colorMap["l" + lv],
        },
        value: [percent * isNight, yAxisDataItem, val, total, "低压", lv],
      });
    } else {
      series[1].data.push({
        itemStyle: {
          //@ts-ignore
          color: this.colorMap["l" + lv],
        },
        value: [percent * isNight, yAxisDataItem, val, total, "高压", lv],
      });
    }
  };
  ChartbloodPressure.prototype.isNightTime = function (time) {
    var d = new Date(time);
    var h = d.getHours();
    if ((h >= 0 && h < 7) || h >= 19) {
      return true;
    }
    return false;
  };
  /**
   * 把接口原始数据，转换成生成血压图 chartData
   * @param res 接口返回的原始数据
   * @param helpFunc 显示帮助回调函数
   * @param helpFuncThis 显示帮助回调函数 this
   *
   */
  ChartbloodPressure.prototype.createBloodPressureChart = function (
    res,
    helpFunc,
    helpFuncThis
  ) {
    var _this = this;
    try {
      var cd_1 = this.getCD(helpFunc, helpFuncThis);
      if (res && res.code === 0) {
        var map = res.data.bloodPressures;
        var tmpTimeMap_1 = {};
        for (var key in map) {
          var list = map[key];
          list.forEach(function (item) {
            _this.insertData(
              cd_1,
              item.high,
              item.low,
              item.riskLevel,
              item.time,
              tmpTimeMap_1
            );
          });
          if (list.length > 10) {
            cd_1.dataZoom[0].endValue = list.length - 1;
            cd_1.dataZoom[0].startValue = list.length - 11;
            cd_1.dataZoom[1].endValue = list.length - 1;
            cd_1.dataZoom[1].startValue = list.length - 11;
          }
        }
        // if(arr.length == 0){
        //     res.data.recorders.forEach(function (item) {
        //         _this.insertData(cd_1, item.high, item.low, item.riskLevel, item.time, tmpTimeMap_1);
        //     });
        // }else{
        //     for (var key in map) {
        //         var list = [...map[key],...res.data.recorders];
        //         list.forEach(function (item) {
        //             _this.insertData(cd_1, item.high, item.low, item.riskLevel, item.time, tmpTimeMap_1);
        //         });
        //     }
        // }

        // for (var key in map) {
        //     var list = map[key];
        //     list.forEach(function (item) {
        //         _this.insertData(cd_1, item.high, item.low, item.riskLevel, item.time, tmpTimeMap_1);
        //     });
        // }
      }
      return cd_1;
    } catch (error) {
      console.log(error);
    }
    return undefined;
  };
  ChartbloodPressure.prototype.createBloodPressureStatisticsChart = function (
    res,
    i18n
  ) {
    var _this = this;
    var cd = this.getStatisticsCD(i18n);
    cd.yAxis.data.length = 0;
    var yCategory = [
      ">120",
      "90-120",
      "80-89",
      "<80",
      "0",
      "<120",
      "120-129",
      "130-139",
      "140-180",
      ">180",
    ];
    yCategory.forEach(function (item) {
      cd.yAxis.data.push(item);
    });
    try {
      //   console.log("create blood pressure statistic");
      if (res && res.code === 0) {
        var lowIndexList = ["<80", "80-89", "90-120", ">120"];
        var highIndexList = ["<120", "120-129", "130-139", "140-180", ">180"];
        var map = res.data.bloodPressures;
        var _loop_1 = function (key) {
          var list = map[key];
          var highMap = {};
          var lowMap = {};
          var hTotal = 0;
          var lTotal = 0;
          list.forEach(function (item) {
            // this.insertStatisticsData(cd, item.high, item.low, item.riskLevel, item.time, ind + '');
            // log
            var upVal = _this.getUpY(item.high);
            var downVal = _this.getDownY(item.low);
            var hObj = highMap[upVal.y];
            if (!hObj) {
              hObj = {
                val: 0,
                lv: item.riskLevel,
              };
              highMap[upVal.y] = hObj;
            }
            var hVal = hObj.val;
            if (hVal > 0) {
              hVal++;
            } else {
              hVal = 1;
            }
            var lObj = lowMap[downVal.y];
            if (!lObj) {
              lObj = {
                val: 0,
                lv: item.riskLevel,
              };
              lowMap[downVal.y] = lObj;
            }
            var lVal = lObj.val;
            if (lVal > 0) {
              lVal++;
            } else {
              lVal = 1;
            }
            hObj.val = hVal;
            lObj.val = lVal;
          });
          for (var val in highMap) {
            hTotal += highMap[val].val;
          }
          for (var val in lowMap) {
            lTotal += lowMap[val].val;
          }
          //   console.log("high map", highMap, hTotal);
          //   console.log("high map low", lowMap, lTotal);
          for (var val in highMap) {
            var item = highMap[val];
            var lv = highIndexList.indexOf(val);
            this_1.insertStatisticsData(
              cd,
              val,
              item.val,
              hTotal,
              lv,
              item.time
            );
          }
          for (var val in lowMap) {
            var item = lowMap[val];
            var lv = lowIndexList.indexOf(val);
            this_1.insertStatisticsData(
              cd,
              val,
              item.val,
              lTotal,
              lv,
              item.time,
              true
            );
          }
        };
        var this_1 = this;
        for (var key in map) {
          _loop_1(key);
        }
      }
    } catch (error) {
      //   console.warn("create blood pressure statistics error", error);
    }
    return cd;
  };
  ChartbloodPressure.prototype.cacheBloodData = function (cd) {
    // console.log("cache blood data");
    var retList = [];
    try {
      var series = cd.series;
      for (var i = 0; i < series.length; i++) {
        var item = series[i];
        if (item.data) {
          retList.push([].concat(item.data));
        }
      }
    } catch (error) {}
    return retList;
  };
  //#region new blood pressure
  ChartbloodPressure.prototype.renderBarItem = function (params, api, isUp) {
    var x = api.value(0);
    var high = api.value(1);
    var low = api.value(2);
    var lv = api.value(3);
    var hval = api.value(5);
    var lval = api.value(6);
    var size = api.size([1, 1]);
    var w0 = 15;
    var r = w0 / 2;
    var border = 2;
    var p0 = api.coord([x, high]);
    var p1 = api.coord([x, low]);
    // p0[1] += r * size[1];
    // p1[1] -= r * size[1];
    // console.log('blood pressure h', highVal, high, 'l', lowVal, low, 'ph', p0, 'pl', p1);
    var g = { type: "group", children: [] };
    // @ts-ignore
    var frameColor = this.frameColorMap["l" + lv];
    var shadowColor = "#888";
    var shadowBlur = 10;
    var sr1 = {};
    sr1.x = p0[0] - w0 / 2;
    sr1.y = p0[1];
    sr1.width = w0;
    sr1.height = Math.abs(p0[1] - p1[1]);
    sr1.r = w0 / 2;
    var rect = {};
    rect.shape = sr1;
    rect.type = "rect";
    rect.style = {
      fill: frameColor,
      shadowBlur: shadowBlur,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: shadowColor,
    };
    g.children.push(rect);
    var sr2 = {};
    sr2.x = p0[0] - w0 / 2 + border;
    sr2.y = p0[1] + border;
    sr2.width = w0 - border * 2;
    sr2.height = sr1.height - border * 2;
    sr2.r = sr2.width / 2;
    var rect2 = {};
    rect2.shape = sr2;
    rect2.type = "rect";
    rect2.style = api.style();
    g.children.push(rect2);
    var hText = {
      type: "text",
      style: {
        x: p0[0],
        y: sr1.y,
        text: "" + hval,
        fill: "#333",
        lineWidth: 1,
        font: "bold",
        fontSize: 14,
        textAlign: "center",
        textVerticalAlign: "bottom",
      },
    };
    g.children.push(hText);
    var lText = {
      type: "text",
      style: {
        x: p0[0],
        y: sr1.y + sr1.height + 4,
        text: "" + lval,
        fill: "#333",
        lineWidth: 1,
        font: "bold",
        fontSize: 14,
        textAlign: "center",
        textVerticalAlign: "top",
      },
    };
    g.children.push(lText);
    return g;
  };
  ChartbloodPressure.prototype.getSery = function (list, type) {
    var target = undefined;
    list.every(function (item) {
      if (item.myType == type) {
        target = item;
      }
      return !target;
    });
    return target;
  };
  ChartbloodPressure.prototype.vlineRender = function (params, api) {
    var list = [];
    var x = api.value(0);
    var h = api.value(1);
    var l = api.value(2);
    var hv = api.value(5);
    var lv = api.value(6);
    var ph = api.coord([x, h]);
    var pl = api.coord([x, l]);
    var rect = {};
    rect.x = ph[0] - 2;
    rect.y = ph[1];
    rect.width = 4;
    rect.height = Math.abs(ph[1] - pl[1]);
    rect.r = 2;
    var r = {
      type: "rect",
      shape: rect,
      style: {
        // fill: this.lineColor,
        fill: "#A7D1FC",
      },
    };
    list.push(r);
    var hText = {
      type: "text",
      style: {
        x: rect.x + 1,
        y: rect.y,
        text: "" + hv,
        fill: this.lineColor,
        lineWidth: 1,
        font: "bold",
        fontSize: 12,
        textAlign: "center",
        textVerticalAlign: "top",
      },
    };
    list.push(hText);
    var lText = {
      type: "text",
      style: {
        x: rect.x + 1,
        y: rect.y + rect.height,
        text: "" + lv,
        fill: this.lineColor,
        lineWidth: 1,
        font: "bold",
        fontSize: 12,
        textAlign: "center",
        textVerticalAlign: "bottom",
      },
    };
    list.push(lText);
    return {
      type: "group",
      children: list,
    };
  };
  /**
   * @deprecated
   * @param param
   * @param api
   * @returns
   */
  ChartbloodPressure.prototype.textRender = function (param, api) {
    var textList = [];
    var len = api.value(0);
    // console.log("text len", len);
    var per = 6;
    // console.log("xxxx", len, "val", api.value(1));
    for (var i = 0; i < len; i++) {
      var ms = api.value(i * per + 1);
      var h = api.value(i * per + 2);
      var l = api.value(i * per + 3);
      var hVal = api.value(i * per + 4);
      var lVal = api.value(i * per + 5);
      var isToday = api.value(i * per + 6) > 0;
      var posH = api.coord([ms, h]);
      // if (i == 1) {
      //   console.log("text len xxxx", i, "ms", ms, "h", h, "l", l);
      // }
      var yH = isToday ? posH[1] : posH[1] + 2;
      var hText = {
        type: "text",
        style: {
          x: posH[0],
          y: yH,
          text: "" + hVal,
          // fill: isToday ? '#000' : '#ccc',
          fill: isToday ? "#333" : this.lineColor,
          lineWidth: 1,
          font: "bold",
          fontSize: isToday ? 14 : 12,
          // textAlign: isToday ? 'right' : 'left',
          textAlign: "center",
          textVerticalAlign: isToday ? "bottom" : "top",
        },
      };
      textList.push(hText);
      var posL = api.coord([ms, l]);
      var yL = isToday ? posL[1] + 2 : posL[1] - 2;
      var lText = {
        type: "text",
        style: {
          x: posL[0],
          y: yL,
          text: "" + lVal,
          fill: isToday ? "#333" : this.lineColor,
          lineWidth: 1,
          font: "bold",
          fontSize: isToday ? 14 : 12,
          // textAlign: isToday ? 'right' : 'left',
          textAlign: "center",
          textVerticalAlign: isToday ? "top" : "bottom",
        },
      };
      textList.push(lText);
    }
    return {
      type: "group",
      children: textList,
    };
  };
  ChartbloodPressure.prototype.xLabelColor = function (val, list) {
    if (list.indexOf(val) > -1) {
      return this.lineColor;
    }
    return "#333";
  };
  /**
   * @deprecated
   * @returns
   */
  ChartbloodPressure.prototype.genNewYCategory = function () {
    var yCategory = [];
    return yCategory;
  };
  ChartbloodPressure.prototype.createNewBloodPressure = function (
    res,
    todayTS,
    todayEnd,
    yesterdayTS
  ) {
    // console.warn("createNewBloodPressure", todayTS, todayEnd, yesterdayTS);
    var _this = this;
    var self = this;
    var yCategories = this.genNewYCategory();
    var yesterdayXLabels = [];
    var cd = {
      animation: false,
      legend: {
        show: true,
        right: 0,
        top: 10,
        data: [
          this.labelMap.l0,
          this.labelMap.l1,
          this.labelMap.l2,
          this.labelMap.l3,
          this.labelMap.l4,
          // {
          //     name: '昨天',
          //     icon: 'line',
          //     lineStyle:{
          //         color: '#A7D1FC',
          //         borderColor: '#A7D1FC',
          //     }
          // }
        ],
      },
      title: [
        {
          subtext: "昨天:",
          bottom: 27,
          left: -4,
          subtextStyle: { color: self.lineColor },
        },
        {
          subtext: "当天:",
          bottom: 12,
          left: -4,
          subtextStyle: { color: "#333", fontWeight: "bold" },
        },
      ],
      grid: [
        {
          left: 30,
          right: 10,
          top: "15%",
          bottom: 50,
          show: false,
          containLable: true,
        },
      ],
      xAxis: [
        {
          type: "category",
          boundaryGap: ["0%", "0%"],
          data: [],
          position: "bottom",
          offset: 14,
          axisLabel: {
            interval: 0,
            // inside: true,
            formatter: function (val) {
              if (val.indexOf("t") > -1) {
                var str = val.replace("t", "");
                var d = parseInt(str);
                // return new Date(d).format('hh:mm')
                return ms2HHmmssFormat(d, "HH:mm");
              } else {
                // let str = val.replace('y', '');
                // const d = parseInt(str);
                // return utilDate.ms2HHmmssFormat(d, 'HH:mm');
                return "";
              }
            },
            fontSize: 11,
            textStyle: {
              color: function (val) {
                if (val.indexOf("y") > -1) {
                  return self.lineColor;
                }
                return "#333";
              },
              fontWeight: "bold",
            },
          },
          splitLine: {
            show: false,
          },
          gridIndex: 0,
          axisTick: {
            show: false,
            color: "#1B688C",
          },
          axisLine: {
            lineStyle: {
              color: "#EDEDF3",
            },
          },
        },
        {
          type: "value",
          boundaryGap: ["0%", "0%"],
          gridIndex: 0,
          show: false,
          min: 0,
          max: 100,
        },
        {
          type: "category",
          boundaryGap: ["0%", "0%"],
          data: [],
          position: "bottom",
          axisLabel: {
            interval: 0,
            // inside: true,
            formatter: function (val) {
              if (val.indexOf("t") > -1) {
                return "";
              } else {
                var str = val.replace("y", "");
                var d = parseInt(str);
                // return new Date(d).format('hh:mm')
                return ms2HHmmssFormat(d, "HH:mm");
              }
            },
            fontSize: 11,
            textStyle: {
              color: function (val) {
                if (val.indexOf("y") > -1) {
                  return self.lineColor;
                }
                return "#333";
              },
            },
          },
          splitLine: {
            show: false,
          },
          gridIndex: 0,
          axisTick: {
            show: false,
            color: "#1B688C",
          },
          axisLine: {
            lineStyle: {
              color: "#EDEDF3",
            },
          },
        },
      ],
      yAxis: [
        {
          type: "category",
          data: yCategories,
          gridIndex: 0,
          name: "",
          nameTextStyle: {
            fontSize: 16,
          },
          axisLabel: {
            fontSize: 12,
            interval: 0,
            color: "#3C4868",
            formatter: function (val) {
              if (/^ignore\-/.test(val)) {
                return "";
              }
              return val;
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            color: "#1B688C",
            show: false,
          },
          show: false,
          axisLine: {
            lineStyle: {
              color: "#EDEDF3",
            },
          },
        },
        {
          type: "value",
          gridIndex: 0,
          show: true,
          position: "left",
          axisLabel: {
            fontSize: 11,
            interval: 0,
            color: "#3C4868",
            formatter: function (val) {
              if (val == 85) {
                return "140";
              } else if (val == 75) {
                return "100";
              } else if (val == 50) {
                return "0";
              } else if (val == 28) {
                return "60";
              } else if (val == 17) {
                return "90";
              }
              return "";
            },
          },
          min: 0,
          interval: 1,
          max: 100,
          splitLine: {
            show: false,
          },
          axisTick: {
            color: "#aaa",
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: "#EDEDF3",
            },
          },
        },
      ],
      series: [
        {
          animation: false,
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBGItem.call(self, params, api);
          },
          myType: "bg",
          xAxisIndex: 1,
          yAxisIndex: 0,
          silent: true,
          zlevel: 0,
          z: 0,
          data: [],
        },
        {
          animation: false,
          name: this.labelMap.l0,
          myType: "l0",
          itemStyle: {
            color: this.colorMap.l0,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBarItem.call(self, params, api, true);
          },
          encode: {
            x: 0,
            y: [1, 2, 3, 4],
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          animation: false,
          name: this.labelMap.l1,
          myType: "l1",
          itemStyle: {
            color: this.colorMap.l1,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBarItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          animation: false,
          name: this.labelMap.l2,
          myType: "l2",
          itemStyle: {
            color: this.colorMap.l2,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBarItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          animation: false,
          name: this.labelMap.l3,
          myType: "l3",
          itemStyle: {
            color: this.colorMap.l3,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBarItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          animation: false,
          name: this.labelMap.l4,
          myType: "l4",
          itemStyle: {
            color: this.colorMap.l4,
          },
          type: "custom",
          renderItem: function (params, api) {
            return self.renderBarItem.call(self, params, api, true);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        // {
        //     myType: 'lineH',
        //     type: 'line',
        //     smooth: true,
        //     xAxisIndex: 0,
        //     itemStyle: {
        //         color: this.lineColor,
        //     },
        //     yAxisIndex: 1,
        //     data: []
        // },
        // {
        //     myType: 'lineL',
        //     type: 'line',
        //     smooth: true,
        //     xAxisIndex: 0,
        //     yAxisIndex: 1,
        //     itemStyle: {
        //         color: this.lineColor,
        //     },
        //     data: []
        // },
        {
          myType: "vLine",
          type: "custom",
          name: "昨天",
          renderItem: function (param, api) {
            return self.vlineRender.call(self, param, api);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
        {
          myType: "text",
          type: "custom",
          renderItem: function (param, api) {
            return self.textRender.call(self, param, api);
          },
          xAxisIndex: 0,
          yAxisIndex: 1,
          data: [],
        },
      ],
    };
    if (res && res.code === 0) {
      var map = res.data.bloodPressures;
      var series_1 = cd.series;
      // const lineHSery = this.getSery(series, 'lineH');
      // const lineLSery = this.getSery(series, 'lineL');
      var vlineLSery_1 = this.getSery(series_1, "vLine");
      var textSery = this.getSery(series_1, "text");
      var textDataList_1 = [0];
      var xData_1 = [];
      var _loop_2 = function (key) {
        var list = map[key];
        var cnt = 0;
        var yes = 0;
        list.forEach(function (item) {
          // if (item.time < yesterdayTS) {
          if (item.time < todayTS) {
            return;
          }
          var high = 50 + (item.high / 200) * 50;
          var low = 50 - (item.low / 140) * 50;
          var ms = getHoursMS(item.time);
          //   console.log(ms);
          // var ms = u_date_1.utilDate.getHoursMS(item.time);

          if (item.time >= yesterdayTS && item.time < todayEnd) {
            // console.log("今天", item);
            var x = "t" + ms;
            xData_1.push(x);
            cnt++;
            //今天
            var sery = _this.getSery(series_1, "l" + item.riskLevel);
            sery.data.push([
              x,
              high,
              low,
              item.riskLevel,
              item.time,
              item.high,
              item.low,
            ]);
            textDataList_1.push(x);
            textDataList_1.push(Math.floor(high));
            textDataList_1.push(Math.floor(low));
            textDataList_1.push(Math.floor(item.high));
            textDataList_1.push(Math.floor(item.low));
            textDataList_1.push(1);
          } else if (item.time >= todayTS && item.time < yesterdayTS) {
            var x = "y" + ms;
            xData_1.push(x);
            yesterdayXLabels.push(x);
            yes++;
            // console.log("昨天", item);
            //昨天
            // lineHSery.data.push([ms + '', high, item.riskLevel, item.time]);
            // lineLSery.data.push([ms + '', low, item.riskLevel, item.time]);
            vlineLSery_1.data.push([
              x,
              high,
              low,
              item.riskLevel,
              item.time,
              item.high,
              item.low,
            ]);
            textDataList_1.push(x);
            textDataList_1.push(Math.floor(high));
            textDataList_1.push(Math.floor(low));
            textDataList_1.push(Math.floor(item.high));
            textDataList_1.push(Math.floor(item.low));
            textDataList_1.push(0);
          }
        });
        // textSery.data = [textDataList] as any;
        xData_1.sort(function (a, b) {
          var aval = parseInt(a.substring(1, a.length));
          var bval = parseInt(b.substring(1, b.length));
          return aval - bval;
        });
        // textDataList[0] = cnt + yes;
        //@ts-ignore
        // cd.xAxis[0].data.$copy(xData_1, true);
        cd.xAxis[0].data = xData_1;
        // //@ts-ignore
        // cd.xAxis[2].data.$copy(xData_1, true);
        cd.xAxis[2].data = xData_1;
        // console.log("bp item", cnt, "yes", yes);
      };
      for (var key in map) {
        _loop_2(key);
      }
    }
    return cd;
  };
  return ChartbloodPressure;
})();
// eslint-disable-next-line no-undef
// exports.chartbloodPressure = new ChartbloodPressure();
export const chartbloodPressure = new ChartbloodPressure();
