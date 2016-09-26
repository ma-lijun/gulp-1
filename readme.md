5811
=
环境准备
-
**1.安装nodejs**

你可以在 [官方网站](https://nodejs.org/en/) 下载（下载最新版），
或者 [点击这里](https://nodejs.org/dist/v6.6.0/node-v6.6.0-x64.msi)下载,
下载完成之后安装一直选择下一步即可。

安装完成之后可以打开CMD输入以下命令，出现版本号则说明安装成功

    node -v

**2.更换npm源（可选）**

npm是nodejs的包管理器，用于安装卸载模块

但是npm在国内下载速度很慢，为了能正常使用，可以切换npm源，这里使用淘宝的npm镜像，
在CMD输入以下命令即可切换至淘宝镜像

    npm config set registry https://registry.npm.taobao.org 
    
**3.npm常用命令**

*安装包   

        npm install  [-g] [--save] <name>
           
 &lt;name&gt;：node插件名称。例：
 
        npm install gulp
    
 -g：全局安装(可选)。将会安装在C:\Users\Administrator\AppData\Roaming\npm，并且写入系统环境变量。例：
 
        npm install -g gulp
 
  --save：作为项目的依赖安装，配置信息将保存至package.json。例：
  
        npm install --save gulp
        
**4.开始使用**

下载本项目至本地，cmd 定位到 本项目根目录。

例：下载到了桌面，鼠标放在项目文件夹上，按住shift点击鼠标右键，选择在此处打开命令窗口

输入

    npm i
    
安装完成后打开gulpfile.js文件，修改第三行目录为在做项目的项目目录（建议将项目移动进来），之后在CMD输入

    gulp 
    
    
启动本地服务器（也可以使用处于同一局域网的其他设备打开）
将会监视HTML、CSS、JS文件变化，自动编译，自动刷新浏览器。

**5.实现的功能**

+ HTML 模板引入（ejs模板引擎，具体语法参照 [mde/ejs](https://github.com/mde/ejs)）

        <%- include('template/header.html') %>
       
+ less 自动编译（语法参照 [less中文网](http://lesscss.cn/)），less是css的超集，因此即使你不想使用less，可以直接在里面写css

less支持引入，因此你可以事先定义一些变量和mixins(类似函数)

    @import "template/var.less";

比如媒体查询的mixins
      
     .xs(@rules){
       @media screen and (max-width:768px){
         @rules();
       }
     }
        
然后你就可以在任意地方
 
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
+ 自动加浏览器前缀


当前设置兼容性为 

    browsers: ['last 5 versions', 'IE 6-8', '>1%']
    
+ 处理透明度兼容问题,inline-block自动hack

**6.各任务简介**

+ 默认任务

        gulp
 
+ 最终发布，将会清理html和css模板文件,并且压缩css，js  

        gulp dist
    
+ doyo发布

         gulp doyo

将源代码编译至doyo文件夹，并且替换 ()

    <%- include('template/header.html') %>
    
为
    
    {include = "template/header.html" }

    






