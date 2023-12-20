import platform

from flask import Flask, request, jsonify, render_template, send_file

from doc2pdfself import convertPdf2Docx, docx_to_pdf, convertPdf2Doc
from fileutils import get_file_name_with_extension
from image2imageself import image_to_pdf
from txt2docself import txt_to_doc, txt_to_docx, docx_to_txt
from excel2pdfself import excel2pdf

app = Flask(__name__)

UPLOAD_FOLDER = '/data/file/'  # 设置文件上传的目标文件夹
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
wpath = "D:/test/"
lpath = "/data/file/"
# 文件格式
TYPE_DOC = ".doc"
TYPE_DOCX = ".docx"
TYPE_PDF = ".pdf"
TYPE_TXT = '.txt'
TYPE_XLS = ".xls"
TYPE_XLSX = ".xlsx"
common_excel_formats = [TYPE_XLS, TYPE_XLSX]
# 常用的图片格式
common_image_formats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.ico', '.ppm', '.pgm',
                        '.pbm', '.pnm', '.jp2', '.j2k', '.jpf', '.jpx', '.jpm']


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
                file_path = lpath
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
    if ("." + source_type).lower() == TYPE_PDF.lower() and ("." + end_type).lower() == TYPE_DOCX.lower():
        print("pdf-----docx  start...")
        return convertPdf2Docx(file_path, file_name)
    # pdf-doc
    if ("." + source_type).lower() == TYPE_PDF.lower() and ("." + end_type).lower() == TYPE_DOC.lower():
        print("pdf-----doc  start...")
        return convertPdf2Doc(file_path, file_name)
    # docx->pdf
    elif ("." + source_type).lower() == TYPE_DOCX.lower() and ("." + end_type).lower() == TYPE_PDF.lower():
        return docx_to_pdf(file_path, file_name)
    # doc->pdf
    elif ("." + source_type).lower() == TYPE_DOC.lower() and ("." + end_type).lower() == TYPE_PDF.lower():
        return docx_to_pdf(file_path, file_name)
    # 图片 -> PDF
    elif ("." + source_type).lower() in common_image_formats and ("." + end_type).lower() == TYPE_PDF.lower():
        return image_to_pdf(file_path, file_name)
    # txt - doc
    elif ("." + source_type).lower() == TYPE_TXT.lower() and ("." + end_type).lower() == TYPE_DOC.lower():
        return txt_to_doc(file_path, file_name)
    # txt - docx
    elif ("." + source_type).lower() == TYPE_TXT.lower() and ("." + end_type).lower() == TYPE_DOCX.lower():
        return txt_to_docx(file_path, file_name)
    # docx - txt
    elif ("." + source_type).lower() == TYPE_DOCX.lower() and ("." + end_type).lower() == TYPE_TXT.lower():
        return docx_to_txt(file_path, file_name)
    # doc - txt
    elif ("." + source_type).lower() == TYPE_DOC.lower() and ("." + end_type).lower() == TYPE_TXT.lower():
        return docx_to_txt(file_path, file_name)
    # XLS,XLSX - PDF
    elif ("." + source_type).lower() in common_excel_formats and ("." + end_type).lower() == TYPE_PDF.lower():
        return excel2pdf(file_path, file_name)
    return jsonify({"success": False, "msg": "暂不支持"})


@app.route('/downloadfile', methods=['GET'])
def download_file():
    file_path = request.args.get("filepath")
    filename = get_file_name_with_extension(file_path)
    return send_file(file_path, as_attachment=True, download_name=filename)


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
    app.run("0.0.0.0", "80", False)
    # app.run("localhost", "80", True)
