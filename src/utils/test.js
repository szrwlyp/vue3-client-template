window.isWeiXin = FD.isWeiXin();
// 59 羊城好医生; 61 南粤好医生; 60 羊城青年好医生; 62 南粤青年好医生;  63 科普好医生;
var apiUrl = "";
var baseUrl = "";
var path = window.location.pathname.split("/")[2];
var homePage = "https://m.familydoctor.com.cn/hys/" + path;
var $bizUrl = "https://jkapi.bj.familydoctor.com.cn/cby/goWxAuth?bizUrl=";
var charStr = "abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789"; //随机数模板

if (location.href.match(/familydoctor.com.cn/g)) {
  apiUrl = "https://jkapi.bj.familydoctor.com.cn/cby/";
  baseUrl = apiUrl;
} else {
  apiUrl = "http://192.168.2.33:8096/";
  homePage = "http://192.168.2.212:8080/";
  baseUrl = apiUrl;
}

var reg_host = RegExp(/familydoctor.cn/g);

if (window.location.href.match(reg_host)) {
  baseUrl = "https://cby.familydoctor.cn/cbyapi/";
  homePage = "https://cby.familydoctor.cn/hys/" + path;
  $bizUrl = "https://cby.familydoctor.cn/cbyapi/goWxAuth?bizUrl=";
  apiUrl = baseUrl;
}

var mobileHysUrl = "";
var option_id = "";
var catalog_id = "";
var subscribe;
var hos_id = 0;
var comData, cC;
var cSub = [];
var k = 0;
var g = 0;

var pageRank = 1; //排行榜当前数
var rankTotal = 0; //排行榜药品总数
var rankPages = 0; //排行榜总页数

FD.ready(function () {
  document.documentElement.style.fontSize =
    document.body.clientWidth / 30 + "px";

  if (FD.isIphoneXFamily()) {
    document.body.classList.add("iphone-x-family");
  }

  if (
    isWeiXin &&
    !document.querySelector(".dr-dep-list") &&
    !document.querySelector(".dr-detail") &&
    !document.querySelector(".js-btn-sign") &&
    !document.querySelector(".js-btn-getcert")
  ) {
    weShare();
  }

  getCert();
  signIn();

  lazyloadImg(true);
  //initSearch();
  topNavActive();

  //首页医生/分科
  ychysList(); //羊城好医生
  nyhysList(); //南粤好医生
  ycqnhysList(); //羊城青年好医生
  nyqnhysList(); //南粤青年好医生
  kphysDrList();

  //indexGetDrLi();
  indexHotDr();

  ychysDrList(); //医生列表
  hospitalLi(); //医院列表-羊城好医生

  docDetail();
  articleBack();

  phbSearch();

  FD.dom.on("click", ".top-wrap ul li", function () {
    if (this.classList.length > 0) {
      FD.scrollToElement("#" + this.classList[0], -20);
    }
    var l = this.parentNode.querySelectorAll("li");
    l.forEach(function (a) {
      a.classList.remove("on");
    });
    this.classList.add("on");
  });

  topSearchHref();
  initPhb();

  FD.dom.on("click", ".btn-search-fixed", function () {
    FD.scrollToElement(".search_top");
    document.querySelector(".search_top input").focus();
  });
});

// 点亮头部
function topNavActive() {
  if (!document.querySelector(".js-top-nav")) {
    return;
  }

  var $wrap = document.querySelector(".js-top-nav");
  var $li = $wrap.querySelectorAll("li");
  var bdId = FD.getQueryString(location.href, "bdId");
  var $index = 0;

  switch (
    Number(bdId) // 59 羊城好医生; 61 南粤好医生; 60 羊城青年好医生; 62 南粤青年好医生;  63 科普好医生;
  ) {
    case 59:
      $index = 1;
      break;
    case 61:
      $index = 3;
      break;
    case 60:
      $index = 2;
      break;
    case 62:
      $index = 4;
      break;
    case 63:
      $index = 5;
      break;
    default:
      break;
  }

  if ($wrap.querySelector("li.on")) {
    $wrap.querySelector("li.on").classList.remove("on");
  }
  $li[$index].classList.add("on");
}

// 首页医生列表轮播
function indexSliderDrList(index) {
  if (!document.querySelector(".js-slider-drlist")) {
    return;
  }

  var $item = document.querySelectorAll(".js-slider-drlist")[index];

  new FD.Slider({
    ele: $item,
    auto: true,
    showNav: false,
    showPager: true,
    showAction: true,
  });
}

// 滚动点亮头部
function hysNavActive() {
  if (window.location.href.split("#")[0] !== homePage) {
    return;
  }

  var tabs = document.querySelectorAll(".top-wrap li");

  var getOffsetTop = function (id) {
    return document.getElementById(id).offsetTop - 50;
  };

  var fn = FD.throttle(function () {
    var scrollTop =
      document.documentElement.scrollTop ||
      window.pageYOffset ||
      document.body.scrollTop;

    tabs[0].parentNode.querySelector(".on").classList.remove("on");

    if (scrollTop > getOffsetTop("hzhb")) {
      tabs[8].classList.add("on");
    } else if (scrollTop > getOffsetTop("wqhg")) {
      tabs[7].classList.add("on");
    } else if (scrollTop > getOffsetTop("nyhys")) {
      tabs[4].classList.add("on");
    } else if (scrollTop > getOffsetTop("ycqnhys")) {
      tabs[3].classList.add("on");
    } else if (scrollTop > getOffsetTop("ychys")) {
      tabs[2].classList.add("on");
    } else {
      tabs[0].classList.add("on");
    }
  }, 300);

  window.addEventListener("scroll", fn);
}

function scrollToElement(ele, offset) {
  ele = document.querySelector(ele);
  offset = offset || 0;
  document.documentElement.style.scrollBehavior = "smooth";
  document.body.style.scrollBehavior = "smooth";
  window.scrollTo(0, ele.offsetTop + offset);
}

function lazyloadImg(listenScroll) {
  var imgs = document.querySelectorAll("img");

  function isIn(el) {
    var bound = el.getBoundingClientRect();
    var clientHeight = window.innerHeight;

    if (bound.top <= clientHeight && bound.top > 0) {
      return true;
    }
  }

  function check() {
    imgs.forEach(function (el) {
      if (isIn(el)) {
        loadImg(el);
      }
    });
  }

  function loadImg(el) {
    var source = el.dataset.src;
    if (!source) {
      return;
    }
    el.src = source;
  }

  var scrollFn = FD.throttle(function () {
    check();
  }, 200);

  check();

  if (listenScroll) {
    window.addEventListener("scroll", scrollFn);
  }
}

// 红人榜
function indexHotDr() {
  if (!document.querySelector(".js-ychot")) {
    return;
  }

  var renderTop = function (
    clname,
    imgSrc,
    name,
    duty,
    hos,
    dep,
    bdId,
    yskId,
    num,
    index,
    drId,
    award
  ) {
    var $wrap = document.querySelector(clname);
    var $top = $wrap.querySelector(".js-top");
    var temp = "";
    temp +=
      '<a href="' +
      homePage +
      "/drDetail/?bdId=" +
      bdId +
      "&drId=" +
      drId +
      "&award=" +
      award +
      '">';
    temp += '<dl class="rank-top rank-no' + (index + 1) + '">';
    temp += '<dt><i><img src="' + imgSrc + '"></i></dt>';
    temp +=
      "<dd><b>" + name + "</b><em>" + hos + "</em><i>" + (num || 0) + "</i>";
    temp += "</dd></dl></a>";
    $top.innerHTML += temp;
  };

  var render = function (
    clname,
    imgSrc,
    name,
    duty,
    hos,
    dep,
    bdId,
    yskId,
    num,
    index,
    drId,
    award
  ) {
    var $wrap = document.querySelector(clname);
    var $other = $wrap.querySelector(".js-other");
    var temp = "";
    temp +=
      '<a href="' +
      homePage +
      "/drDetail/?bdId=" +
      bdId +
      "&drId=" +
      drId +
      "&award=" +
      award +
      '">';
    temp += '<dl class="rank-other">';
    temp +=
      "<dt><em>" +
      (index + 1) +
      '</em><i><b><img src="' +
      imgSrc +
      '"></b></i></dt>';
    temp +=
      "<dd><b>" + name + "</b><em>" + hos + "</em><i>" + (num || 0) + "</i>";
    temp += "</dd></dl></a>";
    $other.innerHTML += temp;
  };

  var initDrLi = function (clname, bdId) {
    if (document.querySelector(clname + " .js-top dl")) {
      return;
    }

    FD.ajax({
      url: apiUrl + "vote/top-doctor?bdIds=" + bdId + "&size=10",
      type: "GET",
      dataType: "json",
      success: function (res) {
        var arr = res.data;

        for (var i = 0; i < arr.length; i++) {
          var award = "";
          switch (arr[i].doctor.campaignBdId) {
            case 59:
              award = "羊城好医生";
              break;
            case 61:
              award = "南粤好医生";
              break;
            case 60:
              award = "羊城青年好医生";
              break;
            case 62:
              award = "南粤青年好医生";
              break;
            case 63:
              award = "科普好医生";
              break;
            default:
              break;
          }

          if (i <= 2) {
            renderTop(
              clname,
              arr[i].doctor.imgSrc,
              arr[i].doctor.name,
              arr[i].doctor.zhiChengStr,
              arr[i].doctor.hospitalName,
              arr[i].doctor.keShi,
              arr[i].doctor.campaignBdId,
              arr[i].doctor.yskId,
              arr[i].voteNum,
              i,
              arr[i].doctor.id,
              award
            );
          } else {
            render(
              clname,
              arr[i].doctor.imgSrc,
              arr[i].doctor.name,
              arr[i].doctor.zhiChengStr,
              arr[i].doctor.hospitalName,
              arr[i].doctor.keShi,
              arr[i].doctor.campaignBdId,
              arr[i].doctor.yskId,
              arr[i].voteNum,
              i,
              arr[i].doctor.id,
              award
            );
          }
        }
      },
      error: function () {},
      complete: function () {},
    });
  };

  initDrLi(".js-totalhot", encodeURIComponent("59,61,60,62,63"));

  FD.initTabs(".js-tab-wrap", "click", function (obj) {
    var curItem = obj.curItem;

    if (curItem.classList.contains("js-ychot")) {
      initDrLi(".js-ychot", 59);
    } else if (curItem.classList.contains("js-nyhot")) {
      initDrLi(".js-nyhot", 61);
    } else if (curItem.classList.contains("js-ycqnhot")) {
      initDrLi(".js-ycqnhot", 60);
    } else if (curItem.classList.contains("js-nyqnhot")) {
      initDrLi(".js-nyqnhot", 62);
    } else if (curItem.classList.contains("js-kphot")) {
      initDrLi(".js-kphot", 63);
    }
  });
}

