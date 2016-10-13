5811
=
环境准备
-
## **1.安装nodejs**

你可以在 [官方网站](https://nodejs.org/en/) 下载（下载最新版），
或者 [点击这里](https://nodejs.org/dist/v6.6.0/node-v6.6.0-x64.msi)下载,
下载完成之后安装一直选择下一步即可。

安装完成之后可以打开CMD输入以下命令，出现版本号则说明安装成功

    node -v

## **2.更换npm源（可选）**

npm是nodejs的包管理器，用于安装卸载模块

但是npm在国内下载速度很慢，为了能正常使用，可以切换npm源，这里使用淘宝的npm镜像，
在CMD输入以下命令即可切换至淘宝镜像

    npm config set registry https://registry.npm.taobao.org 
    
 
    
## **3.npm常用命令**

安装包   

        npm install  [-g] [--save] <name>
           
 &lt;name&gt;：node插件名称。例：
 
        npm install gulp
    
 -g：全局安装(可选)。将会安装在C:\Users\Administrator\AppData\Roaming\npm，并且写入系统环境变量。例：
 
        npm install -g gulp
 
  --save：作为项目的依赖安装，配置信息将保存至package.json。例：
  
        npm install --save gulp
        
       
           
## **4.开始使用**

下载本项目至本地，cmd 定位到 本项目根目录。

例：下载到了桌面，鼠标放在项目文件夹上，按住shift点击鼠标右键，选择在此处打开命令窗口

输入

    npm i
    
    
#### **附（以下可选）:** 

        现在你也可以使用yarn安装项目的依赖,安装速度比npm快好多倍（yarn是facebook出品的node包管理器） 

        全局安装yarn
       
        npm install -g yarnpkg
        
        之后在cmd输入
        
        yarn
        
    
安装完成后打开gulpfile.js文件，修改第三行根目录为在做项目的项目目录（以test文件夹为例），之后在CMD输入

    gulp 
    
    
启动本地服务器（也可以使用处于同一局域网的其他设备打开）
将会监视HTML、CSS、JS文件变化，自动编译，自动刷新浏览器。

## **5.实现的功能**

+ HTML 模板引入（ejs模板引擎，具体语法参照 [mde/ejs](https://github.com/mde/ejs)）

        <%- include('template/header.html') %>
        
        或者
        
        {{header}} 默认后缀为html，目录为template
       
+ 自动加浏览器前缀

    当前设置兼容性为 

        browsers: ['last 10 versions', 'IE 6-8', '>1%']
           
+ less 自动编译（语法参照 [less中文网](http://lesscss.cn/)），less是css的超集，因此即使你不想使用less，可以直接在里面写css，sublime用户请自行安装less插件以支持语法高亮

    less支持引入，例如
    
        /*头部*/
        @import "template/header.less";
        
        /*底部*/
        @import "template/foot.less";
        
        /*公用模块*/
        @import "template/zz.less";
        
     less支持嵌套，比如
     
        body{
          height: 50px;
          a{
            color:red
          }
        }
        编译为
        body {
          height: 50px;
        }
        body a {
          color: red;
        }
        
    嵌套里的media query 和 @keyframes 会自动跳出，比如
    
        body{
          animation: zz 3s infinite;
          @keyframes zz{
            from{
              width: 50px;
            }
            to{
              width: 100px;
            }
          }
        }
        自动编译为
        body {
          -webkit-animation: zz 3s infinite;
                  animation: zz 3s infinite;
        }
        @-webkit-keyframes zz {
          from {
            width: 50px;
          }
          to {
            width: 100px;
          }
        }
        @keyframes zz {
          from {
            width: 50px;
          }
          to {
            width: 100px;
          }
        }
    
    还可以事先定义一些变量和mixins(类似函数)并引入

         @import "template/var.less";

    比如媒体查询的mixins
      
        .xs(@rules){
          @media screen and (max-width:768px){
            @rules();
          }
        }
        
    然后就可以在任意地方
 
        body{
          height: 50px;
          .xs({ height: 50px;})
        }
    
        会自动编译为(最后媒体查询会被gulp-group-css-media-queries插件合并在一起)

        body {
          height: 50px;
        }
        @media screen and (max-width: 768px) {
          body {
            height: 50px;
          }
        }
        
    
    
    
+ css，js压缩（cssnano）

+ 处理透明度兼容问题,inline-block自动hack

+ es2015 语 babel自动编译，默认关闭

+ 图片压缩 默认关闭

+ 自动合并雪碧图并替换css中的background-position（默认没有、、）

## **6.目录结构**
#### 假设test为项目目录

>gulp
>>node_modules<br> 
test
>>>dist

>>>build

>>>www

>>>>css<br>js<br>images

>>>doyo

>>.gitignore<br>
gulpfile.js<br>
package.json<br>
readme.md<br>

+ www 源代码

+ build 开发目录

+ dist 发行目录

+ doyo doyocms目录

+ node_modules node模块


## **7.各任务简介**

+ 默认任务，编译源代码到build

        gulp
 
+ 最终发布，将会清理html和css模板文件,并且压缩css，js  

        gulp dist
    
    
+ 只监视文件并自动刷新浏览器

        gulp justwatch

+ doyo发布

        gulp doyo

将源代码编译至doyo文件夹，并且替换 ()

         <%- include('template/header.html') %>
    
为
    
         {include = "template/header.html" }

    






