import os
import shutil

base = os.path.dirname(os.path.abspath(__file__))
extension_dir = os.path.join(base, "AmqExtension")
amq_extension_files = [
    "amqstats.js",
    "anilist_32x32.png",
    "background.js",
    "background.png",
    "bootstrap.min.css",
    "bootstrap.min.js",
    "jquery.js",
    "manifest.json",
    "messagepassing.js",
    "page.html",
    "popup.css",
    "popup.html",
    "popup.js",
    "stats.js"
]


def clean_extension_dir():
    if os.path.exists(extension_dir):
        shutil.rmtree(extension_dir)


def clean_zip():
    if os.path.exists(f"{extension_dir}.zip"):
        os.remove(f"{extension_dir}.zip")


def create_populate_extension_dir():
    os.mkdir(extension_dir)

    for filename in amq_extension_files:
        filepath = os.path.join(base, filename)
        shutil.copy(filepath, extension_dir)

    shutil.make_archive(f"{extension_dir}", "zip", extension_dir)


if __name__ == '__main__':
    clean_extension_dir()
    clean_zip()
    create_populate_extension_dir()
    clean_extension_dir()