//羊城好医生 首页分科列表
function ychysList() {
  if (!document.querySelector(".container .ychys-de ul")) {
    return;
  }

  var ychysDe = document.querySelector(".ychys-de ul");

  FD.ajax({
    url: apiUrl + "prize-list?campaignBdId=59",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data;
      var award = "羊城好医生";

      arr.forEach(function (a) {
        renderYchysList(ychysDe, a.id, a.name, award);
      });
    },
    error: function () {},
    complete: function () {},
  });

  function renderYchysList(pBoxUl, addres, depName, award) {
    var temp =
      `<li><a href="` +
      homePage +
      `/drList/?bdId=` +
      59 +
      `&prizeId=` +
      addres +
      `&depName=` +
      depName +
      `&award=` +
      award +
      `">` +
      depName +
      `</a></li>`;
    pBoxUl.innerHTML += temp;
  }
}

//南粤好医生 首页分科列表
function nyhysList() {
  if (!document.querySelector(".container .nyhys-de ul")) {
    return;
  }

  var nyhysDe = document.querySelector(".nyhys-de ul");

  FD.ajax({
    url: apiUrl + "prize-list?campaignBdId=61",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data;
      var award = "南粤好医生";

      arr.forEach(function (a) {
        renderNyhysList(nyhysDe, a.id, a.name, award);
      });
    },
    error: function () {},
    complete: function () {},
  });

  function renderNyhysList(pBoxUl, addres, depName, award) {
    var temp =
      `<li><a href="` +
      homePage +
      `/drList/?bdId=` +
      61 +
      `&prizeId=` +
      addres +
      `&depName=` +
      depName +
      `&award=` +
      award +
      `">` +
      depName +
      `</a></li>`;
    pBoxUl.innerHTML += temp;
  }
}

//羊城青年好医生 首页分科列表
function ycqnhysList() {
  if (!document.querySelector(".container .ycqnhys-de ul")) {
    return;
  }

  var ychysDe = document.querySelector(".ycqnhys-de ul");

  FD.ajax({
    url: apiUrl + "prize-list?campaignBdId=60",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data;
      var award = "羊城青年好医生";

      arr.forEach(function (a) {
        renderYchysList(ychysDe, a.id, a.name, award);
      });
    },
    error: function () {},
    complete: function () {},
  });

  function renderYchysList(pBoxUl, addres, depName, award) {
    var temp =
      `<li><a href="` +
      homePage +
      `/drList/?bdId=` +
      60 +
      `&prizeId=` +
      addres +
      `&depName=` +
      depName +
      `&award=` +
      award +
      `">` +
      depName +
      `</a></li>`;
    pBoxUl.innerHTML += temp;
  }
}

//南粤青年好医生 首页分科列表
function nyqnhysList() {
  if (!document.querySelector(".container .nyqnhys-de ul")) {
    return;
  }

  var nyqnhysDe = document.querySelector(".nyqnhys-de ul");

  FD.ajax({
    url: apiUrl + "prize-list?campaignBdId=62",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data;
      var award = "南粤青年好医生";

      arr.forEach(function (a) {
        renderNyhysList(nyqnhysDe, a.id, a.name, award);
      });
    },
    error: function () {},
    complete: function () {},
  });

  function renderNyhysList(pBoxUl, addres, depName, award) {
    var temp =
      `<li><a href="` +
      homePage +
      `/drList/?bdId=` +
      62 +
      `&prizeId=` +
      addres +
      `&depName=` +
      depName +
      `&award=` +
      award +
      `">` +
      depName +
      `</a></li>`;
    pBoxUl.innerHTML += temp;
  }
}

//科普好医生 首页列表
function kphysDrList() {
  if (!document.querySelector(".kphys-de .kpdoc_list")) {
    return;
  }

  var kphysDe = document.querySelector(".kphys-de .kpdoc_list");

  FD.ajax({
    url:
      apiUrl +
      "vote/list-doctor3?bdId=63&currentPage=1&size=100&sort=1&showVoteNum=false",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data.records;
      var award = "科普好医生";

      arr.forEach(function (a) {
        renderKphysList(kphysDe, a, award);
      });
    },
    error: function () {},
    complete: function () {},
  });

  function renderKphysList(pBoxUl, arr, award) {
    var temp =
      `<dl class="dr-cell"><dt><a href="` +
      homePage +
      `/drDetail/?bdId=` +
      arr.doctor.campaignBdId +
      `&drId=` +
      arr.doctor.id +
      `&award=` +
      award +
      `"><img src="` +
      arr.doctor.imgSrc +
      `"></a></dt>`;
    temp +=
      `<dd><p class="dr-name"><a class="dr-name" href="` +
      homePage +
      `drDetail/?bdId=` +
      arr.doctor.campaignBdId +
      `&drId=` +
      arr.doctor.id +
      `&award=` +
      award +
      `">` +
      unescape(arr.doctor.name.replace(/\\u/g, "%u")) +
      `</a></p>`;
    temp += `<p class="dr-name"><em>` + arr.doctor.zhiChengStr + `</p>`;
    temp += `<p>` + arr.doctor.hospitalName + `</p>`;
    temp += `<p>` + arr.doctor.keShi + `</p>`;
    temp +=
      `<a href="` +
      homePage +
      `/drDetail/?bdId=` +
      arr.doctor.campaignBdId +
      `&drId=` +
      arr.doctor.id +
      `&award=` +
      award +
      `>` +
      arr.voteNum +
      `</a>`;

    pBoxUl.innerHTML += temp;
  }
}

//好医生列表
// function indexGetDrLi () {
//     var getData = function (bdId, $wrap, index, cb) {
//         FD.ajax({
//             url: apiUrl + 'vote/list-doctor2?bdId=' + bdId + '&random=true&currentPage=1&size=4',
//             type: 'GET',
//             dataType: 'json',
//             success: function (res) {
//                 var arr = res.data.records;
//                 var award = ''
//                 var $liWrap = $wrap.querySelector('.js-slider-drlist');
//                 switch (Number(bdId)) {
//                     case 60:
//                         award = '羊城青年好医生';
//                         break;

//                     case 62:
//                         award = '南粤青年好医生';
//                         break;
//                     default:
//                         break;
//                 }

//                 for (var i = 0; i < arr.length; i++) {
//                     render(arr[i], award, $liWrap);
//                 }

//                 //indexSliderDrList(index);

//                 if (cb) {
//                     cb(index);
//                 }

//             },
//             error: function () { },
//             complete: function () { }
//         });
//     }

//     var render = function (arr, award, $liWrap) {
//         var temp = `
//             <dl>
//                 <dt><a href="https://m.familydoctor.com.cn/hys/guangdong2022/drDetail/?bdId=` + arr.doctor.campaignBdId + `&drId=` + arr.doctor.id + `&award=` + award + `"><img src="` + arr.doctor.imgSrc + `"></a></dt>
//                 <dd>
//                     <p class="dr-name"><a href="https://m.familydoctor.com.cn/hys/guangdong2022/drDetail/?bdId=` + arr.doctor.campaignBdId + `&drId=` + arr.doctor.id + `&award=` + award + `">` + (unescape(arr.doctor.name.replace(/\\u/g, '%u'))) + `</a></p>
//                     <p class="dr-duty">` + arr.doctor.zhiChengStr + `</p>
//                     <p class="dr-hos">` + arr.doctor.hospitalName + `</p>
//                     <p class="dr-dep">` + arr.doctor.keShi + `</p>
//                     <p class="dr-vote js-vote" data-drid="` + arr.doctor.id + `"><i>` + arr.voteNum + `</i></p>
//                 </dd>
//             </dl>

//         `;

//         $liWrap.innerHTML += temp;
//     }

//     // 首页扫二维码
//     var showDialog = function (index) {
//         var dialog = document.querySelector('.js-dialog');
//         var $btn = document.querySelectorAll('.js-slider-drlist')[index].querySelectorAll('.js-vote');

//         FD.dom.on('click', $btn, function () {

//             var that = this;
//             var qrUrl = 'https://jkapi.bj.familydoctor.com.cn/wxapi/index.php/internal/genQrcode.html?url=' + encodeURIComponent(outSideVoteUrl + '?keyword=' + that.dataset.drid);
//             dialog.querySelector('.js-qrcode').src = qrUrl;

//             new FD.Dialog({
//                 maxWidth: '90%',
//                 minWidth: '100px',
//                 width: '80%',
//                 height: 'auto',
//                 title: '',
//                 content: dialog,           //弹窗内容，可以是dom节点也可以是字符串
//                 className: 'dia-cont',
//                 zIndex: 1000,
//                 dialogClassName: '',
//                 autoShow: true,        // 自动弹出
//                 maskClick: false,      // 点击蒙层关闭弹窗
//                 showTitle: true,
//                 showClose: true,       // 显示关闭按钮
//                 onOpened: function () {
//                     dialog.classList.toggle('hide');

//                 },
//                 onCloseBefore: function () {
//                     dialog.classList.toggle('hide');
//                 }
//             });
//         });
//     }

//     if (document.querySelector('.js-ycqnhys-de')) {
//         getData(60, document.querySelector('.js-ycqnhys-de'), 0, showDialog);
//     }

