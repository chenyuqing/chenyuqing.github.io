---
title: "comparison of MTCNN on RK3399"
date: "2021-03-08T04:04:23.000Z"
updated: "2020-06-23T01:08:20.000Z"
slug: "ML/comparison-of-MTCNN-on-RK3399"
permalink: "/2021/03/08/ML/comparison-of-MTCNN-on-RK3399/"
categories: []
tags: ["mtcnn", "RK3399"]
---
date, 2019-03-08 12:04:23 在RK板上运行mtcnn的方案1. 运行caffe版本的mtcnn 在RK上安装OPENCL的Caffe(环境配置) 先装OPENBLAS，后装Caffe 中间遇到ViennaCL库没找到，但是安装出错 在RK板上运行python版的mtcnn-caffe 在RK板上运行C++版的mtcnn-caffe 2. 运行tensorflow-lite版本的mtcnn 在RK板上安装tensorflow-lite(环境配置) 这一部分的教程较少，安装出错 把mtcnn的模型转换成lite模型 运行mtcnn 3. 测试mtcnn(tensorflow)在不同机器上的fps星期五, 08. 三月 2019 11:32上午 test_video : outpy4.avi image size : 480 x 640 fps CPU GPU HP_Zhan(MX150)2G 5.05 12.04 JTx2 (Pascal GPU) 8G 4.00 6.23 RK3399 (No GPU) 1.52 None image size : 216 x 512 fps CPU GPU HP_Zhan(MX150)/2G 10.45 22.96 JTx2 (Pascal GPU) /8G 8.64 11.89 RK3399 (No GPU) 2.81 None 4. 优化mtcnn的思路reference : MTCNN优化和另类用法 MTCNN速度的瓶颈 图片越大Pnet耗时也就越大。 人脸越多Onet和Rnet耗时越大。 噪点比较多的夜晚图像会导致Pnet误检测增多。 从input_size入手，缩小input_size可以加快速度，如：480x640 -> 216 x 512，可以提高40%左右的速率 换caffe框架，想办法把RK板上的GPU利用起来实现加速 5. caffe2 VS tensorflow (MTCNN) 在HP-Zhan-Tim上跑GPU，每个流程跑3次 Framwork tensorflow caffe2 FPS GPU-1/GPU-2/GPU-3 GPU-1/GPU-2/GPU-3 480x640 13.41/13.08/12.75 13.69/13.73/13.58 216X512 22.43/22.62/23.09 30.01/29.25/29.82
