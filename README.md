## 文件转换项目
### 进展
1. 完成docx-pdf,pdf-docx
2. 页面修改
3. 其他后端依赖和接口改造
4. 2023年12月19日19:11:51    图片转PDF 完成


## 项目部署
1. 将最新的代码传入服务器
2. 删除venv ，因为操作系统不一样
3. 重新新建venv - > 进入到venv/bin/目录下 -> source activate 启动虚拟环境
4. 在这个目录下执行：  pip3 install -r requirements.txt 安装依赖包
5. 依赖安装完毕后，退到项目根目录下，执行 :  python3 app.py 项目运行。也可以后太运行: nohup python3 app.py

## 注意事项：
注意包的依赖，每个操作系统是不一样的。