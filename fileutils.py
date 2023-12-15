from pathlib import PurePath


# 获取文件后缀
def get_file_extension(file_path):
    # 使用 split() 方法，将文件路径按照 '.' 分割，并取最后一部分作为后缀名
    extension = file_path.split('.')[-1]
    return extension


# 获取带后缀的文件名
def get_file_name_with_extension(file_path):
    # 使用 PurePath 封装文件路径
    path = PurePath(file_path)

    # 获取文件名（带后缀）
    file_name_with_extension = path.name

    return file_name_with_extension


# 没有后缀的文件名
def get_file_name_no_extension(file_path):
    # 使用 PurePath 封装文件路径
    path = PurePath(file_path)

    # 获取文件名（带后缀）
    file_name_with_extension = path.name

    # 使用 rsplit() 方法，将文件名从右边按照 '.' 分割，最多分割一次
    file_name_without_extension = file_name_with_extension.rsplit('.', 1)[0]

    return file_name_without_extension