//     if (document.querySelector('.js-nyqnhys-de')) {
//         getData(62, document.querySelector('.js-nyqnhys-de'), 1, showDialog);
//     }

// }

// 医生列表
function ychysDrList() {
  var drDepList = document.querySelector(".dr-dep-list");

  if (!drDepList) {
    return;
  }

  var depName = FD.getQueryString(window.location.href, "depName");
  var hosName = FD.getQueryString(window.location.href, "hosName");
  var award = FD.getQueryString(window.location.href, "award");
  var hosId = FD.getQueryString(window.location.href, "hosId");
  var bdId = FD.getQueryString(window.location.href, "bdId"); // 判断榜单列表
  var totalCount = 0;

  var cName = document.querySelector(".banner-tl b");
  cName.textContent = depName;

  var Vdata = {};
  var wechatUnionId;
  var subscribe;

  // 榜单医生
  var getBdDr = function (bdId) {
    var award = "";
    var bdPage = 1;
    var totalPage;

    var param = "";
    var Link = document.querySelector("meta[name=wechatShareLink]");
    if (window.location.href.indexOf("&_wechat_code_") !== -1) {
      param = window.location.href.split("&_wechat_code_")[0];
      Link.setAttribute("content", param);
    } else {
      Link.setAttribute("content", window.location.href);
    }
    weShare();

    FD.whenScrollBottom(0, function () {
      if (bdPage < totalPage) {
        bdPage += 1;
        getData();
      }
    });

    switch (Number(bdId)) {
      case 59:
        award = "羊城好医生";
        break;
      case 61:
        award = "南粤好医生";
        break;
      case 60:
        award = "羊城青年好医生";
        break;
      case 62:
        award = "南粤青年好医生";
        break;
      case 63:
        award = "科普好医生";
        break;
      default:
        break;
    }

    document.querySelector(".banner-tl b").innerHTML = award;

    var getData = function () {
      var load = FD.loading();
      FD.ajax({
        url:
          apiUrl +
          "vote/list-doctor3?bdId=" +
          bdId +
          "&currentPage=" +
          bdPage +
          "&size=999",
        type: "GET",
        dataType: "json",
        success: function (res) {
          var arr = res.data.records;
          var arr_len = res.data.records.length;
          var count = 0;

          var PerNum = document.querySelector(".banner-tl em");

          if (!totalPage) {
            PerNum.textContent = `· 获奖医生人数：` + res.data.total + ` ·`;
            totalPage = res.data.pages;
          }

          arr.forEach(function (a, b, c) {
            renderDocListNoDep(
              document.querySelector(".js-drli-wrap"),
              a.campaignBdId,
              award,
              a.id,
              a.doctor.imgSrc,
              a.doctor.name,
              a.doctor.zhiChengStr,
              a.doctor.hospitalName,
              a.doctor.keShi,
              a.voteNum
            );
            count++;
          });
          if (count == arr_len) {
            load.close();
          }
        },
      });
    };

    getData();
  };

  // 医院医生
  var gethosDrList = function () {
    var $wrap = document.querySelectorAll(".js-drli-wrap");
    var award = "";
    var arlen = [];

    var param = "";
    var Link = document.querySelector("meta[name=wechatShareLink]");
    var desc = document.querySelector("meta[name=description]");
    if (window.location.href.indexOf("&_wechat_code_") !== -1) {
      param = window.location.href.split("&_wechat_code_")[0];
      Link.setAttribute("content", param);
      desc.setAttribute("content", "恭喜上榜！可以投票了！");
    } else {
      Link.setAttribute("content", window.location.href);
      desc.setAttribute("content", "恭喜上榜！可以投票了！");
    }
    weShare();

    FD.ajax({
      url:
        apiUrl +
        "vote/list-doctor3?currentPage=1&bdId=59,60,61,62,63" +
        "&hospitalId=" +
        hosId +
        "&size=99",
      type: "GET",
      dataType: "json",
      success: function (res) {
        var arr = res.data.records;
        var PerNum = document.querySelector(".banner-tl em");

        PerNum.textContent =
          `· 获奖医生人数：` + (totalCount += res.data.total) + ` ·`;

        arr.forEach(function (a, b, c) {
          if ("59".match(a.campaignBdId)) {
            arlen.push(59);
          }
          if ("60".match(a.campaignBdId)) {
            arlen.push(60);
          }
          if ("61".match(a.campaignBdId)) {
            arlen.push(61);
          }
          if ("62".match(a.campaignBdId)) {
            arlen.push(62);
          }
          if ("63".match(a.campaignBdId)) {
            arlen.push(63);
          }
        });

        arlen = new Set(arlen);
        arlen.forEach(function (a) {
          switch (Number(a)) {
            case 59:
              award = "羊城好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[0];
              createTl(award);
              break;
            case 61:
              award = "南粤好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[0];
              createTl(award);
              break;
            case 60:
              award = "羊城青年好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[1];
              createTl(award);

              break;
            case 62:
              award = "南粤青年好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[1];
              createTl(award);

              break;
            case 63:
              award = "科普好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[2];
              createTl(award);

              break;
            default:
              break;
          }
        });

        arr.forEach(function (a, b, c) {
          switch (Number(a.campaignBdId)) {
            case 59:
              award = "羊城好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[0];
              break;
            case 61:
              award = "南粤好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[0];
              break;
            case 60:
              award = "羊城青年好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[1];
              break;
            case 62:
              award = "南粤青年好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[1];
              break;
            case 63:
              award = "科普好医生";
              $wrap = document.querySelectorAll(".js-drli-wrap")[2];
              break;
            default:
              break;
          }
          renderDocListNoDep(
            $wrap,
            a.campaignBdId,
            award,
            a.id,
            a.doctor.imgSrc,
            a.doctor.name,
            a.doctor.zhiChengStr,
            a.doctor.hospitalName,
            a.doctor.keShi,
            a.voteNum
          );
        });
      },
    });

    var createTl = function (cont) {
      var div = document.createElement("div");
      div.innerHTML = cont;
      div.classList.add("drli-tl", "js-drli-tl");
      $wrap.appendChild(div);
    };
  };

  // 科室医生
  var getdepDrList = function () {
    switch (Number(bdId)) {
      case 59:
        award = "羊城好医生";
        break;
      case 61:
        award = "南粤好医生";
        break;

      case 60:
        award = "羊城青年好医生";
        break;

      case 62:
        award = "南粤青年好医生";
        break;

      case 63:
        award = "科普好医生";
        break;
      default:
        break;
    }
    document.title = award + " - " + depName + " - " + document.title;
    var param = "";
    var Link = document.querySelector("meta[name=wechatShareLink]");
    if (window.location.href.indexOf("&_wechat_code_") !== -1) {
      param = window.location.href.split("&_wechat_code_")[0];
      Link.setAttribute("content", param);
    } else {
      Link.setAttribute("content", window.location.href);
    }
    weShare();

    var wait = FD.loading();

    FD.ajax({
      url:
        apiUrl +
        "vote/list-doctor?currentPage=1&prizeId=" +
        FD.getQueryString(location.href, "prizeId") +
        "&size=999",
      type: "GET",
      dataType: "json",
      success: function (res) {
        var arr = res.data.records;
        var PerNum = document.querySelector(".banner-tl em");
        document.querySelector(".banner-tl i").textContent =
          "- " + award + " -";
        PerNum.textContent = `· 获奖医生人数：` + arr.length + ` ·`;

        arr.forEach(function (a, b, c) {
          renderDocList(
            a.campaignBdId,
            award,
            a.id,
            a.doctor.imgSrc,
            a.doctor.name,
            a.doctor.zhiChengStr,
            a.doctor.hospitalName,
            a.doctor.keShi ? a.doctor.keShi : "",
            a.voteNum
          );
        });
      },
      error: function (err) {
        console.log(err + "调取信息错误");
      },
      complete: function () {
        wait.close();
      },
    });
  };

  if (hosName) {
    document.querySelector(".banner-tl b").innerHTML = hosName;
    gethosDrList();
  } else if (depName) {
    getdepDrList();
  } else {
    getBdDr(bdId);
  }

  function renderDocList(
    campaignBdId,
    award,
    docId,
    img,
    name,
    duty,
    hos,
    cate,
    num
  ) {
    var pbDrList = document.querySelector(".pb-dr-list");
    var temp =
      `<dl class="dr-cell">
            <dt><a href="` +
      homePage +
      `/drDetail/?bdId=` +
      campaignBdId +
      `&drId=` +
      docId +
      `&award=` +
      award +
      `"><img src="` +
      img +
      `"></a></dt>
            <dd>
                <a href="` +
      homePage +
      `/drDetail/?bdId=` +
      campaignBdId +
      `&drId=` +
      docId +
      `&award=` +
      award +
      `">  
                    <p class="dr-name"><b>` +
      unescape(name.replace(/\\u/g, "%u")) +
      `</b> <em>` +
      duty +
      `</em></p>
                    <p>` +
      hos +
      `</p>
                    <p>` +
      cate +
      `</p>
                </a>
                <a class="icon-like " href="` +
      homePage +
      `/drDetail/?bdId=` +
      campaignBdId +
      `&drId=` +
      docId +
      `&award=` +
      award +
      `" data-bdid="` +
      campaignBdId +
      `"data-drid="` +
      docId +
      `">` +
      num +
      `</a>
            </dd>
        </dl>`;

    pbDrList.innerHTML += temp;
  }

  function renderDocListNoDep(
    $wrap,
    campaignBdId,
    award,
    docId,
    img,
    name,
    duty,
    hos,
    cate,
    num
  ) {
    var temp =
      `<dl class="dr-cell">
                        <dt><a href="` +
      homePage +
      `/drDetail/?bdId=` +
      campaignBdId +
      `&drId=` +
      docId +
      `&award=` +
      award +
      `"><img src="` +
      img +
      `"></a></dt>
                        <dd>
                            <a href="` +
      homePage +
      `/drDetail/?bdId=` +
      campaignBdId +
      `&drId=` +
      docId +
      `&award=` +
      award +
      `">  
                                <p class="dr-name"><b>` +
      unescape(name.replace(/\\u/g, "%u")) +
      `</b> <em>` +
      duty +
      `</em></p>
                                <p>` +
      hos +
      `</p>
                            </a>
                            <a class="icon-like" href="` +
      homePage +
      `/drDetail/?bdId=` +
      campaignBdId +
      `&drId=` +
      docId +
      `&award=` +
      award +
      `">` +
      num +
      `</a>
                        </dd>
                    </dl>`;
    $wrap.innerHTML += temp;
  }
}

