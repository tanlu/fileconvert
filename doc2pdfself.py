import subprocess
from docx import Document
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
# from weasyprint import HTML
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
# def convert_docx_to_pdf(file_path, file_name):
#     # filename = get_file_name_no_extension(file_name)
#     # docx2pdf.convert(file_path + file_name, file_path + filename + pdf1)
#     # re = {"file": file_path + filename + pdf1, "success": True}
#     # return jsonify(re)
#     # cmd = "soffice --headless --invisible --convert-to pdf " + file_name
#     cmd = "libreoffice --convert-to pdf --outdir " + file_path + " " + file_path + file_name
#     p = subprocess.call(cmd, shell=True)
#     for line in p.stdout.readlines():
#         print("returned_output:", line)
#     p.wait()
#     filename = get_file_name_no_extension(file_name)
#     re = {"file": file_path + filename + pdf1, "success": True}
#     return jsonify(re)


#  ===================================DOC - PDF===================================
# def convert_doc_to_pdf(file_path, file_name):
#     cmd = "soffice --headless --invisible --convert-to pdf " + file_name
#     p = subprocess.call(cmd, shell=True)
#     for line in p.stdout.readlines():
#         print("returned_output:", line)
#     p.wait()
#     filename = get_file_name_no_extension(file_name)
#     re = {"file": file_path + filename + pdf1, "success": True}
#     return jsonify(re)
#     # filename = get_file_name_no_extension(file_name)
#     # doc2pdf.convert(file_path + file_name, file_path + filename + pdf1)
#     # re = {"file": file_path + filename + pdf1, "success": True}
#     # return jsonify(re)

import subprocess
import os


def docx_to_pdf(docx_path, pdf_path):
    # 检查 LibreOffice 是否安装
    if not os.path.exists("/usr/bin/libreoffice"):
        print("LibreOffice is not installed on the system.")
        return

    # 构造命令参数
    cmd = 'libreoffice7.3 --headless --convert-to pdf --outdir {}'.format(os.path.dirname(pdf_path))
    cmd += ' {}'.format(docx_path)

    # 执行命令
    try:
        subprocess.check_call(cmd.split())
        print("Conversion from DOCX to PDF completed successfully.")
    except subprocess.CalledProcessError as e:
        print("An error occurred during the conversion: ", e)


def convert_docx_to_pdf2(docx_filename, pdf_filename):
    # 读取DOCX文档
    doc = Document(docx_filename)

    # 将DOCX文档内容转换为HTML
    html_content = ""
    for paragraph in doc.paragraphs:
        html_content += f"<p>{paragraph.text}</p>"

    # 生成PDF
    HTML(string=html_content).write_pdf(pdf_filename)


if __name__ == '__main__':
    docxpath = 'C:\\Users\\39435\\Desktop\\园春.docx'
    pdfpath = 'C:\\Users\\39435\\Desktop\\园春12.pdf'
    convert_docx_to_pdf2(docxpath, pdfpath)
