import os
import subprocess
from flask import jsonify

from fileutils import get_file_name_no_extension

TYPE_PDF = ".pdf"
TYPE_XLS = ".xls"
TYPE_XLSX = ".xlsx"


def excel2pdf(file_path, file_name):
    # 检查 LibreOffice 是否安装
    if not os.path.exists("/usr/bin/libreoffice"):
        print("LibreOffice is not installed on the system.")
        return
    # 构建PDF 路径
    filename = get_file_name_no_extension(file_name)
    pdf_path = file_path + filename + TYPE_PDF
    # 构造命令参数
    cmd = 'libreoffice --headless --convert-to pdf --outdir {}'.format(os.path.dirname(pdf_path))
    cmd += ' {}'.format(file_path + file_name)

    # 执行命令
    try:
        subprocess.check_call(cmd.split())
        print("Conversion from DOCX to PDF completed successfully.")
        re = {"file": pdf_path, "success": True}
        return jsonify(re)
    except Exception as e:
        print("An error occurred during the conversion: ", e)

# 调用函数
# pdf_to_excel('input.pdf', 'output.xlsx')
# C:\Users\39435\Desktop\a.xls
# if __name__ == '__main__':
#     excel2pdf('C:\\Users\\39435\\Desktop\\a.xls', 'C:\\Users\\39435\\Desktop\\a.pdf')
# excel_to_pdf2('C:\\Users\\39435\\Desktop\\a.xlsx', 'C:\\Users\\39435\\Desktop\\a.pdf')