//医生详情
function docDetail() {
  var $drDetail = document.querySelector(".js-dr-detail");
  var $btn = document.querySelector(".js-vote-help");

  if (!$drDetail) {
    return;
  }

  var cookieValue = getCookie("cby_c_token");

  var campaignBdId = FD.getQueryString(location.href, "bdId");
  var objectId = FD.getQueryString(location.href, "drId");
  var award = "";
  var $campaignBdPrizeId;

  var docImg = "";
  var arr;
  var bannerTl = document.querySelector(".banner-tl b");
  var doctorId = 0;

  var Vdata = {
    campaignBdId: campaignBdId, //榜单ID
    objectId: objectId, //医生ID
    prizeId: $campaignBdPrizeId,
    page: 1,
  };

  switch (Number(campaignBdId)) {
    case 59:
      award = "羊城好医生";
      break;
    case 61:
      award = "南粤好医生";
      break;
    case 60:
      award = "羊城青年好医生";
      break;
    case 62:
      award = "南粤青年好医生";
      break;
    case 63:
      award = "科普好医生";
      break;
    default:
      break;
  }

  bannerTl.innerText = award;

  var detailWait = FD.loading();
  FD.ajax({
    url:
      apiUrl +
      "vote?campaignBdId=" +
      campaignBdId +
      "&campaignBdType=%E5%A5%BD%E5%8C%BB%E7%94%9F%E6%A6%9C&objectId=" +
      objectId,
    type: "GET",
    dataType: "json",
    success: function (res) {
      var drCell = document.querySelector(".js-dr-detail");
      arr = res.data;
      doctorId = res.data.id;
      docImg = arr.doctor.imgSrc;
      Vdata.prizeId = arr.doctor.campaignBdPrizeId;

      document.title =
        arr.doctor.name +
        " - " +
        arr.doctor.hospitalName +
        " - " +
        document.title;
      var ImgUrl = document.querySelector("meta[name=wechatShareImgUrl]");
      ImgUrl.setAttribute("content", docImg);
      var param = "";
      var Link = document.querySelector("meta[name=wechatShareLink]");
      if (window.location.href.indexOf("&_wechat_code_") !== -1) {
        param = window.location.href.split("&_wechat_code_")[0];
        Link.setAttribute("content", param);
      } else {
        Link.setAttribute("content", window.location.href);
      }
      drCell.querySelector("dt").innerHTML =
        `<a href="https://mysk.familydoctor.com.cn/` +
        arr.doctor.yskId +
        `/">` +
        `<img src="` +
        arr.doctor.imgSrc +
        `"></a>`;
      drCell.querySelector("img").setAttribute("src", arr.doctor.imgSrc);
      drCell.querySelector(".dr-name").innerHTML =
        `<a href="https://mysk.familydoctor.com.cn/` +
        arr.doctor.yskId +
        `"><b>` +
        unescape(arr.doctor.name.replace(/\\u/g, "%u")) +
        `</b></a><em>` +
        arr.doctor.zhiChengStr +
        `</em><em>` +
        arr.doctor.cityName +
        `</em>`;
      drCell.querySelector(".hos").innerHTML =
        `<a href="https://myyk.familydoctor.com.cn/` +
        arr.doctor.yykId +
        `"><p class="hos">` +
        arr.doctor.hospitalName +
        `</p></a>`;
      drCell.querySelector(".cate").innerHTML = arr.doctor.keShi
        ? arr.doctor.keShi
        : "";
      document.querySelector(".goodAt-ill p").innerHTML = arr.doctor.goodAt;
      document.querySelector(".intro-cont p").innerHTML =
        arr.doctor.introduction;
      document.querySelector(".js-vote-help").innerHTML =
        `好评数 <em>` + arr.voteNum + `</em>`;
      drCell.querySelector(".id").innerHTML = "医生编号：" + doctorId;

      if (document.querySelector(".intro-cont p").innerText == "" || null) {
        document.querySelector(".intro-cont").classList.add("hide");
      }

      if (document.querySelector(".goodAt-ill p").innerText == "" || null) {
        document.querySelector(".goodAt-ill").classList.add("hide");
      }

      if (!isWeiXin) {
        document.querySelector(".js-likecounts-wrap").classList.add("hide");
      } else {
        weShare();
      }
      //initCard(arr);
      detailWait.close();
    },
    error: function (err) {
      detailWait.close();
      console.log(err + "调取信息错误");
    },
  });

  //医生详情，获取证书按钮
  FD.dom.on("click", ".js-btn-cert", function () {
    new FD.Dialog({
      width: "100%",
      height: "auto",
      height: "auto",
      title: "提示",
      content: document.querySelector(".cert-box"),
      maskClick: false,
      showTitle: false,
      showClose: true,
      onInit: function () {
        document.querySelector(".cert-box").classList.remove("hide");
      },
      onCloseAfter: function () {
        document.querySelector(".cert-box").classList.add("hide");
      },
    });
  });

  // https://m.familydoctor.com.cn/hys/guangdong2022/drDetail/?bdId=61&drId=6783&award=%E5%8D%97%E7%B2%A4%E5%A5%BD%E5%8C%BB%E7%94%9F
  // eval("$.ajax({ url: 'https://jkapi.bj.familydoctor.com.cn/cby/vote/submit',type: 'POST',data: {campaignBdId: 61,objectId: 6783,prizeId: 759,page: 1},dataType: 'json',xhrFields: {withCredentials: true},headers: { 'X-XSRF-TOKEN': getCookie('51bbfddb-0d1c-47a5-a3e3-e7e695bd1947') }})")

  //医生详情，点赞医生
  FD.dom.on("click", ".js-dr-detail .js-likecounts-wrap", function () {
    $.ajax({
      url: baseUrl + "vote/submit",
      type: "POST",
      data: Vdata,
      dataType: "json",
      xhrFields: {
        withCredentials: true,
      },
      headers: { "X-XSRF-TOKEN": cookieValue },
      success: function (res) {
        var dialog = document.querySelector(".dialog");
        var img = dialog.querySelector("img");
        if (res.code == 9) {
          img.setAttribute("src", res.data);
          new FD.Dialog({
            maxWidth: "90%",
            minWidth: "100px",
            width: "80%",
            height: "auto",
            title: "好评前请进入公众号",
            content: dialog, //弹窗内容，可以是dom节点也可以是字符串
            className: "dia-cont",
            zIndex: 1000,
            dialogClassName: "",
            autoShow: true, // 自动弹出
            maskClick: false, // 点击蒙层关闭弹窗
            showTitle: false,
            showClose: true, // 显示关闭按钮
            onOpened: function () {
              dialog.classList.toggle("hide");
              document.querySelector(".dialog .qrcode").src = res.data;
              document.querySelector(".dialog").style.textAlign = "center";
              document.querySelector(".dialog p").style.color = "#fff";
            },
            onCloseBefore: function () {
              dialog.classList.toggle("hide");
            },
          });
        } else if (res.code == 10) {
          var voteFailure =
            '<div class="dialog-failure"><div class="tips">明天再来</div><p style="text-align:center;">' +
            res.message +
            '</p><a class="dialog-close">我知道了</a></div>';
          var successDia = new FD.Dialog({
            width: "100%",
            height: "auto",
            autoShow: true, // 自动弹出
            maskClick: false, // 点击蒙层关闭弹窗
            showTitle: false,
            showClose: false, // 显示关闭按钮
            content: voteFailure, //弹窗内容，可以是dom节点也可以是字符串
            className: "dia-cont",
            zIndex: 1000,
            onInit: function () {
              FD.dom.on("click", ".dialog-close", function () {
                successDia.close();
              });
            },
          });
        } else if (res.code == 50001) {
          var voteFailure =
            '<div class="dialog-failure"><div class="tips">好评失败</div><p style="text-align:center;">' +
            res.message +
            '</p><a class="dialog-close">我知道了</a></div>';
          var successDia = new FD.Dialog({
            width: "100%",
            height: "auto",
            autoShow: true, // 自动弹出
            maskClick: false, // 点击蒙层关闭弹窗
            showTitle: false,
            showClose: false, // 显示关闭按钮
            content: voteFailure, //弹窗内容，可以是dom节点也可以是字符串
            className: "dia-cont",
            zIndex: 1000,
            onInit: function () {
              FD.dom.on("click", ".dialog-close", function () {
                successDia.close();
              });
            },
          });
        } else {
          console.log(res);
          var voteSuccess =
            '<div class="dialog-success"><div class="tips">好评成功</div><p style="text-align:center;">' +
            res.message +
            '</p><a class="dialog-close">我知道了</a></div>';
          var successDia = new FD.Dialog({
            width: "100%",
            height: "auto",
            autoShow: true, // 自动弹出
            maskClick: false, // 点击蒙层关闭弹窗
            showTitle: false,
            showClose: false, // 显示关闭按钮
            content: voteSuccess, //弹窗内容，可以是dom节点也可以是字符串
            className: "dia-cont",
            zIndex: 1000,
            onInit: function () {
              document.querySelector(".js-vote-help em").innerText++;
              FD.dom.on("click", ".dialog-close", function () {
                successDia.close();
              });
            },
          });
        }
      },
      error: function (err) {
        console.log(err);
      },
    });
  });

  $btn.addEventListener("click", function () {
    document.querySelector(".js-dr-detail .js-likecounts-wrap").click();
  });
}

