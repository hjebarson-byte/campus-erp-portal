import pymysql

pymysql.install_as_MySQLdb()

# Allow MySQL 8.0 with Django
from django.db.backends.mysql.base import DatabaseWrapper
DatabaseWrapper.check_database_version_supported = lambda self: None
