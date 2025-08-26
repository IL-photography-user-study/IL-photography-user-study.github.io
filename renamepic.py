'''
Author: liaozhilan lzl16975772022@163.com
Date: 2025-08-26 09:49:37
LastEditors: liaozhilan lzl16975772022@163.com
LastEditTime: 2025-08-26 12:04:11
FilePath: \IL-photography - rank\renamepic.py
Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
'''
# import os

# folder_path = r"E:\暑研\IL-photography - rank\src\assets\baselines_final_frames\servo" 
# files = sorted(os.listdir(folder_path)) 

# start_number = 3
# step = 4 

# for i, filename in enumerate(files):
#     ext = os.path.splitext(filename)[1]  
#     new_name = f"{start_number + i*step}{ext}"
#     old_path = os.path.join(folder_path, filename)
#     new_path = os.path.join(folder_path, new_name)
#     os.rename(old_path, new_path)

# print("rename all the photos!")
# # ours:1; human:2; servo:3; toricspace:4

import os

folder_path = r"E:\暑研\IL-photography - rank\src\assets\photo"  # 修改为你的文件夹路径

for filename in os.listdir(folder_path):
    if filename.lower().endswith(".jpeg"):
        base = os.path.splitext(filename)[0]  # 去掉扩展名
        old_path = os.path.join(folder_path, filename)
        new_path = os.path.join(folder_path, base + ".jpg")
        os.rename(old_path, new_path)

print(".jpeg -> .jpg")