// 医生详情页返回
function articleBack() {
  if (window.location.href.indexOf("/article") === -1) {
    return;
  }

  if (!document.querySelector(".pb-btn-more a")) {
    return;
  }

  var bdId = FD.getQueryString(location.href, "bdId");
  var $btn = document.querySelector(".pb-btn-more a");
  var url = "";

  switch (Number(bdId)) {
    case 59:
      url = "http://hys.familydoctor.com.cn/guangdong2022/#ychys/";
      break;
    case 61:
      url = "http://hys.familydoctor.com.cn/guangdong2022/#nyhys/";
      break;
    case 60:
      url = "http://hys.familydoctor.com.cn/guangdong2022/#ycqnhys/";
      break;
    case 62:
      url = "http://hys.familydoctor.com.cn/guangdong2022/#nyqnhys/";
      break;
    default:
      break;
  }

  $btn.href = url;
}

//医院列表--羊城好医生，南粤好医生
function hospitalLi() {
  if (!document.querySelector(".js-hosli")) {
    return;
  }
  var ychysHosList = document.querySelector(".js-ychys-hosli"); //羊城好医生
  var wait = FD.loading();

  FD.ajax({
    url: apiUrl + "hys/hospital-list?bdId=59", //羊城好医生
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data;
      arr.forEach(function (item) {
        renderHoslist(ychysHosList.querySelector("ul"), 59, item.id, item.name);
      });
    },
    error: function (err) {
      console.log(err + "调取信息错误");
    },
    complete: function () {
      wait.close();
    },
  });

  var cityArr = [];

  //南粤好医生
  FD.ajax({
    url: apiUrl + "sign-in/getCities",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var arr = res.data;

      arr.forEach(function (item, index) {
        //cityArr.push(item.id);
        Cities(
          document.querySelector(".js-nyhys-hosli .list-wrap"),
          item.id,
          item.name
        );
        FD.ajax({
          url: apiUrl + "hys/hospital-list?bdId=61&cityId=" + item.id, //南粤好医生
          type: "GET",
          dataType: "json",
          success: function (res) {
            var Hoslists = res.data;

            if (Hoslists.length != 0) {
              Hoslists.forEach(function (q) {
                Hoslist(
                  document.getElementById(item.id).querySelector("ul"),
                  61,
                  q.id,
                  q.name
                );
              });
            } else {
              document
                .querySelector(".js-lgtips" + item.id)
                .classList.add("hide");
            }
          },
          error: function (err) {
            //console.log(err + '调取信息错误')
          },
          complete: function () {},
        });
      });
    },
    error: function (err) {},
    complete: function () {},
  });

  cityArr = cityArr.toString();
  console.log(cityArr);

  function Cities(pNode, id, name) {
    var temp = "";
    temp +=
      '<div><div class="honor-title nyhys-title"><p class="title-tips lg-tips js-lgtips' +
      id +
      '">- ' +
      name +
      '医院 -</p><div id="' +
      id +
      '"><ul class="half-item"></ul></div></div>';
    pNode.innerHTML += temp;
  }

  function Hoslist(pNode, bdid, hosId, name) {
    var temp = "";
    temp +=
      '<li><a href="' +
      homePage +
      "/drList/?hosId=" +
      hosId +
      "&bdId=" +
      bdid +
      "&hosName=" +
      name +
      '">' +
      name +
      "</a></li>";
    pNode.innerHTML += temp;
  }
}

function renderHoslist(father, bdId, hosId, name) {
  var temp = "";
  temp +=
    '<li><a href="' +
    homePage +
    "/drList/?bdId=" +
    bdId +
    "&hosId=" +
    hosId +
    "&hosName=" +
    name +
    '">' +
    name +
    "</a></li>";
  father.innerHTML += temp;
}

//签到
function signIn() {
  var signIn = document.querySelector(".js-btn-sign");
  if (!signIn) {
    return;
  }

  var Vdata = {};
  var wechatUnionId;
  var subscribe;
  var cityId = 0;
  var headimg;
  var docBox = document.querySelector(".content-sub");
  var knownUserInfo;
  var campaignId = 15;

  // 获取签到结果
  FD.ajax({
    url: apiUrl + "sign-in/getCities",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var cityData = res.data;

      for (var i = 0, o = cityData.length; i < o; i++) {
        renderCityOption(cityData[i].id, cityData[i].name);
      }

      var txt = "";
      if (FD.cookie.get("hosId")) {
        txt = "&hospitalId=" + FD.cookie.get("hosId");
      } else if (FD.cookie.get("otherV")) {
        txt = "&jiGou=" + FD.cookie.get("otherV");
      }

      var placeV = FD.cookie.get("cityValue");
      if (placeV !== "" || null) {
        document.querySelector("#name").value = FD.cookie.get("myName");
        document.querySelector("#phone").value = FD.cookie.get("phoneValue");
        document.querySelector("#city").value = FD.cookie.get("cityId");
        docBox.querySelector(".doc-name").innerText = FD.cookie.get("myName");

        if (FD.cookie.get("hosId") == -1) {
          document.querySelector("#place").innerHTML =
            `<option value="0" selected="selected">` +
            FD.cookie.get("otherV") +
            `</option>`;
          docBox.querySelector(".hos").innerText = FD.cookie.get("otherV");
        } else {
          document.querySelector("#place").innerHTML =
            `<option value="0" selected="selected">` +
            FD.cookie.get("placeValue") +
            `</option>`;
          docBox.querySelector(".hos").innerText = FD.cookie.get("placeValue")
            ? FD.cookie.get("placeValue")
            : "";
        }

        document.querySelector(".js-btn-sign").classList.toggle("hide");
        document.querySelector(".js-sign-guide").classList.toggle("hide");

        new FD.Dialog({
          width: "100%",
          height: `document.querySelector('.success-box').style.height`,
          height: "auto",
          title: "提示",
          content: document.querySelector(".success-box"),
          dialogClassName: "gudie-dialog",
          className: "gudie-cont",
          maskClick: false,
          showTitle: false,
          showClose: true,
          onInit: function () {
            document.querySelector(".success-box").classList.remove("hide");
          },
          onCloseAfter: function () {
            document.querySelector(".success-box").classList.add("hide");
          },
        });
        document.querySelector("#name").setAttribute("disabled", true);
        document.querySelector("#phone").setAttribute("disabled", true);
        document.querySelector("#city").setAttribute("disabled", true);
        document.querySelector("#place").setAttribute("disabled", true);
        document.querySelector("#other").setAttribute("disabled", true);
        var param = "";
        var Link = document.querySelector("meta[name=wechatShareLink]");
        if (window.location.href.indexOf("&_wechat_code_") !== -1) {
          param = window.location.href.split("&_wechat_code_")[0];
          Link.setAttribute("content", param);
        } else {
          Link.setAttribute("content", window.location.href);
        }
        FD.initShare();
      }
    },
    error: function (err) {},
    complete: function () {},
  });

  document.querySelector("#city").onchange = function () {
    var that = this;
    cityId = that.value;

    document.querySelector("#place").innerHTML = "";
    document.querySelector("#place").value = "";
    document.querySelector(".other-box").classList.add("hide");
    if (document.querySelector("#city").value !== 0) {
      document.querySelector("#city").style.color = "#000";
    }
    FD.ajax({
      url: apiUrl + "sign-in/getHospitals?campaignId=" + campaignId,
      type: "GET",
      dataType: "json",
      success: function (res) {
        renderHosOption("#place", "0", "请选择所在机构");
        renderHosOption("#place", "-1", "其他");
        var hosData = res.data;
        hosData.forEach(function (item, b) {
          for (var i = 0; i < item.member.length; i++) {
            if (item.member[i].cityId == that.value) {
              renderHosOption("#place", item.member[i].id, item.member[i].name);
            }
          }
        });
      },
      error: function (err) {},
      complete: function () {},
    });
  };

  dataChange();

  // 好医生签到
  FD.dom.on("click", ".js-btn-sign", function () {
    if (document.querySelector("#name").value == "" || null) {
      FD.toast({
        msg: "请填写姓名",
      });
      return;
    }
    if (
      (document.querySelector("#phone").value.toString().length =
        11 && !FD.isMobile(document.querySelector("#phone").value))
    ) {
      FD.toast({
        msg: "请正确的手机号码",
      });
      return;
    }
    if (parseInt(cityId) == 0) {
      FD.toast({
        msg: "请输入选择所在城市",
      });
      return;
    }
    if (parseInt(hos_id) == 0) {
      FD.toast({
        msg: "请输入选择医院",
      });
      return;
    }

    if (
      parseInt(hos_id) == -1 &&
      document.querySelector("#other").value == ""
    ) {
      FD.toast({
        msg: "请输入机构名",
      });
      return;
    }

    var myName = document.querySelector("#name").value;
    var hosId = parseInt(hos_id);
    var otherV = document.querySelector("#other").value;

    // 保存信息判断当前用户
    FD.cookie.set("myName", myName);
    FD.cookie.set("hosId", hosId);
    FD.cookie.set("otherV", otherV);

    var placeSelected = document.querySelector("#place").selectedIndex;
    var citySelected = document.querySelector("#city").selectedIndex;
    FD.cookie.set(
      "placeValue",
      document.querySelector("#place").options[placeSelected].innerText
    );
    FD.cookie.set(
      "cityValue",
      document.querySelector("#city").options[citySelected].innerText
    );
    FD.cookie.set("cityId", document.querySelector("#city").value);
    FD.cookie.set("phoneValue", document.querySelector("#phone").value);

    var postData = {
      unionId: getRandomString(10),
      headUrl: getRandomString(10),
      name: myName,
      phone: document.querySelector("#phone").value,
      hospitalId: parseInt(hos_id),
      cityId: document.querySelector("#city").value,
      jiGou: document.querySelector("#other").value || "",
      campaignId: campaignId,
    };
    console.log(postData);

    // docBox.querySelector('img').setAttribute('src', FD.cookie.get('headimg'));
    docBox.querySelector(".doc-name").innerHTML =
      document.querySelector("#name").value;

    if (
      document.querySelector("#place").selectedOptions[0].value !== -1 &&
      document.querySelector("#place").selectedOptions[0].value > 0
    ) {
      docBox.querySelector(".hos").innerText =
        document.querySelector("#place").selectedOptions[0].innerText;
    } else {
      docBox.querySelector(".hos").innerText =
        document.querySelector("#other").value;
    }

    postData = JSON.stringify(postData);

    $.ajax({
      url: apiUrl + "sign-in/hys",
      type: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      data: postData,
      xhrFields: { withCredentials: true },
      success: function (res) {
        var hosData = res.data;

        new FD.Dialog({
          width: "100%",
          height: `document.querySelector('.success-box').style.height`,
          height: "auto",
          title: "提示",
          content: document.querySelector(".success-box"),
          dialogClassName: "gudie-dialog",
          className: "gudie-cont",
          maskClick: false,
          showTitle: false,
          showClose: true,
          onInit: function () {
            document.querySelector(".success-box").classList.remove("hide");
          },
          onCloseAfter: function () {
            document.querySelector(".success-box").classList.add("hide");
          },
        });
        document.querySelector("#name").setAttribute("disabled", true);
        document.querySelector("#phone").setAttribute("disabled", true);
        document.querySelector("#city").setAttribute("disabled", true);
        document.querySelector("#place").setAttribute("disabled", true);
        document.querySelector("#other").setAttribute("disabled", true);
        document.querySelector(".js-btn-sign").classList.add("hide");
        document.querySelector(".js-sign-guide").classList.remove("hide");
      },
      error: function (err) {
        // FD.toast({
        //     msg:'所填信息不能为空'
        // })
      },
      complete: function () {},
    });
  });

  FD.dom.on("click", ".js-sign-guide", function () {
    new FD.Dialog({
      width: "100%",
      height: document.querySelector(".success-box").style.height,
      height: "auto",
      title: "提示",
      content: document.querySelector(".success-box"),
      dialogClassName: "gudie-dialog",
      className: "gudie-cont",
      maskClick: false,
      showTitle: false,
      showClose: true,
      onInit: function () {
        document.querySelector(".success-box").classList.remove("hide");
      },
      onCloseAfter: function () {
        document.querySelector(".success-box").classList.add("hide");
      },
    });
  });

  weShare();
}

