from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image
from pdf2image import convert_from_path


# 将多种，多张图片合成到一个PDF中
def images_to_pdf(image_paths, output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=letter)
    for image_path in image_paths:
        # 获取图片大小，并根据图片大小设置PDF页面大小
        img = Image.open(image_path)
        width, height = img.size
        c.setPageSize((width, height))

        # 将图片绘制到PDF页面上
        c.drawInlineImage(image_path, 0, 0, width, height)

        # 添加新的页面
        c.showPage()

    c.save()


# 将单张图片转成PDF
def image_to_pdf(image_path, pdf_path):
    c = canvas.Canvas(pdf_path, pagesize=letter)
    # 获取图片大小，并根据图片大小设置PDF页面大小
    img = Image.open(image_path)
    width, height = img.size
    c.setPageSize((width, height))
    # 将图片绘制到PDF页面上
    c.drawInlineImage(image_path, 0, 0, width, height)
    c.save()


#  pdf 转成 图片,并将所有的图片放到一个目录里面
def pdf_to_images(pdf_path, output_folder, image_type):
    # 将PDF文件转换为图像列表
    images = convert_from_path(pdf_path)

    # 保存每个图像到输出文件夹
    for i, image in enumerate(images):
        image_path = f"{output_folder}/page_{i + 1}.{image_type}"
        image.save(image_path, "PNG")
