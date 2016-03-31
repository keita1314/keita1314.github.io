---
layout: post
title: 自己动手实现一个简单的栅格系统
---
####栅格系统####
Bootstrap和Foundation等前端库都提供了一套响应式的栅格（网格）系统，方便开发者实现各种形式的网页布局。栅格系统的主要目标是为开发者摆脱复杂的CSS布局代码，通过建立行(Row)与列(Column)的概念，就可以轻易创建规范的布局，开发者需要的是只是将内容放进栅格系统。
####实现原理####
栅格系统暴露给开发者的概念只有行(Row)和列(Column)，但其内部实现还是CSS布局的应用，在CSS中最常用的布局方式一般有两种float和position。Boottrap中的栅格系统主要是使用了float来实现，这是一种比较浏览器兼容的布局方法。
一个栅格系统主要包含三部分
1. container(容器)
2. row(行)
3. column(列)
4. gutter(间距)

![请在这里输入图片描述](http://ww1.sinaimg.cn/mw690/c752b558gw1f2e116ec2sj20o50epaad.jpg)

#####container容器######
Bootstrap和Foundation都是将屏幕的宽划分成12等份，每一列占12/1的屏幕宽度，所以container的宽度一般为屏幕的100%。

     .container {
          width:100%;
     }

#####row行#####
列的布局使用float来实现，float会引起父元素的高度塌陷，所以要使用一些clearfix技巧来清除浮动。

    .row:before,
     .row:after {
         content: "";
          height: 0;
          clear: both;
          display: block;
    }


#####column列#####
列的定位使用用float来实现，还要考虑间距(gutter)。

    [class*='col-'] {
          float: left;
          min-height: 1px;
          padding: 10px;
     }


一个单元列占12/1的屏宽，用sass来写就是

    @for $i from 1 through 12 {
      .col-#{$i} {
        width: $i/12 * 100%;
      }
    }


编译后的css
.

    col-1 {
        width: 8.33333%;
    }
    
    .col-2 {
        width: 16.66667%;
    }
    
    .col-3 {
        width: 25%;
    }
    
    .col-4 {
        width: 33.33333%;
    }
    
    .col-5 {
        width: 41.66667%;
    }
    
    .col-6 {
        width: 50%;
    }
    
    .col-7 {
        width: 58.33333%;
    }
    
    .col-8 {
        width: 66.66667%;
    }
    
    .col-9 {
        width: 75%;
    }
    
    .col-10 {
        width: 83.33333%;
    }
    
    .col-11 {
        width: 91.66667%;
    }
    
    .col-12 {
        width: 100%;
    }


####例子####
html

    <!DOCTYPE html>
    <html>
    
    <head>
      <link rel="stylesheet" href="task8.css">
    </head>
    
    <body>
      <div class='container'>
        <div class='row'>
          <div class='col-4'><div class='item'></div></div>
          <div class='col-4'><div class='item'></div></div>
          <div class='col-4'><div class='item'></div></div>
        </div>
        <div class='row'>
          <div class='col-3'><div class='item'></div></div>
          <div class='col-6'><div class='item'></div></div>
          <div class='col-3'><div class='item'></div></div>
        </div>
        <div class='row'>
          <div class='col-1'><div class='item'></div></div>
          <div class='col-1'><div class='item'></div></div>
          <div class='col-2'><div class='item'></div></div>
          <div class='col-2'><div class='item'></div></div>
          <div class='col-6'><div class='item'></div></div>
        </div>
      </div>
    </body>
    
    </html>

表现如下宽度大于768px

![请在这里输入图片描述](http://ww1.sinaimg.cn/mw690/c752b558gw1f2e1158qeij212w06ajra.jpg)

####响应式####
响应式主要用媒体查询来实现，当大屏的时候是一种比例，小屏的时候是另外一种比例
sass代码

    @media (min-width:768px) {
        @for $i from 1 through 12 {
            .col-#{$i} {
                width: $i/12 * 100%;
            }
        }
    }
    
    @media (max-width:768px) {
        @for $j from 1 through 12 {
            .col-sm-#{$j} {
                width: $j/12 * 100%;
            }
        }
    }


css代码

    @media (min-width: 768px) {
        .col-1 {
            width: 8.33333%;
        }
        .col-2 {
            width: 16.66667%;
        }
        .col-3 {
            width: 25%;
        }
        .col-4 {
            width: 33.33333%;
        }
        .col-5 {
            width: 41.66667%;
        }
        .col-6 {
            width: 50%;
        }
        .col-7 {
            width: 58.33333%;
        }
        .col-8 {
            width: 66.66667%;
        }
        .col-9 {
            width: 75%;
        }
        .col-10 {
            width: 83.33333%;
        }
        .col-11 {
            width: 91.66667%;
        }
        .col-12 {
            width: 100%;
        }
    }
    
    @media (max-width: 768px) {
        .col-sm-1 {
            width: 8.33333%;
        }
        .col-sm-2 {
            width: 16.66667%;
        }
        .col-sm-3 {
            width: 25%;
        }
        .col-sm-4 {
            width: 33.33333%;
        }
        .col-sm-5 {
            width: 41.66667%;
        }
        .col-sm-6 {
            width: 50%;
        }
        .col-sm-7 {
            width: 58.33333%;
        }
        .col-sm-8 {
            width: 66.66667%;
        }
        .col-sm-9 {
            width: 75%;
        }
        .col-sm-10 {
            width: 83.33333%;
        }
        .col-sm-11 {
            width: 91.66667%;
        }
        .col-sm-12 {
            width: 100%;
        }
    }



html 


    <!DOCTYPE html>
    <html>
    
    <head>
      <link rel="stylesheet" href="task8.css">
    </head>
    
    <body>
      <div class='container'>
        <div class='row'>
          <div class='col-4 col-sm-6'><div class='item'></div></div>
          <div class='col-4 col-sm-6'><div class='item'></div></div>
          <div class='col-4 col-sm-12'><div class='item'></div></div>
        </div>
        <div class='row'>
          <div class='col-3 col-sm-3'><div class='item'></div></div>
          <div class='col-6 col-sm-6'><div class='item'></div></div>
          <div class='col-3 col-sm-3'><div class='item'></div></div>
        </div>
        <div class='row'>
          <div class='col-1 col-sm-2'><div class='item'></div></div>
          <div class='col-1 col-sm-2'><div class='item'></div></div>
          <div class='col-2 col-sm-8'><div class='item'></div></div>
          <div class='col-2 col-sm-3'><div class='item'></div></div>
          <div class='col-6 col-sm-3'><div class='item'></div></div>
        </div>
      </div>
    </body>
    
    </html>

表现如下屏幕宽度小于768px

![请在这里输入图片描述](http://ww4.sinaimg.cn/mw690/c752b558gw1f2e115lehej20gg09wa9x.jpg)

![请在这里输入图片描述](https://sawiki2.nie.netease.com/media/image/gjdn1690/20160329203311.gif)

####偏移####
有一些单元格需要偏移，只需要设置margin-left就可以，类似这样

    col-offset-1 {
        margin-left: 8.333334%
    }


[1] http://j4n.co/blog/Creating-your-own-css-grid-system
[2] http://ife.baidu.com/task/detail?taskId=8
[3] https://getbootstrap.com/examples/grid/