function renderCityOption(index, cityName) {
  var citySelect = document.querySelector("#city");
  var op = document.createElement("option");
  op.textContent = cityName;
  op.value = index;
  citySelect.appendChild(op);
}

function renderHosOption(box, index, cityName) {
  var citySelect = document.querySelector(box);
  var op = document.createElement("option");
  op.value = index;
  op.innerText = cityName;
  citySelect.appendChild(op);
}

//领取电子证书
function getCert() {
  var getCert = document.querySelector(".js-btn-getcert");
  if (!getCert) {
    return;
  }

  var cityWait = FD.loading();
  var $name = document.querySelector("#name");
  var $hos = document.querySelector("#place");
  var $city = document.querySelector("#city");
  //var $bd = document.querySelector('#catalog');
  var param = "";
  var campaignId = 15;
  var Link = document.querySelector("meta[name=wechatShareLink]");
  if (window.location.href.indexOf("&_wechat_code_") !== -1) {
    param = window.location.href.split("&_wechat_code_")[0];
    Link.setAttribute("content", param);
  } else {
    Link.setAttribute("content", window.location.href);
  }

  weShare();

  // 获取参与榜单选项
  var initOption = function () {
    //$bd.innerHTML = '';

    if (!$name.value || !$hos.value) {
      return;
    }

    var pNameV = $name.value;
    option_id = $hos.value;

    FD.ajax({
      url:
        apiUrl +
        "hys/certificate-2021?campaignId=15&hospitalId=" +
        option_id +
        "&name=" +
        encodeURIComponent(pNameV),
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.code === 0) {
          renderOption(res.data);
        }
      },
    });
  };

  var renderOption = function (data) {
    for (var i = 0; i < data.length; i++) {
      var $option = document.createElement("option");
      $option.value = data[i].bdId;
      $option.innerHTML = data[i].bdName;
      //$bd.appendChild($option);
    }
  };

  // 加载城市
  FD.ajax({
    url: apiUrl + "sign-in/getCities",
    type: "GET",
    dataType: "json",
    success: function (res) {
      var cityData = res.data;
      for (var i = 0, o = cityData.length; i < o; i++) {
        renderCityOption(cityData[i].id, cityData[i].name);
      }
    },
    error: function (err) {},
    complete: function () {
      cityWait.close();
    },
  });

  //$name.addEventListener('blur', initOption);
  //$hos.addEventListener('blur', initOption);

  $city.onchange = function () {
    $hos.innerHTML = "";
    $hos.value = "";
    if ($city.value !== 0) {
      $city.style.color = "#000";
    }
    FD.ajax({
      url: apiUrl + "sign-in/getHospitals?campaignId=" + campaignId,
      type: "GET",
      dataType: "json",
      success: function (res) {
        var hosData = res.data;

        for (var i = 0, hosDataLen = hosData.length; i < hosDataLen; i++) {
          var og = document.createElement("optgroup");
          cC = hosData[i].member;
          cSub[k++] = hosData[i].member;
          og.setAttribute("label", hosData[i].alphabet);

          //循环公司数量,遍历id,name进option元素

          for (var j = 0, ccLen = cC.length; j < ccLen; j++) {
            var op = document.createElement("option");
            op.innerText = cC[j].name;
            op.setAttribute("value", cC[j].id);
            if (cC[j].cityId == $city.value) {
              og.appendChild(op);
            }
          }

          //循环公司首字母分类,遍历公司进不同分类
          try {
            $hos.add(og, null);
          } catch (error) {
            console.log(error + "error");
          }
        }
      },
      error: function (err) {},
      complete: function () {
        var opgLabel = document.querySelectorAll("optgroup");

        opgLabel.forEach(function (a, b) {
          var opts = a.querySelectorAll("option");

          if (a.childElementCount == 0) {
            a.parentNode.removeChild(a);
          }
        });
      },
    });
  };

  // $bd.onchange = function () {
  //     if ($bd.value !== 0) {
  //         $bd.style.color = '#000';
  //     }
  // }

  $hos.onchange = function () {
    if ($hos.value !== 0) {
      $hos.style.color = "#000";
    }
  };

  //验证码
  FD.dom.on("click", ".js-getCode", function (e) {
    this.classList.toggle("go");
    this.setAttribute("disabled", "true");
    var num = 60;
    this.innerText = `等待(` + num + `)s`;
    var Times = setInterval(function () {
      if (e.target.classList.contains("go")) {
        num = num - 1;
        e.target.innerText = `等待(` + num + `)s`;
        if (num === 0) {
          clearInterval(Times);
          e.target.innerText = `获取验证码`;
          e.target.removeAttribute("disabled");
        }
      } else {
        e.target.classList.add("go");
      }
    }, 1000);

    FD.ajax({
      url: baseUrl + "sendPhoneValidCode",
      type: "POST",
      data: { phone: document.querySelector("#phone").value },
      dataType: "json",
      success: function (res) {
        console.log(res);
        new FD.toast({ msg: res.message, sec: "3" });
      },
    });
  });

  // 生成证书
  FD.dom.on("click", ".js-btn-getcert", function () {
    //catalog_id = $bd.value;
    option_id = $hos.value;

    if (option_id == "") {
      // || catalog_id ==''
      FD.toast({
        msg: "请选择所属医院或城市",
      });
      return;
    }

    var wait = FD.loading();
    var pNameV = $name.value;
    var $phoneV = document.querySelector("#phone").value;
    var $phoneCodeV = document.querySelector("#code").value;
    var $placeV = document.querySelector("#place").value;

    FD.ajax({
      url:
        apiUrl +
        "certificate-2022?bdId=" +
        "59,60,61,62,63" +
        "&campaignId=" +
        campaignId +
        "&force=false&hospitalId=" +
        $placeV +
        "&name=" +
        pNameV +
        "&phone=" +
        $phoneV +
        "&phoneValidCode=" +
        $phoneCodeV +
        "&receiveRecord=true",
      type: "POST",
      dataType: "json",
      success: function (res) {
        var hosData = res.data;

        if (res.code === 0) {
          if (hosData.length > 1) {
            console.log("more than 1");
            hosData.forEach(function (item) {
              renderImgSlider(".img-slider", item);
            });

            new FD.Dialog({
              width: "80%",
              height: "auto",
              title: "",
              content: document.querySelector(".getCert-box"),
              dialogClassName: "cert-dialog",
              className: "cert-cont",
              maskClick: false,
              showTitle: false,
              showClose: true,
              onInit: function () {
                document.querySelector(".getCert-box").classList.remove("hide");
                new FD.Slider({
                  ele: ".img-slider",
                  auto: false,
                  showNav: false,
                  showAction: true,
                  showPager: true,
                  touch: true,
                  infiniteLoop: false,
                  onAfter: function () {},
                });
              },
              onCloseAfter: function () {
                document.querySelector(".getCert-box").classList.add("hide");
                document.querySelector(".img-slider").innerHTML = "";
              },
            });
          } else {
            var img = document.createElement("img");
            img.setAttribute("src", hosData);
            document.querySelector(".img-slider").appendChild(img);
            new FD.Dialog({
              width: "80%",
              height: "auto",
              title: "",
              content: document.querySelector(".getCert-box"),
              dialogClassName: "cert-dialog",
              className: "cert-cont",
              maskClick: false,
              showTitle: false,
              showClose: true,
              onInit: function () {
                document.querySelector(".getCert-box").classList.remove("hide");
              },
              onCloseAfter: function () {
                document.querySelector(".getCert-box").classList.add("hide");
                document.querySelector(".img-slider").innerHTML = "";
              },
            });
          }
        } else if (res.code === 50001) {
          FD.toast({
            msg: res.message,
          });
        } else {
          FD.toast({
            msg: "未获取到对应的医生电子证书，请确认填写的信息",
          });
        }
      },
      error: function (err) {
        FD.toast({
          msg: "未获取到对应的医生电子证书，请确认填写的信息",
        });
      },
      complete: function () {
        wait.close();
      },
    });
  });
}

