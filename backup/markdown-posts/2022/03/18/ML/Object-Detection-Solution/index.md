---
title: "Object Detection Solution"
date: "2022-03-18T05:48:30.000Z"
updated: "2023-07-29T06:30:36.559Z"
slug: "ML/Object-Detection-Solution"
permalink: "/2022/03/18/ML/Object-Detection-Solution/"
categories: ["技能-修行-进步-ML"]
tags: ["物体检测"]
---
Reference - HuaWei Clound - ModeArts,网站被删除 To analyze the performance of object detection model, there are two main parts to do: (1) 误检分析，False positive analysis; (2) 漏检分析，False negative analysis. 同样的， 对于误检分析和漏检分析，我们可以把数据划分4个部分，（1）TP(标注漏标，但实际能够检测成功的目标)；（2）Positio false positive（预测结果类别正确，但是和GT的iou不满足；（3）Class false positive（预测结果和GT的iou满足，但是类别不正确）；（4）Background false postive（背景误检） 把TP加回原来的TP，然后就可以画一个饼图出来。 如果类别误检占的比重高，建议训练的时候使用multi-scale，多尺度训练。 如果位置误检占的比重高，建议训练的时候关注IOU-loss，建议使用DIOU-loss。 如果背景误检占的比重高，建议训练的时候关注bounding box loss，通常用的是smooth-L1 loss，可以使用balanced loss。 如果数据中的类别框高比差异较大，比如人是竖立的矩形，车是横向的矩形，需要考虑到模型对框高比的敏感度，建议模型backbone采用FPN结构。 模型对检测目标的亮度敏感（如下图），建议使用DropBlock 模型对检测目标的清晰度敏感个（如下图），建议使用DropBlock 模型对检测目标的面积大小敏感，例如，检测头盔类别，而头盔在图片中的框大多数都是小的，另外一个类别是挖掘机，挖掘机在图片中的框大多数都是大的，建议使用balanced loss。
