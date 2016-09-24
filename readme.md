5811
=
环境准备
-
**1.安装nodejs**

你可以在 [官方网站](https://nodejs.org/en/) 下载，
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

项目目录结构