function renderImgSlider(box, src) {
  var img = document.createElement("img");
  var imgBox = document.querySelector(box);
  img.setAttribute("src", src);
  imgBox.appendChild(img);
}

//选项改变时，赋值option_id,catalog_id,hos_id
function dataChange() {
  var sa = document.querySelector("#place");
  var da = document.querySelector("#city");

  sa.onchange = function () {
    hos_id = sa.value;

    if (sa.value == -1) {
      document.querySelector(".other-box").classList.remove("hide");
    } else {
      document.querySelector(".other-box").classList.add("hide");
    }

    if (sa.value !== 0) {
      sa.style.color = "#000";
    }
  };
}

// 搜索
function initSearch(event) {
  if (!document.querySelector(".js-search-inner")) {
    return;
  }

  var $father = document.querySelector(".js-search-inner");
  var $search = document.querySelector(".js-search-input");
  var $wrap = document.querySelector(".js-search-list");
  var $cancel = document.querySelector(".js-btn-cancel");
  var totalPage;
  var page = 1;
  var val = "";

  var searchLi = function () {
    FD.ajax({
      url:
        apiUrl +
        "search/hysSearch?campaignId=11&page=" +
        page +
        "&q=" +
        encodeURIComponent(val) +
        "&size=20",

      method: "GET",
      dataType: "json",
      success: function (res) {
        if (res.code !== 0) {
          return;
        }

        if (!totalPage) {
          totalPage = res.data.pages;
        }

        initHTML(res.data.records);
      },
      error: function (err) {
        //console.log(err + '调取信息错误');
      },
    });
  };

  var initHTML = function (data) {
    for (var i = 0; i < data.length; i++) {
      var temp = "";
      var award = "";

      switch (data[i].bdId) {
        case 59:
          award = "羊城好医生";
          break;
        case 61:
          award = "羊城好医生";
          break;
        case 60:
          award = "羊城青年好医生";
          break;
        case 62:
          award = "南粤青年好医生";
          break;
        case 63:
          award = "科普好医生";
          break;
        default:
          break;
      }

      if (data[i].type === "医生") {
        temp =
          '<dl class="dr-cell">' +
          "<dt>" +
          '<a href="' +
          homePage +
          "/drDetail/?bdId=" +
          data[i].bdId +
          "&yskId=" +
          data[i].kuId +
          "&drId=" +
          data[i].id +
          '">' +
          '<img src="' +
          data[i].imgSrc +
          '">' +
          "</a>" +
          "</dt>" +
          "<dd>" +
          '<a href="' +
          homePage +
          "/drDetail/?bdId=" +
          data[i].bdId +
          "&yskId=" +
          data[i].kuId +
          "&drId=" +
          data[i].id +
          '">' +
          '<p class="dr-name">' +
          "<b>" +
          data[i].name +
          "</b>" +
          "<em>" +
          data[i].info1 +
          "</em>" +
          "</p>" +
          "<p>" +
          data[i].info2 +
          "</p>" +
          "<p>" +
          data[i].info3 +
          "</p>" +
          '<p class="dr-award">' +
          award +
          "</p>" +
          "</a>" +
          "</dd>" +
          "</dl>";
      } else if (data[i].type === "医院") {
        temp =
          '<dl class="dr-cell">' +
          "<dt>" +
          '<a href="' +
          homePage +
          "/drList/?bdId=" +
          data[i].bdId +
          "&yykId=" +
          data[i].kuId +
          "&drId=" +
          data[i].id +
          "&hosName=" +
          data[i].name +
          '">' +
          '<img src="' +
          data[i].imgSrc +
          '">' +
          "</a>" +
          "</dt>" +
          "<dd>" +
          '<a href="' +
          homePage +
          "/drList/?bdId=" +
          data[i].bdId +
          "&yykId=" +
          data[i].kuId +
          "&drId=" +
          data[i].id +
          "&hosName=" +
          data[i].name +
          '">' +
          '<p class="dr-name"><b>' +
          data[i].name +
          "</b> <em>" +
          data[i].info1 +
          "</em></p>" +
          "<p>地址：" +
          data[i].info2 +
          "</p>" +
          "</a>" +
          "</dd>" +
          "</dl>";
      }

      $wrap.innerHTML += temp;
    }
  };

  var scrollWatch = function (offset, cbBottom, cbScroll) {
    offset = offset || 0;

    if (typeof offset === "function") {
      callback = offset;
      offset = 0;
    }

    if (typeof callback !== "function") {
      callback = function () {};
    }

    let beforeScrollTop = 0;
    let direction = "";

    let getScrollTop = function () {
      return document.documentElement.scrollTop || document.body.scrollTop;
    };

    let fn = FD.throttle(function () {
      let scrollTop = getScrollTop();
      let scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;

      cbScroll(scrollTop);

      if (scrollTop + window.innerHeight >= scrollHeight - offset) {
        if (direction === "down") {
          cbBottom(removeListener);
        }

        off();
        setTimeout(add, 300);
      }
    }, 300);

    let add = function () {
      window.addEventListener("scroll", fn);
    };

    let off = function () {
      window.removeEventListener("scroll", fn);
    };

    let removeListener = function () {
      setTimeout(function () {
        window.removeEventListener("scroll", checkDirection);
        off();
      }, 500);
    };

    let checkDirection = function checkDirection() {
      let scrollTop = getScrollTop();

      direction = scrollTop - beforeScrollTop > 0 ? "down" : "up";
      beforeScrollTop = scrollTop;
    };

    window.addEventListener("scroll", checkDirection);
    add();
    return { removeListener: removeListener };
  };

  $search.onkeydown = function (event) {
    var e = event || window.event;

    if (e && e.keyCode == 13) {
      val = $search.value;
      page = 1;
      $wrap.innerHTML = "";

      searchLi();
    }
  };

  scrollWatch(
    0,
    function () {
      if (page < totalPage) {
        page += 1;
        searchLi();
      }
    },
    function (scrollTop) {
      if (scrollTop > 10) {
        $father.classList.add("bg-color");
      } else {
        $father.classList.remove("bg-color");
      }
    }
  );

  $cancel.onclick = function () {
    $search.value = "";
  };
}

//排行榜搜索
function phbSearch() {
  var $wrap = document.querySelector(".rank-page");
  if (!$wrap) {
    return;
  }
  $wrap.querySelector(".search input").oninput = function () {
    //console.log(11111)
    $wrap.querySelector(".search .icon_clean").classList.remove("hide");
  };

  FD.dom.on("click", ".rank-page .search .icon_clean", function () {
    $wrap.querySelector("input").value = "";
    $wrap.querySelector(".icon_clean").classList.add("hide");
  });

  $wrap.querySelector(".search-pannel select").onchange = function () {
    switch (Number($wrap.querySelector(".search-pannel select").value)) {
      case 3:
        $wrap.querySelector(".phb-title-wrap").classList.add("hide");
        break;

      default:
        $wrap.querySelector(".phb-title-wrap").classList.remove("hide");
        break;
    }
  };
}

//首页头部搜索跳转
function topSearchHref() {
  var $wrap = document.querySelector(".banner-wrap .search_top");

  if (!$wrap) {
    return;
  }

  FD.dom.on("click", $wrap.querySelector(".btn_search_top"), function () {
    var $val = $wrap.querySelector("input").value;
    var type = 0;
    console.log(homePage + path);

    if (/[0-9]/.test($val)) {
      type = 3;
      window.location.href =
        homePage + "/rank/?value=" + $val + "&type=" + type;
    } else if (/[\u4E00-\u9FA5]/.test($val)) {
      type = 2;
      window.location.href =
        homePage + "/rank/?value=" + $val + "&type=" + type;
    }
  });
}

