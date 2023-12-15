from docx2pdf import convert
from pathlib import PurePath


def get_file_extension(file_path):
    # 使用 split() 方法，将文件路径按照 '.' 分割，并取最后一部分作为后缀名
    extension = file_path.split('.')[-2]
    return extension


def get_file_name_without_extension(file_path):
    # 使用 PurePath 封装文件路径
    path = PurePath(file_path)

    # 获取文件名（带后缀）
    file_name_with_extension = path.name

    # 使用 rsplit() 方法，将文件名从右边按照 '.' 分割，最多分割一次
    file_name_without_extension = file_name_with_extension.rsplit('.', 1)[0]

    return file_name_without_extension


def get_file_name_with_extension(file_path):
    # 使用 PurePath 封装文件路径
    path = PurePath(file_path)

    # 获取文件名（带后缀）
    file_name_with_extension = path.name

    return file_name_with_extension

if __name__ == '__main__':
    # convert("C:\\Users\\39435\\Desktop\\天津项目\\档案\\爱数文档\\4-AnyShare5.0开放API错误码说明文档 - 对外.docx",
    #         "C:\\Users\\39435\\Desktop\\天津项目\\档案\\爱数文档\\a.pdf")
    # 示例用法
    file_path = 'D:\\example.docx'
    extension = get_file_name_without_extension(file_path)
    print("文件后缀名:", extension)
    with_ex = get_file_name_with_extension(file_path)
    print("文件后缀名:", with_ex)


def docx2pdf(file_path, file_name):
    convert()