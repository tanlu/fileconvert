from flask import jsonify
from pdf2docx import Converter
from fileutils import get_file_extension, get_file_name_no_extension, get_file_name_with_extension
from docx2pdf import convert

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
def convert_docx_to_pdf(file_path, file_name):
    filename = get_file_name_no_extension(file_name)
    convert(file_path + file_name, file_path + filename + pdf1)
    re = {"file": file_path + filename + pdf1, "success": True}
    return jsonify(re)