//排行榜初始化
function initPhb() {
  var $wrap = document.querySelector(".rank-page");
  if (!$wrap) {
    return;
  }

  var type = FD.getQueryString(location.href, "type");
  var $val = FD.getQueryString(location.href, "value");

  var curRank = 1;
  var size = 1;

  var input = $wrap.querySelector(".search input");
  var select = $wrap.querySelector("#select_type");

  $wrap.querySelector(".search-pannel select").onchange = function () {
    switch (Number($wrap.querySelector(".search-pannel select").value)) {
      case 3:
        $wrap.querySelector(".phb-title-wrap").classList.add("hide");
        input.value = "";
        break;

      case 2:
        $wrap.querySelector(".phb-title-wrap").classList.remove("hide");
        input.value = "";
        break;

      default:
        $wrap.querySelector(".phb-title-wrap").classList.remove("hide");
        input.value = "";
        break;
    }
  };

  FD.dom.on("click", ".phb-title-wrap a", function () {
    if (this.classList.contains("on")) {
      return;
    }
    var btnAll = document.querySelectorAll(".phb-title-wrap a");
    btnAll.forEach(function (a) {
      a.classList.remove("on");
    });
    this.classList.add("on");
    document.querySelector(".js-phb-list").innerHTML = "";
    document.querySelector(".search input").value = "";
    curRank = 1;
    size = 1;
    pageRank = 1;
    rankTotal = 0;
    rankPages = 0;
    $val = "";
    type = 0;
    init(this.dataset.bd);
    // setTimeout(function () {
    //     window.addEventListener('scroll', pullToLoadRank);
    // }, 500);
  });

  FD.dom.on("click", ".search-pannel .search button", function () {
    var type = select.value;
    var $inputVal = input.value;
    if ($inputVal == "" || null) {
      return new FD.toast({ msg: "请输入想要搜索的医生或医生编号", sec: "2" });
    }
    $wrap.querySelector(".phb-title-wrap").classList.add("hide");
    document.querySelector(".js-phb-list").innerHTML = "";
    curRank = 1;
    size = 1;
    pageRank = 1;
    rankTotal = 0;
    rankPages = 0;
    //window.removeEventListener('scroll', pullToLoadRank);

    var loading = FD.loading();
    FD.ajax({
      url:
        apiUrl +
        "vote/top-doctor2?bdIds=59,61,60,62,63&size=50" +
        "&currentPage=" +
        curRank +
        "&type=" +
        type +
        "&q=" +
        $inputVal,
      type: "GET",
      dataType: "json",
      success: function (res) {
        //console.log(res)
        var $data = res.data.records;
        $data.forEach(function (a) {
          render(a, size);
          size++;
        });
      },
      complete: function () {
        loading.close();
      },
    });
  });

  FD.dom.on("keydown", ".search-pannel .search input", function (e) {
    var e = e || window.event;
    if (e.keyCode == 13) {
      document.querySelector(".search-pannel .search button").click();
    }
  });

  $val !== "" ? (input.value = $val) : null;
  type !== "" ? (select.value = type) : 0;

  var init = function (bdId) {
    var loading = FD.loading();
    FD.ajax({
      url:
        apiUrl +
        "vote/top-doctor2?bdIds=" +
        bdId +
        "&size=50" +
        "&currentPage=" +
        curRank +
        "&q=" +
        $val +
        "&type=" +
        type,
      type: "GET",
      dataType: "json",
      success: function (res) {
        //console.log(res)
        var $data = res.data.records;
        $data.forEach(function (a) {
          render(a, size);
          size++;
        });
      },
      complete: function () {
        loading.close();
      },
    });
  };

  var render = function (data, index) {
    var award = "";
    switch (data.campaignBdId) {
      case 59:
        award = "羊城好医生";
        break;
      case 61:
        award = "南粤好医生";
        break;
      case 60:
        award = "羊城青年好医生";
        break;
      case 62:
        award = "南粤青年好医生";
        break;
      case 63:
        award = "科普好医生";
        break;
      default:
        break;
    }

    var type = "";
    switch (Number(index)) {
      case 1:
        type = "first";
        break;
      case 2:
        type = "second";
        break;
      case 3:
        type = "third";
        break;
    }

    var $temp = "";
    $temp +=
      '<a class="rank-item" href="' +
      homePage +
      "/drDetail/?bdId=" +
      data.doctor.campaignBdId +
      "&drId=" +
      data.doctor.id +
      "&award=" +
      award +
      '">';
    $temp += '<div class="rank ' + type + '">' + index + "</div>";
    $temp +=
      '<div class="icon"><img src="' + data.doctor.imgSrc + '" alt=""></div>';
    $temp += '<div class="num">' + data.doctor.id + "</div>";
    $temp += '<div class="name">' + data.doctor.name + "</div>";
    $temp += '<div class="nov">' + data.voteNum + "</div></a>";

    document.querySelector(".rank-list").innerHTML += $temp;
  };

  init("59,60,61,62,63");

  //排行榜下拉加载
  var pullToLoadRank = FD.throttle(function (e) {
    var medsNum = document.querySelectorAll(".rank-item");
    var isLoad = true; //触发开关

    if (medsNum.length < 50) {
      return;
    }
    var midCount = Math.floor(medsNum.length / 2) + 1;
    var height = medsNum[midCount].offsetHeight;

    if (rankTotal == medsNum.length) {
      var txt = document.createElement("p");
      txt.className = "noMore rank-item";
      txt.innerText = "没有更多了";
      txt.style.textAlign = "center";
      txt.style.display = "block";
      document.querySelector(".js-phb-list").append(txt);
      //window.removeEventListener('scroll', pullToLoadRank);
      return;
    }

    if (
      getScrollTop() + getClientHeight() + height > getScrollHeight() &&
      isLoad == true
    ) {
      var curRank;
      var leaveNum = rankTotal % 50;

      if (pageRank == rankPages) {
        curRank = leaveNum;
      } else {
        curRank = pageRank * 50 + 1;
      }

      var rankOnBtns = document
        .querySelector(".phb-title-wrap")
        .querySelectorAll("a");
      var rankBtnCur = "";
      for (let index = 0; index < rankOnBtns.length; index++) {
        if (rankOnBtns[index].classList.contains("on")) {
          rankBtnCur = document.querySelector(".phb-title-wrap .on").dataset.bd;
          break;
        } else {
          rankBtnCur = "59,60,61,62,63";
        }
      }

      pageRank++;

      var loading = FD.loading();
      FD.ajax({
        url:
          apiUrl +
          "vote/top-doctor2?bdIds=" +
          rankBtnCur +
          "&size=50" +
          "&currentPage=" +
          pageRank +
          "&type=" +
          select.value +
          "&q=" +
          input.value,
        type: "GET",
        success: function (res) {
          if (res.code !== 0) {
            return;
          }
          //console.log(res)
          var $data = res.data.records;
          $data.forEach(function (a) {
            render(a, curRank);
            curRank++;
          });

          rankTotal = res.data.total;
        },
        complete: function () {
          loading.close();
        },
      });
      isLoad = false;

      // window.removeEventListener('scroll', pullToLoadRank);

      // setTimeout(function () {
      //     window.addEventListener('scroll', pullToLoadRank);
      // }, 500);
    }
  }, 500);

  // window.removeEventListener('scroll', pullToLoadRank);

  // setTimeout(function () {
  //     window.addEventListener('scroll', pullToLoadRank);
  // }, 500);
}

function getScrollHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
}

//可视范围高度
function getClientHeight() {
  var clientHeight = 0;
  if (document.body.clientHeight && document.documentElement.clientHeight) {
    clientHeight = Math.min(
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  } else {
    clientHeight = Math.max(
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
  return clientHeight;
}

//滚动条当前高度
function getScrollTop() {
  var scrollTop = 0;
  if (document.documentElement && document.documentElement.scrollTop) {
    scrollTop = document.documentElement.scrollTop;
  } else if (document.body) {
    scrollTop = document.body.scrollTop;
  }
  return scrollTop;
}

function getCookie(name) {
  var cookieValue = "";
  var search = name + "=";
  if (document.cookie.length > 0) {
    offset = document.cookie.indexOf(search);
    if (offset != -1) {
      offset += search.length;
      end = document.cookie.indexOf(";", offset);
      if (end == -1) end = document.cookie.length;
      cookieValue = unescape(document.cookie.substring(offset, end));
    }
  }
  return cookieValue;
}

//微信分享增加好评数
function weShare() {
  if (!isWeiXin) {
    FD.initShare();
    return;
  }

  var identity, cookieValue;
  identity = getCookie("cby_identity");
  cookieValue = getCookie("cby_c_token");

  var bdId = FD.getQueryString(location.href, "bangdanId") || 59;

  //分享数据类型并成功后提交share接口
  var $desc = document.querySelector("meta[name=description]");
  var $link = document.querySelector("meta[name=wechatShareLink]");
  var $imgUrl = document.querySelector("meta[name=wechatShareImgUrl]");

  var times = 0;

  if (document.querySelector("#hdjs")) {
    $desc.setAttribute("content", "恭喜上榜！可以投票了！");
  }
  var defaults = {
    title: document.title,
    link: ($link && $link.getAttribute("content")) || location.href,
    imgUrl:
      ($imgUrl && $imgUrl.getAttribute("content")) ||
      "https://img.familydoctor.com.cn/images/jtys-512.png",
    desc: ($desc && $desc.getAttribute("content")) || document.title || "",
    success: function () {
      console.log("触发success");
    },
    cancel: function () {
      console.log("触发cancel");
    },
    trigger: function () {
      $.ajax({
        url: baseUrl + "vote/share",
        type: "POST",
        data: {
          cbyIdentity: identity,
          url: window.location.href,
          campaignBdId: bdId,
        },
        dataType: "json",
        xhrFields: {
          withCredentials: true,
        },
        headers: { "X-XSRF-TOKEN": cookieValue },
        success: function (respon) {
          console.log(respon);
        },
      });
    },
    fail: function () {
      console.log("触发fail");
    },
    complete: function () {
      console.log("触发complete");
    },
  };

  var WechatConfig = function () {
    var vUrl = location.href.split("#")[0];
    $.ajax({
      url: baseUrl + "vote/shareConfig",
      type: "GET",
      dataType: "json",
      data: {
        shareUrl: vUrl,
      },
      xhrFields: {
        withCredentials: true,
      },
      success: function (res) {
        if (res.code == 0) {
          wx.config({
            debug: false,
            appId: res.data.appId,
            timestamp: res.data.timestamp,
            nonceStr: res.data.nonceStr,
            signature: res.data.signature,
            jsApiList: [
              "onMenuShareTimeline",
              "onMenuShareAppMessage",
              "onMenuShareQQ",
              "onMenuShareWeibo",
              "onMenuShareQZone",
              "hideMenuItems",
            ],
          });
          wx.ready(function () {
            // jweixin 1.4 版
            wx.onMenuShareTimeline(defaults);
            wx.onMenuShareAppMessage(defaults);
            wx.onMenuShareQQ(defaults);
            wx.onMenuShareWeibo(defaults);
            wx.onMenuShareQZone(defaults);
          });
          window.isWechatShareInit = true;
        } else {
          window.location.href =
            $bizUrl + encodeURIComponent(location.href) + "&scope=snsapi_base";
        }
      },
      complete: function () {},
    });
  };

  WechatConfig();
}

function getRandomString(len) {
  let min = 0,
    max = charStr.length - 1,
    _str = "";
  //判断是否指定长度，否则默认长度为15
  len = len || 15;
  //循环生成字符串
  for (var i = 0, index; i < len; i++) {
    index = RandomIndex(min, max, i);
    _str += charStr[index];
  }
  return _str;
}

function RandomIndex(min, max, i) {
  let index = Math.floor(Math.random() * (max - min + 1) + min),
    numStart = charStr.length - 10;
  //如果字符串第一位是数字，则递归重新获取
  if (i == 0 && index >= numStart) {
    index = RandomIndex(min, max, i);
  }
  //返回最终索引值
  return index;
}
