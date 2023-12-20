import logging
from configparser import ConfigParser


class MyLogger:
    def __init__(self, config_file='config.ini'):
        # 读取配置文件
        config = ConfigParser()
        config.read(config_file)

        # 从配置文件获取日志级别和日志文件路径
        log_level = config.get('Logging', 'log_level')

        # 配置日志，将日志同时输出到控制台和文件
        logging.basicConfig(level=log_level,
                            format='%(asctime)s - %(levelname)s - %(message)s - %(filename)s - %(lineno)d',
                            handlers=[
                                logging.FileHandler(config.get('Logging', 'log_file'), mode='w', encoding='utf-8'),
                                logging.StreamHandler()
                            ])

        # 创建日志记录器
        self.logger = logging.getLogger(__name__)

    def log_debug(self, message):
        self.logger.debug(message)

    def log_info(self, message):
        self.logger.info(message)

    def log_warning(self, message):
        self.logger.warning(message)

    def log_error(self, message):
        self.logger.error(message, exc_info=True)

    def log_critical(self, message):
        self.logger.critical(message, exc_info=True)

# 示例用法
# if __name__ == "__main__":
#     my_logger = MyLogger()
#
#     try:
#         # 例如，故意引发一个异常
#         raise ValueError("这是一个故意引发的异常")
#     except ValueError as e:
#         my_logger.log_error('遇到错误:')
#         my_logger.log_critical('遇到严重错误:')
