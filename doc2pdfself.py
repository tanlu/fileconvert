import subprocess
import subprocess
import os
from flask import jsonify
from pdf2docx import Converter
from fileutils import get_file_extension, get_file_name_no_extension, get_file_name_with_extension

UPLOAD_FOLDER = '/data/file/'  # 设置文件上传的目标文件夹
wpath = "D:/test/"
lpath = "/data/file/"
# 文件格式
doc1 = ".doc"
doc2 = ".docx"
pdf1 = ".pdf"
img1 = ".png"
img2 = ".jpeg"


#  ===================================pdf - docx===================================
def convertPdf2Docx(file_path, file_name):
    filePath = pdf2Docx(file_path, file_name)
    re = {"file": filePath, "success": True}
    return jsonify(re)


def pdf2Docx(file_path, file_name):
    # convert pdf to docx
    print(file_path)
    print(file_name)
    cv = Converter(file_path + file_name)
    filename = get_file_name_no_extension(file_name)
    cv.convert(file_path + filename + doc2)  # all pages by default
    cv.close()
    return file_path + filename + doc2


#  ===================================pdf - doc===================================

# pdf - doc
def convertPdf2Doc(file_path, file_name):
    filePath = pdf2Doc(file_path, file_name)
    re = {"file": filePath, "success": True}
    return jsonify(re)


def pdf2Doc(file_path, file_name):
    # convert pdf to docx
    cv = Converter(file_path + file_name)
    filename = get_file_name_no_extension(file_name)
    cv.convert(file_path + filename + doc1)  # all pages by default
    cv.close()
    return file_path + filename + doc1


#  ===================================DOCX - PDF===================================
def docx_to_pdf(file_path, file_name):
    # 检查 LibreOffice 是否安装
    if not os.path.exists("/usr/bin/libreoffice"):
        print("LibreOffice is not installed on the system.")
        return
    # 构建PDF 路径
    filename = get_file_name_no_extension(file_name)
    pdf_path = file_path + filename + pdf1
    # 构造命令参数
    cmd = 'libreoffice --headless --convert-to pdf --outdir {}'.format(os.path.dirname(pdf_path))
    cmd += ' {}'.format(file_path + file_name)

    # 执行命令
    try:
        subprocess.check_call(cmd.split())
        print("Conversion from DOCX to PDF completed successfully.")
        return pdf_path
    except subprocess.CalledProcessError as e:
        print("An error occurred during the conversion: ", e)
