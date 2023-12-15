from pathlib import PurePath

from docx2pdf import convert
from flask import Flask, request, jsonify, render_template, send_file
from pdf2docx import Converter

app = Flask(__name__)

UPLOAD_FOLDER = '/data/file/'  # 设置文件上传的目标文件夹
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
wpath = "D:/test/"
lpath = "/data/file/"
# 文件格式
doc1 = ".doc"
doc2 = ".docx"
pdf1 = ".pdf"
img1 = ".png"
img2 = ".jpeg"


# 首页

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/test', methods=['GET'])
def test():
    return jsonify({'success': 'test'})


# 文件上传
@app.route('/upload', methods=['POST'])
def upload_file():
    # 检查请求中是否有文件
    print(request)
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    files = request.files.getlist('file')

    # 如果文件存在并且是允许的文件类型
    for file in files:
        if file:
            # 构建保存路径
            s = getSys()
            fname = file.filename
            if s == 1:
                file_path = wpath
            elif s == 2:
                file_path = app.config['UPLOAD_FOLDER'] + fname
            save_path = file_path + fname
            file.save(save_path)
    # 返回文件保存的路径或其他信息
    file_names = [f.filename for f in files]
    return jsonify({"files": file_names, "file_path": file_path, 'result': True})


# 文件转换入口，从这里进行分发
@app.route('/fileconvert', methods=['GET'])
def fileconvert():
    file_path = request.args.get('filepath')
    file_name = request.args.get("filename")
    source_type = request.args.get('source_type')
    end_type = request.args.get("end_type")
    print(file_path)
    print(file_name)
    print(source_type)
    print(end_type)
    # pdf-docx
    if ("." + source_type).lower() == pdf1.lower() and ("." + end_type).lower() == doc2.lower():
        print("pdf-----docx  start...")
        return convertPdf2Docx(file_path, file_name)
    # docx->pdf
    elif ("." + source_type).lower() == doc2.lower() and ("." + end_type).lower() == pdf1.lower():
        return convert_docx_to_pdf(file_path, file_name)
    return jsonify({"success": False, "msg": "暂不支持"})


# pdf - docx
@app.route('/convertPdf2Docx', methods=['GET'])
def convertPdf2Docx(file_path, file_name):
    filePath = pdf2Docx(file_path, file_name)
    re = {"file": filePath, "success": True}
    return jsonify(re);


# pdf - doc
@app.route('/convertPdf2Doc', methods=['GET'])
def convertPdf2Doc():
    # name = request.args.get('name', 'Guest')
    file_path = request.args.get('filepath')
    file_name = request.args.get("filename")

    filePath = pdf2Doc(file_path, file_name)
    re = {"filename": filePath, "file_path": filePath}
    return True


#  pdf - docx
def pdf2Docx(file_path, file_name):
    # convert pdf to docx
    print(file_path)
    print(file_name)
    cv = Converter(file_path + file_name)
    filename = get_file_name_no_extension(file_name)
    cv.convert(file_path + filename + doc2)  # all pages by default
    cv.close()
    return file_path + filename + doc2


#  pdf - doc
def pdf2Doc(file_path, file_name):
    # convert pdf to docx
    cv = Converter(file_path + file_name)
    filename = get_file_name_no_extension(file_name)
    cv.convert(file_path + filename + doc1)  # all pages by default
    cv.close()
    return file_path + filename + doc1


# docx - pdf
def convert_docx_to_pdf(file_path, file_name):
    filename = get_file_name_no_extension(file_name)
    convert(file_path + file_name, file_path + filename + pdf1)
    re = {"file": file_path + filename + pdf1, "success": True}
    return jsonify(re)


@app.route('/downloadfile', methods=['GET'])
def download_file():
    file_path = request.args.get("filepath")
    filename = get_file_name_with_extension(file_path)
    return send_file(file_path, as_attachment=True, download_name=filename)


# 获取带后缀的文件名
def get_file_name_with_extension(file_path):
    # 使用 PurePath 封装文件路径
    path = PurePath(file_path)

    # 获取文件名（带后缀）
    file_name_with_extension = path.name

    return file_name_with_extension


# 获取文件后缀
def get_file_extension(file_path):
    # 使用 split() 方法，将文件路径按照 '.' 分割，并取最后一部分作为后缀名
    extension = file_path.split('.')[-1]
    return extension


# 没有后缀的文件名
def get_file_name_no_extension(file_path):
    # 使用 PurePath 封装文件路径
    path = PurePath(file_path)

    # 获取文件名（带后缀）
    file_name_with_extension = path.name

    # 使用 rsplit() 方法，将文件名从右边按照 '.' 分割，最多分割一次
    file_name_without_extension = file_name_with_extension.rsplit('.', 1)[0]

    return file_name_without_extension


# 获取当前系统
def getSys():
    system = platform.system()
    if system == "Windows":
        return 1
    elif system == "Linux":
        return 2
    elif system == "Darwin":
        return 3
    else:
        return 4


if __name__ == '__main__':
    # app.run("0.0.0.0", "80",False)
    app.run("localhost", "80", True)
